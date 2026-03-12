import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId, role, orgId } = session.user as any;

    if (role === 'SUPER_ADMIN') {
        return NextResponse.json({ seriesIds: ['ALL'], courseIds: ['ALL'] });
    }

    let authorizedSeriesIds: string[] = [];
    let authorizedCourseIds: string[] = [];

    try {
        if (role === 'ORG_ADMIN' && orgId) {
        // 校长：获取机构购买的所有系列
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const orgLicenses = await (prisma as any).orgLicense.findMany({
            where: { orgId }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        authorizedSeriesIds = orgLicenses.map((lic: any) => lic.seriesId);
    } else if (role === 'TEACHER') {
        // 老师：获取分配给自己个人的课程
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const teacherLicenses = await (prisma as any).teacherLicense.findMany({
            where: { teacherId: userId }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        authorizedCourseIds = teacherLicenses.map((lic: any) => lic.courseId);

        // 老师也可能继承机构的系列权限（可选逻辑，这里简单起见，老师只能看到分配给自己的具体课程所属系列）
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const courses = await (prisma as any).course.findMany({
            where: { id: { in: authorizedCourseIds } }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        authorizedSeriesIds = Array.from(new Set(courses.map((c: any) => c.seriesId)));
    } else if (role === 'STUDENT') {
        // 学生：查所属激活码对应的课程权限
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = await (prisma as any).user.findUnique({
            where: { id: userId },
            include: {
                usedInvitationCode: {
                    include: { course: true }
                }
            }
        });
        if (user?.usedInvitationCode?.courseId) {
            authorizedCourseIds = [user.usedInvitationCode.courseId];
            authorizedSeriesIds = [user.usedInvitationCode.course.seriesId];
        }
    }

        return NextResponse.json({
            seriesIds: authorizedSeriesIds,
            courseIds: authorizedCourseIds
        });
    } catch (error) {
        console.error('CRITICAL: License fetch error:', error);
        // Fallback for emergency or errors: super admin check already handled above, 
        // so this is for other roles
        return NextResponse.json({ seriesIds: [], courseIds: [], error: 'Internal Server Error' }, { status: 500 });
    }
}
