import { NextResponse } from 'next/server';

export async function POST() {
    // This endpoint is deprecated in favor of new Server Actions
    return NextResponse.json({ message: 'Deprecated' }, { status: 410 });
}
