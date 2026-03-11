"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function assignCourseToTeacher(
  orgId: string,
  teacherId: string,
  courseId: string,
  seats: number
) {
  if (seats <= 0) {
    throw new Error("分配名额必须大于 0");
  }

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Find the course and its series
    const course = await tx.course.findUnique({
      where: { id: courseId },
      include: { series: true },
    });

    if (!course) {
      throw new Error("课程不存在");
    }

    // 2. Find the organization's license for this course series
    const orgLicense = await tx.orgLicense.findFirst({
      where: {
        orgId: orgId,
        seriesId: course.seriesId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!orgLicense) {
      throw new Error("该机构未获得该课程体系的有效授权");
    }

    // 3. Check if the organization has enough seats
    const remainingSeats = orgLicense.totalSeats - orgLicense.usedSeats;
    if (remainingSeats < seats) {
      throw new Error(`机构名额不足。剩余: ${remainingSeats}, 请求: ${seats}`);
    }

    // 4. Check if teacher is part of the organization and has TEACHER role
    const teacher = await tx.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.orgId !== orgId || teacher.role !== "TEACHER") {
      throw new Error("无效的教师ID或教师不属于该机构");
    }

    // 5. Update OrgLicense used seats
    await tx.orgLicense.update({
      where: { id: orgLicense.id },
      data: {
        usedSeats: {
          increment: seats,
        },
      },
    });

    // 6. Upsert TeacherLicense
    const existingTeacherLicense = await tx.teacherLicense.findFirst({
      where: {
        teacherId: teacherId,
        courseId: courseId
      }
    });

    if (existingTeacherLicense) {
      return await tx.teacherLicense.update({
        where: { id: existingTeacherLicense.id },
        data: {
          allocatedSeats: {
            increment: seats
          }
        }
      });
    } else {
      return await tx.teacherLicense.create({
        data: {
          teacherId,
          courseId,
          allocatedSeats: seats,
        },
      });
    }
  });
}

export async function generateInvitationCode(
  teacherId: string,
  courseId: string,
  maxUses: number
) {
  if (maxUses <= 0) {
    throw new Error("使用次数必须大于 0");
  }

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Find TeacherLicense for this course
    const teacherLicense = await tx.teacherLicense.findFirst({
      where: {
        teacherId: teacherId,
        courseId: courseId,
      },
    });

    if (!teacherLicense) {
      throw new Error("教师未获得该课程的授权");
    }

    // 2. Check if the teacher has enough seats allocated
    // Calculate currently pending codes potential usage
    const activeCodes = await tx.invitationCode.findMany({
      where: {
        teacherId: teacherId,
        courseId: courseId
      }
    });

    // Explicitly typing the accumulator and current value for the reduce function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const potentialUsedSeats = activeCodes.reduce((acc: number, code: any) => acc + (code.maxUses - code.usedCount), 0);
    const availableSeats = teacherLicense.allocatedSeats - teacherLicense.usedSeats - potentialUsedSeats;

    if (availableSeats < maxUses) {
      throw new Error(`教师名额不足。可用名额: ${availableSeats}, 请求名额: ${maxUses}`);
    }

    // 3. Generate a unique code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    // 4. Create InvitationCode
    return await tx.invitationCode.create({
      data: {
        code,
        teacherId,
        courseId,
        maxUses,
      },
    });
  });
}

export async function registerStudentWithCode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  studentData: any,
  code: string
) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Find the invitation code
    const invitationCode = await tx.invitationCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        teacher: true,
      },
    });

    if (!invitationCode) {
      throw new Error("邀请码无效");
    }

    // 2. Check if the code has uses left
    if (invitationCode.usedCount >= invitationCode.maxUses) {
      throw new Error("邀请码已被使用完毕");
    }

    // 3. Find TeacherLicense
    const teacherLicense = await tx.teacherLicense.findFirst({
      where: {
        teacherId: invitationCode.teacherId,
        courseId: invitationCode.courseId,
      },
    });

    if (!teacherLicense) {
      throw new Error("相关的教师授权不存在");
    }

    if (teacherLicense.usedSeats >= teacherLicense.allocatedSeats) {
      throw new Error("教师名额已满");
    }

    // 4. Increment usedCount on InvitationCode
    await tx.invitationCode.update({
      where: { id: invitationCode.id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });

    // 5. Increment usedSeats on TeacherLicense
    await tx.teacherLicense.update({
      where: { id: teacherLicense.id },
      data: {
        usedSeats: {
          increment: 1,
        },
      },
    });

    const generatedUsername = studentData.username || `STU_${Math.random().toString(36).substring(2, 8)}`.toUpperCase();

    // 6. Create Student User
    return await tx.user.create({
      data: {
        ...studentData,
        username: generatedUsername,
        role: "STUDENT",
        orgId: invitationCode.teacher.orgId,
        teacherId: invitationCode.teacherId,
        usedInvitationCodeId: invitationCode.id,
      },
    });
  });
}
