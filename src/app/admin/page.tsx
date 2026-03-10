import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 服务器动作：创建一个完整的机构体系
 * 层级：Organization -> Principal (1) -> Teachers (count) -> Students (quota per teacher)
 */
async function createOrgAndCodes(formData: FormData) {
    'use server'
    const orgName = formData.get('orgName') as string;
    const loginUsername = formData.get('loginUsername') as string;
    const initialPassword = formData.get('initialPassword') as string;
    const teacherCount = parseInt(formData.get('count') as string || '1');
    const studentQuota = parseInt(formData.get('studentQuota') as string || '0');

    if (!orgName || !loginUsername || !initialPassword) return;
    if (!/^[a-zA-Z0-9_-]+$/.test(loginUsername)) return;

    // 1. 创建机构
    const org = await prisma.organization.create({
        data: { name: orgName }
    });

    // 2. 创建校长账号 (Principal)
    const principalId = `pr${Math.random().toString(36).substring(2, 15)}`;
    const principalCode = loginUsername.toUpperCase();
    await (prisma as any).$executeRawUnsafe(
        `INSERT INTO "InvitationCode" ("id", "code", "type", "organizationId", "status", "initialPassword", "createdAt") 
         VALUES (?, ?, 'PRINCIPAL', ?, 'ACTIVE', ?, CURRENT_TIMESTAMP)`,
        principalId, principalCode, org.id, initialPassword
    );

    // 3. 创建教师及名下学生
    for (let i = 0; i < teacherCount; i++) {
        const tId = `tr${Math.random().toString(36).substring(2, 15)}`;
        const tCode = `${loginUsername}_T${i + 1}`.toUpperCase();

        await (prisma as any).$executeRawUnsafe(
            `INSERT INTO "InvitationCode" ("id", "code", "type", "organizationId", "parentId", "status", "initialPassword", "createdAt") 
             VALUES (?, ?, 'TEACHER', ?, ?, 'ACTIVE', ?, CURRENT_TIMESTAMP)`,
            tId, tCode, org.id, principalId, initialPassword
        );

        // 为该老师分发学生
        for (let j = 0; j < studentQuota; j++) {
            const sId = `st${Math.random().toString(36).substring(2, 15)}`;
            const sCode = `S-${tCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            await (prisma as any).$executeRawUnsafe(
                `INSERT INTO "InvitationCode" ("id", "code", "type", "organizationId", "parentId", "status", "createdAt") 
                 VALUES (?, ?, 'STUDENT', ?, ?, 'ACTIVE', CURRENT_TIMESTAMP)`,
                sId, sCode, org.id, tId
            );
        }
    }
    revalidatePath('/admin');
}

/**
 * 服务器动作：向现有机构扩容老师
 */
async function addTeacherToOrg(formData: FormData) {
    'use server'
    const orgId = formData.get('orgId') as string;
    const loginUsername = formData.get('loginUsername') as string;
    const initialPassword = formData.get('initialPassword') as string;
    const studentQuota = parseInt(formData.get('studentQuota') as string || '0');

    if (!orgId || !loginUsername || !initialPassword) return;

    const tId = `tr${Math.random().toString(36).substring(2, 15)}`;
    const tCode = loginUsername.toUpperCase();

    // 寻找该机构下的校长账号作为父级
    const principal = await (prisma as any).invitationCode.findFirst({
        where: { organizationId: orgId, type: 'PRINCIPAL' }
    });

    await (prisma as any).$executeRawUnsafe(
        `INSERT INTO "InvitationCode" ("id", "code", "type", "organizationId", "parentId", "status", "initialPassword", "createdAt") 
         VALUES (?, ?, 'TEACHER', ?, ?, 'ACTIVE', ?, CURRENT_TIMESTAMP)`,
        tId, tCode, orgId, principal?.id || null, initialPassword
    );

    for (let j = 0; j < studentQuota; j++) {
        const sId = `st${Math.random().toString(36).substring(2, 15)}`;
        const sCode = `S-${tCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        await (prisma as any).$executeRawUnsafe(
            `INSERT INTO "InvitationCode" ("id", "code", "type", "organizationId", "parentId", "status", "createdAt") 
             VALUES (?, ?, 'STUDENT', ?, ?, 'ACTIVE', CURRENT_TIMESTAMP)`,
            sId, sCode, orgId, tId
        );
    }
    revalidatePath('/admin');
}

/**
 * 状态切换：支持记录操作者
 */
async function toggleCodeStatus(codeId: string, currentStatus: string, operatorName: string = 'ADMIN') {
    'use server'
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    // 如果是停用，记录停用人；如果是启用，清空停用人
    const disabledBy = newStatus === 'DISABLED' ? operatorName : null;

    await (prisma as any).$executeRawUnsafe(
        `UPDATE "InvitationCode" SET "status" = ?, "disabledBy" = ? WHERE "id" = ?`,
        newStatus, disabledBy, codeId
    );
    revalidatePath('/admin');
}

async function deleteOrganization(orgId: string) {
    'use server'
    await (prisma as any).$executeRawUnsafe(`DELETE FROM "InvitationCode" WHERE "organizationId" = ?`, orgId);
    await (prisma as any).organization.delete({ where: { id: orgId } });
    revalidatePath('/admin');
}

async function deleteCode(codeId: string) {
    'use server'
    // 删除该节点及其所有子节点 (例如删除老师会连带删除学生)
    await (prisma as any).$executeRawUnsafe(`DELETE FROM "InvitationCode" WHERE "parentId" = ?`, codeId);
    await (prisma as any).$executeRawUnsafe(`DELETE FROM "InvitationCode" WHERE "id" = ?`, codeId);
    revalidatePath('/admin');
}

export default async function AdminPage() {
    const session = await getServerSession(authOptions) as any;
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
        redirect('/login');
    }

    const organizations = await prisma.organization.findMany({
        include: {
            invitationCodes: {
                orderBy: { createdAt: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const pendingWorks = await prisma.post.findMany({
        where: { status: 'PENDING' },
        include: { author: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <AdminDashboard
            organizations={organizations}
            pendingWorks={pendingWorks}
            actions={{
                createOrgAndCodes,
                addTeacherToOrg,
                toggleCodeStatus,
                deleteOrganization,
                deleteCode
            }}
        />
    );
}
