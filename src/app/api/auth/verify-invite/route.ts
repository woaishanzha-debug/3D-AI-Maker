import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ message: '请输入激活码' }, { status: 400 });
        }

        let invite = await prisma.invitationCode.findUnique({
            where: { code: code.toUpperCase() },
        });

        // 演示逻辑：如果输入 ABC123 且数据库不存在，自动关联一个机构创建一个
        if (!invite && code.toUpperCase() === 'ABC123') {
            let org = await prisma.organization.findFirst();
            if (!org) {
                org = await prisma.organization.create({
                    data: { name: '演示教育中心' }
                });
            }

            invite = await prisma.invitationCode.create({
                data: {
                    code: 'ABC123',
                    type: 'STUDENT',
                    organizationId: org.id,
                    maxUses: 999
                }
            });
        }

        if (!invite) {
            return NextResponse.json({ message: '激活码不存在' }, { status: 404 });
        }

        if (invite.maxUses > 0 && invite.usedCount >= invite.maxUses) {
            return NextResponse.json({ message: '激活码已被使用' }, { status: 400 });
        }


        return NextResponse.json({
            success: true,
            type: invite.type,
            organizationId: invite.organizationId
        });

    } catch (error) {
        console.error('Verify Invite Error:', error);
        return NextResponse.json({ message: '服务器错误' }, { status: 500 });
    }
}
