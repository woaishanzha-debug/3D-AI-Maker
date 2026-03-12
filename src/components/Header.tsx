'use client';

import Link from 'next/link';
import { Box, Image as ImageIcon, ShieldAlert, BadgeCheck, Cpu, Layers, Zap, LogIn, Trophy, Menu, X } from 'lucide-react';
import { UserNav } from './UserNav';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { BusinessModal } from './BusinessModal';
import { cn } from '@/lib/utils';
import { useAuthorization } from '@/hooks/useAuthorization';

export function Header() {
    const { data: session } = useSession();
    const [showBusinessModal, setShowBusinessModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthorizedSeries, isLoading } = useAuthorization();

    const user = session?.user as { role?: string } | undefined;
    const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

    const NavBadge = ({ authorized }: { authorized: boolean | undefined }) => {
        if (isLoading) return null;
        if (authorized) return <BadgeCheck className="w-3 h-3 text-blue-500" />;
        return <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black rounded-md border border-slate-200 uppercase tracking-tighter">Trial</span>;
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-16 md:h-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl z-[60] shadow-sm">
                <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-full flex items-center justify-between">
                    {/* Logo Area */}
                    <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity group">
                        <Box className="w-7 h-7 md:w-9 md:h-9 text-blue-600 shrink-0 group-hover:rotate-12 transition-transform duration-500" />
                        <div className="flex flex-col">
                            <span className="text-base md:text-xl font-black tracking-tighter leading-none whitespace-nowrap text-slate-900">3D AI <span className="text-blue-600">Maker</span></span>
                            <span className="text-[7px] md:text-[9px] font-bold text-slate-400 tracking-[0.05em] md:tracking-[0.2em] uppercase mt-0.5 whitespace-nowrap">普惠AI创客教育方案</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Menu */}
                    <nav className="hidden lg:flex items-center gap-1 h-full ml-4 font-sans">
                        {/* 1. AI互动教育体系 */}
                        <Link href="/course/ai" className="flex items-center gap-2 px-4 py-2 text-[14px] font-bold text-slate-600 hover:text-blue-600 transition-all group">
                            <Cpu className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                            <div className="flex items-center gap-1">
                                <span>AI 互动教育体系</span>
                                <NavBadge authorized={isAuthorizedSeries('ai-interactive')} />
                            </div>
                        </Link>

                        {/* 2. 3D打印教育体系 */}
                        <Link href="/course/3d" className="flex items-center gap-2 px-4 py-2 text-[14px] font-bold text-slate-600 hover:text-orange-600 transition-all group">
                            <Layers className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
                            <div className="flex items-center gap-1">
                                <span>3D 打印教育体系</span>
                                <NavBadge authorized={isAuthorizedSeries('3d-printing')} />
                            </div>
                        </Link>

                        {/* 3. AI创客教育体系 */}
                        <Link href="/course/maker" className="flex items-center gap-2 px-4 py-2 text-[14px] font-bold text-slate-600 hover:text-purple-600 transition-all group">
                            <Zap className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                            <div className="flex items-center gap-1">
                                <span>AI 创客教育体系</span>
                                <NavBadge authorized={isAuthorizedSeries('maker-l1') || isAuthorizedSeries('maker-l2') || isAuthorizedSeries('maker-l3')} />
                            </div>
                        </Link>

                        <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>

                        {/* 4. 学生作品 */}
                        <Link href="/gallery" className="flex items-center gap-1.5 px-3 py-2 text-[14px] font-bold text-slate-600 hover:text-pink-600 transition-colors group">
                            <ImageIcon className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform" /> 作品廊
                        </Link>

                        {/* 5. 比赛通道 */}
                        <Link href="/competitions" className="flex items-center gap-1.5 px-3 py-2 text-[14px] font-bold text-slate-600 hover:text-yellow-600 transition-colors group">
                            <Trophy className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform" /> 比赛
                        </Link>
                    </nav>

                    {/* Right Side Tools */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* 商务通道 Desktop */}
                        <button
                            onClick={() => setShowBusinessModal(true)}
                            className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-white bg-slate-900 hover:bg-black px-4 py-2 rounded-xl border border-white/10 transition-all hover:scale-[1.02]"
                        >
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-400" /> 商务合作
                        </button>

                        <div className="h-6 w-[1px] bg-slate-200 hidden md:block mx-1"></div>

                        {/* Auth Area */}
                        <div className="flex items-center gap-2">
                            {session ? (
                                <div className="flex items-center gap-2">
                                    {isAdmin && (
                                        <Link href="/admin?tab=works" className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="管理控制台">
                                            <ShieldAlert className="w-5 h-5" />
                                        </Link>
                                    )}
                                    <UserNav />
                                </div>
                            ) : (
                                <>
                                    <Link href="/student-join" className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-black rounded-lg transition-all border border-blue-100 uppercase">
                                        学生激活
                                    </Link>
                                    <Link href="/login?type=teacher" className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-black text-white text-[10px] font-black rounded-lg transition-all border border-white/10 uppercase">
                                        <LogIn className="w-3.5 h-3.5" /> 教师与机构
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden p-2 text-slate-600 hover:text-blue-600 transition-colors relative z-50"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <div
                    className={cn(
                        "lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 z-30",
                        isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Mobile Navigation Menu Panel */}
                <div className={cn(
                    "lg:hidden fixed inset-x-0 top-0 bg-white transition-all duration-300 shadow-2xl z-40 pt-20",
                    isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
                )}>
                    <nav className="flex flex-col px-6 py-8 gap-1">
                        {isAdmin && (
                            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 transition-colors mb-2">
                                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                    <ShieldAlert className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <span className="font-black text-lg text-slate-900 block">管理控制台</span>
                                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Admin Dashboard Access</span>
                                </div>
                            </Link>
                        )}

                        <Link href="/course/ai" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Cpu className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="font-black text-lg text-slate-900">AI 互动教育体系</span>
                        </Link>

                        <Link href="/course/3d" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                                <Layers className="w-6 h-6 text-orange-600" />
                            </div>
                            <span className="font-black text-lg text-slate-900">3D 打印教育体系</span>
                        </Link>

                        <Link href="/course/maker" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className="font-black text-lg text-slate-900">AI 创客教育体系</span>
                        </Link>

                        <div className="h-[1px] bg-slate-100 my-4 mx-4"></div>

                        <div className="grid grid-cols-2 gap-3 px-2 text-center font-bold text-slate-600">
                            <Link href="/gallery" onClick={() => setIsMobileMenuOpen(false)} className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100">作品廊</Link>
                            <Link href="/competitions" onClick={() => setIsMobileMenuOpen(false)} className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100">比赛</Link>
                        </div>

                        <div className="grid grid-cols-2 gap-3 px-2 pt-4">
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setShowBusinessModal(true);
                                }}
                                className="col-span-2 flex items-center justify-center gap-2 p-5 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-600/20 mb-2 active:scale-95 transition-all"
                            >
                                <BadgeCheck className="w-5 h-5 text-blue-200" /> 商务合作签约
                            </button>

                            <Link
                                href="/student-join"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 p-5 rounded-2xl bg-blue-50 text-blue-600 font-bold border border-blue-100"
                            >
                                学生激活
                            </Link>

                            <Link
                                href="/login?type=teacher"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 p-5 rounded-2xl bg-slate-100 text-slate-600 font-bold border border-slate-200"
                            >
                                教师登录
                            </Link>
                        </div>
                    </nav>
                </div>
            </header>

            <BusinessModal isOpen={showBusinessModal} onClose={() => setShowBusinessModal(false)} />
        </>
    );
}

