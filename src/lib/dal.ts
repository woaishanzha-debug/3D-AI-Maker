import { prisma } from "./prisma";

/**
 * Verifies if a student has access to a specific course.
 * Access is granted if the student's teacher has a valid TeacherLicense for the course.
 *
 * @param studentId The ID of the student.
 * @param courseId The ID of the course.
 * @returns true if the student has access, false otherwise.
 */
export async function verifyStudentCourseAccess(
  studentId: string,
  courseId: string
): Promise<boolean> {
  // Find the student and their associated teacher
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { teacherId: true, role: true },
  });

  if (!student || student.role !== "STUDENT" || !student.teacherId) {
    return false;
  }

  // Check if the teacher has a valid license for the course
  // The license is valid if the teacher has it. (We assume here that having the license means access)
  const teacherLicense = await prisma.teacherLicense.findFirst({
    where: {
      teacherId: student.teacherId,
      courseId: courseId,
    },
  });

  return !!teacherLicense;
}
