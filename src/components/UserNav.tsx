'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User as UserIcon } from 'lucide-react';

export function UserNav() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === 'loading') {
        return <div className="h-9 w-24 bg-slate-50 animate-pulse rounded-lg border border-slate-100"></div>;
    }

    if (session?.user) {
        return (
            <div className="flex items-center gap-2">
                <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-100 transition-all font-sans">
                    <UserIcon className="w-4 h-4" />
                    <span className="text-sm font-black truncate max-w-[100px] uppercase tracking-tighter" title={session.user.name || "User"}>
                        {session.user.name}
                    </span>
                </Link>
                <button
                    onClick={() => {
                        signOut({ redirect: false }).then(() => {
                            router.push('/');
                        });
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="退出登录"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <Link href="/login">
            <button className="px-5 py-2.5 text-xs font-black bg-slate-900 text-white hover:bg-black rounded-xl transition-all shadow-lg shadow-slate-200 uppercase tracking-widest flex items-center gap-2 active:scale-95 cursor-pointer">
                Portal Access
            </button>
        </Link>
    );
}

