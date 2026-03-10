import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { toolType, creditCost } = await req.json();

        if (!toolType || creditCost === undefined) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // 1. 获取最新用户信息
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.credits < creditCost) {
            return NextResponse.json({ error: '余额不足，请联系机构充值' }, { status: 403 });
        }

        // 2. 事务处理：扣费并记录历史
        const result = await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { credits: { decrement: creditCost } }
            }),
            prisma.toolHistory.create({
                data: {
                    userId: user.id,
                    toolType,
                    creditCost
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            newCredits: result[0].credits,
            historyId: result[1].id
        });

    } catch (error) {
        console.error('Tool log error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
