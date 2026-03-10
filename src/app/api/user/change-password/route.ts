import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: '未授权' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { password } = await req.json();

        if (!password || password.length < 6) {
            return NextResponse.json({ message: '密码长度至少为 6 位' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Change Password Error:', error);
        return NextResponse.json({ message: '服务器错误' }, { status: 500 });
    }
}
