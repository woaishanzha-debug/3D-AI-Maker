'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Lock, ArrowRight, ShieldCheck, Sparkles, ChevronLeft } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function StudentJoinPage() {
    const [step, setStep] = useState(1); // 1: Enter Code, 2: Set Profile
    const [inviteCode, setInviteCode] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/verify-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: inviteCode })
            });

            if (res.ok) {
                setStep(2);
            } else {
                const data = await res.json();
                setError(data.message || '邀请码无效或已过期');
            }
        } catch (err) {
            console.error(err);
            setError('验证失败，请稍后再试');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                username: inviteCode,
                password: password,
                redirect: false
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            console.error(err);
            setError('注册失败，请联系老师');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
                <div className="absolute top-20 left-0 w-[400px] h-[400px] bg-blue-100 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-20 right-0 w-[400px] h-[400px] bg-purple-100 blur-[100px] rounded-full"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                <Link href="/login" className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest mb-12 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Portal
                </Link>

                {/* Branding */}
                <div className="text-center mb-10 space-y-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-[20px] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 rotate-3 animate-pulse">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black italic tracking-tighter text-slate-900">3D-AI MAKER</h1>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">学生激活入口 | Student Activation Channel</p>
                    </div>
                </div>

                <div className="bg-white p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[48px] border-2 border-slate-100 relative overflow-hidden">
                    {step === 1 ? (
                        <form onSubmit={handleVerifyCode} className="space-y-8 relative z-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 flex items-center gap-2">
                                    <Ticket className="w-3 h-3" /> 输入 6 位班级激活码
                                </label>
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    placeholder="AB12CD"
                                    maxLength={10}
                                    required
                                    className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:bg-white rounded-2xl text-3xl font-black tracking-[0.3em] text-center transition-all outline-none text-slate-900 placeholder:text-slate-200"
                                />
                                <p className="text-[10px] font-bold text-slate-400 text-center italic uppercase">Obtain the code from your instructor</p>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-100 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                    ERROR: {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || inviteCode.length < 4}
                                className="w-full py-5 bg-slate-900 text-white font-black rounded-[24px] hover:bg-black transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed shadow-xl uppercase tracking-widest text-xs cursor-pointer"
                            >
                                {loading ? 'Validating Code...' : '下一步：设置个人密钥'}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-8 relative z-10">
                            <div className="p-5 bg-emerald-50 rounded-[24px] border border-emerald-100 flex items-center gap-5">
                                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">验证成功</p>
                                    <p className="text-sm font-black text-slate-900 tracking-widest">{inviteCode}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 flex items-center gap-2">
                                        <Lock className="w-3 h-3" /> 设置你的简易密码
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="数字、字母或符号"
                                        required
                                        className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-900"
                                    />
                                    <p className="text-[10px] font-bold text-slate-400 italic">This secret will be used for your next login. Secure it.</p>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-100">
                                    ERROR: {error}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-6 py-5 bg-slate-50 text-slate-400 font-black rounded-[24px] hover:bg-slate-100 hover:text-slate-600 transition-all text-xs uppercase tracking-widest"
                                >
                                    返回
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !password}
                                    className="flex-1 py-5 bg-blue-600 text-white font-black rounded-[24px] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 text-xs uppercase tracking-widest cursor-pointer"
                                >
                                    {loading ? 'Initializing...' : '立即开启 AI 创客之旅'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <p className="mt-12 text-center text-slate-300 text-[10px] uppercase font-black tracking-[0.4em]">
                    Digital Creator Education System v2.0
                </p>
            </div>
        </div>
    );
}

