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

        const { title, description, coverImageUrl, school, teacher } = await req.json();

        if (!title || !coverImageUrl) {
            return NextResponse.json({ error: 'Title and Image are required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const post = await prisma.post.create({
            data: {
                authorId: user.id,
                title,
                description,
                coverImageUrl,
                school,
                teacher,
                status: 'PENDING',
                likesCount: 0
            }
        });

        return NextResponse.json({ success: true, post });

    } catch (error) {
        console.error('Post creation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { name: true }
                }
            }
        });
        return NextResponse.json(posts);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}
