'use client';

import { Lock, ArrowRight, ShieldCheck, Mail, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { BusinessModal } from '@/components/BusinessModal';
import { cn } from '@/lib/utils';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('type') === 'student' ? 'student' : 'teacher';

    const [code, setCode] = useState('');
    const [secret, setSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(searchParams.get('error') || '');
    const [showBusinessModal, setShowBusinessModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await signIn('credentials', {
                redirect: false,
                username: code,
                password: mode === 'student' ? '' : secret, // 学生模式不强制要求密码，取决于邀请码逻辑
            });

            if (res?.error) {
                setError(res.error);
            } else {
                const session = await getSession();
                // @ts-expect-error - role extension
                if (session?.user?.role === 'ADMIN') {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch {
            setError('服务器网络异常');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden py-24 px-4 font-sans">
            {/* Background Decoration */}
            <div className="absolute top-0 w-full h-1/2 bg-slate-50 border-b border-slate-100 -z-10"></div>
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-100/30 blur-[120px] rounded-full -z-10"></div>

            <div className="max-w-md w-full bg-white relative p-10 md:p-12 shadow-2xl shadow-slate-200/50 rounded-[48px] z-10 border-2 border-slate-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-colors",
                        mode === 'teacher' ? "bg-slate-900 shadow-slate-900/10" : "bg-blue-600 shadow-blue-600/10"
                    )}>
                        {mode === 'teacher' ? <ShieldCheck className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 italic tracking-tighter">
                            {mode === 'teacher' ? "教师与机构登录" : "学生激活通道"}
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
                            {mode === 'teacher' ? "Institutional Portal" : "Student Activation"}
                        </p>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] px-4 py-3 rounded-xl text-center font-black uppercase tracking-widest animate-pulse">
                            错误提示: {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">
                            {mode === 'teacher' ? "用户名 / 教师编号" : "请输入激活码"}
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={mode === 'teacher' ? "EDU-xxxx-xxxx" : "STUDENT-CODE-xxxx"}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none rounded-2xl px-12 py-4 text-sm font-bold transition-all text-slate-900 placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    {mode === 'teacher' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">安全密码</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none rounded-2xl px-12 py-4 text-sm font-bold transition-all text-slate-900 placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full py-5 text-white font-black rounded-[24px] mt-6 flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 tracking-widest text-xs uppercase cursor-pointer",
                            mode === 'teacher' ? "bg-slate-900 hover:bg-black" : "bg-blue-600 hover:bg-blue-700"
                        )}
                    >
                        {loading ? '身份校验中...' : (
                            <>进入造物系统 <ArrowRight className="w-4 h-4" /></>
                        )}
                    </button>

                    <div className="relative py-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                            <span className="bg-white px-4 text-slate-300 italic">切换入口通道</span>
                        </div>
                    </div>

                    <Link
                        href={`/login?type=${mode === 'teacher' ? 'student' : 'teacher'}`}
                        className={cn(
                            "w-full py-5 font-black rounded-[24px] flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.98] tracking-widest text-xs uppercase border-2",
                            mode === 'teacher' ? "bg-white text-blue-600 border-blue-50 hover:bg-blue-50" : "bg-white text-slate-900 border-slate-50 hover:bg-slate-50"
                        )}
                    >
                        {mode === 'teacher' ? "学生专属激活码入口" : "教师与机构登录入口"} <ArrowRight className="w-4 h-4" />
                    </Link>
                </form>

                <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
                    <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">还没有账号或激活码？</p>
                    <button
                        onClick={() => setShowBusinessModal(true)}
                        className="text-xs font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest"
                    >
                        点击申请商务合作授权
                    </button>
                </div>
            </div>

            <Link href="/" className="absolute top-12 left-12 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 uppercase tracking-widest group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回主控中心
            </Link>

            <BusinessModal isOpen={showBusinessModal} onClose={() => setShowBusinessModal(false)} />
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-blue-600 font-black">系统加载中...</div>}>
            <LoginContent />
        </Suspense>
    );
}

