import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId, lessonId } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const completion = await prisma.completion.upsert({
            where: {
                userId_courseId_lessonId: {
                    userId: user.id,
                    courseId,
                    lessonId
                }
            },
            update: {},
            create: {
                userId: user.id,
                courseId,
                lessonId
            }
        });

        return NextResponse.json({ success: true, completion });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId, lessonId } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        await prisma.completion.delete({
            where: {
                userId_courseId_lessonId: {
                    userId: user.id,
                    courseId,
                    lessonId
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "服务器异常" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json([]);
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! }
        });

        if (!user) return NextResponse.json([]);

        const completions = await prisma.completion.findMany({
            where: { userId: user.id }
        });

        return NextResponse.json(completions);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}
