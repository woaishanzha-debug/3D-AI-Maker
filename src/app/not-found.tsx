import Link from 'next/link';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden py-24 px-4 text-center">
            <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>

            <div className="max-w-md w-full glass-panel relative p-8 md:p-12 shadow-2xl z-10 border-t-4 border-t-accent">
                <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8 mx-auto text-accent shadow-inner animate-pulse">
                    <Lock className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-black mb-4 text-foreground">访问受限</h1>
                <p className="text-foreground/60 mb-10 text-sm leading-relaxed">
                    该区域属于<b className="text-foreground">普惠AI创客教学管理系统</b>的内部保护频道，仅向签约机构与授权用户开放。
                </p>

                <div className="flex flex-col gap-4">
                    <Link href="/login" className="w-full py-4 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                        立即登录开启授权通道 <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link href="/" className="text-sm font-bold text-foreground/40 hover:text-foreground transition-colors">
                        返回平台首页
                    </Link>
                </div>

                <div className="mt-12 pt-6 border-t border-border flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-accent/60">
                        <ShieldAlert className="w-4 h-4" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Security Protocol Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
