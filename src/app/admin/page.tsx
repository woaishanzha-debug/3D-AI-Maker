import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

/**
 * 服务器动作：创建一个完整的机构体系
 * 层级：Organization -> ORG_ADMIN (Principal) -> TEACHER (linked to principal) -> InvitationCode (Student)
 */
async function createOrgAndCodes(formData: FormData) {
    'use server'
    const orgName = formData.get('orgName') as string;
    const loginUsername = formData.get('loginUsername') as string;
    const initialPassword = formData.get('initialPassword') as string;
    const teacherCount = parseInt(formData.get('count') as string || '1');
    const studentQuota = parseInt(formData.get('studentQuota') as string || '0');

    if (!orgName || !loginUsername || !initialPassword) return;

    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    // 1. 创建机构
    const org = await prisma.organization.create({
        data: { name: orgName }
    });

    // 2. 创建校长账号 (ORG_ADMIN)
    const principal = await prisma.user.create({
        data: {
            username: loginUsername,
            password: hashedPassword,
            initialPassword: initialPassword, // 存储明文用于显示
            name: `${orgName} 校长`,
            role: 'ORG_ADMIN',
            orgId: org.id,
            credits: 5000
        } as any // eslint-disable-line @typescript-eslint/no-explicit-any
    });

    // 获取一个默认课程用于关联学生激活码
    const defaultCourse = await prisma.course.findFirst();

    // 3. 创建教师及名下学生激活码
    if (defaultCourse) {
        for (let i = 0; i < teacherCount; i++) {
            const teacherUsername = `${loginUsername}_T${i + 1}`.toUpperCase();
            const teacher = await prisma.user.create({
                data: {
                    username: teacherUsername,
                    password: hashedPassword,
                    initialPassword: initialPassword,
                    name: `${orgName} 讲师 ${i + 1}`,
                    role: 'TEACHER',
                    orgId: org.id,
                    teacherId: principal.id, // 关联到校长
                    credits: 1000
                } as any // eslint-disable-line @typescript-eslint/no-explicit-any
            });

            // 为该老师创建学生激活码 (InvitationCode)
            for (let j = 0; j < studentQuota; j++) {
                const sCode = `S-${teacherUsername}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                await prisma.invitationCode.create({
                    data: {
                        code: sCode,
                        teacherId: teacher.id,
                        courseId: defaultCourse.id,
                        maxUses: 1,
                        initialPassword: '无' // 学生使用码直接激活
                    } as any // eslint-disable-line @typescript-eslint/no-explicit-any
                });
            }
        }
    }

    revalidatePath('/admin');
}

/**
 * 状态切换：更新用户状态
 */
async function toggleCodeStatus(id: string, currentStatus: string, operator: string = 'Admin') {
    'use server'
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    // 尝试更新 User
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).user.update({
            where: { id },
            data: {
                status: newStatus,
                disabledBy: newStatus === 'DISABLED' ? operator : null
            }
        });
    } else {
        // 尝试更新 InvitationCode
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).invitationCode.update({
            where: { id },
            data: {
                status: newStatus,
                disabledBy: newStatus === 'DISABLED' ? operator : null
            }
        });
    }
    revalidatePath('/admin');
}

/**
 * 为机构分配课程体系授权
 */
async function allocateCourseToOrg(formData: FormData) {
    'use server'
    const orgId = formData.get('orgId') as string;
    const seriesId = formData.get('seriesId') as string;
    const seats = parseInt(formData.get('seats') as string || '100');

    if (!orgId || !seriesId) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).orgLicense.create({
        data: {
            orgId,
            seriesId,
            totalSeats: seats,
            usedSeats: 0,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 默认一年有效期
        }
    });

    revalidatePath('/admin');
}

async function deleteOrganization(orgId: string) {
    'use server'
    const users = await prisma.user.findMany({ where: { orgId } as any });
    const userIds = users.map(u => u.id);

    // 1. Break User-to-InvitationCode and User-to-User circular references
    await prisma.user.updateMany({
        where: { orgId } as any,
        data: { usedInvitationCodeId: null, teacherId: null } as any
    });

    // 2. Clean up user dependencies
    await (prisma as any).post.deleteMany({ where: { authorId: { in: userIds } } });
    await (prisma as any).toolHistory.deleteMany({ where: { userId: { in: userIds } } });
    await (prisma as any).completion.deleteMany({ where: { userId: { in: userIds } } });
    await (prisma as any).teacherLicense.deleteMany({ where: { teacherId: { in: userIds } } });

    // 3. Delete InvitationCodes created by teachers in this org
    await (prisma as any).invitationCode.deleteMany({
        where: { teacherId: { in: userIds } }
    });

    // 4. Delete Users
    await prisma.user.deleteMany({ where: { orgId } as any });

    // 5. Delete OrgLicenses
    await (prisma as any).orgLicense.deleteMany({ where: { orgId } });

    // 6. Delete the Organization
    await prisma.organization.delete({ where: { id: orgId } });

    revalidatePath('/admin');
}

async function deleteCode(id: string) {
    'use server'
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
        if (user.role === 'TEACHER') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (prisma as any).invitationCode.deleteMany({ where: { teacherId: id } });
        }
        await prisma.user.delete({ where: { id } });
    } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).invitationCode.delete({ where: { id } });
    }
    revalidatePath('/admin');
}

// 占位
async function addTeacherToOrg() {
    'use server'
    console.log("Add teacher logic should be moved to OrgMatrix page");
}

export default async function AdminPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions) as any;
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
        redirect('/login');
    }

    const organizations = await prisma.organization.findMany({
        include: {
            users: {
                include: {
                    createdCodes: {
                        include: {
                            course: true
                        }
                    }
                }
            },
            orgLicenses: {
                include: {
                    series: true
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orderBy: { createdAt: 'desc' } as any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any[];

    // 为了兼容 CodeTree，我们将所有关联的 invitationCodes 提取并合并
    const transformedOrgs = organizations.map(org => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allInvitationCodes = (org.users || []).flatMap((u: any) => u.createdCodes || []);
        return {
            ...org,
            users: [...(org.users || []), ...allInvitationCodes]
        };
    });

    const pendingWorks = await prisma.post.findMany({
        where: { status: 'PENDING' },
        include: { author: true },
        orderBy: { createdAt: 'desc' }
    });

    const allSeries = await prisma.courseSeries.findMany({
        include: { courses: true }
    });

    return (
        <AdminDashboard
            organizations={transformedOrgs}
            pendingWorks={pendingWorks}
            courseSeries={allSeries}
            actions={{
                createOrgAndCodes,
                addTeacherToOrg,
                toggleCodeStatus,
                deleteOrganization,
                deleteCode,
                allocateCourseToOrg
            }}
        />
    );
}
