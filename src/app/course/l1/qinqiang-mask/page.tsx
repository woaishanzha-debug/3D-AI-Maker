'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PresentationViewer } from '@/components/PresentationViewer';
import { ArrowLeft, BookOpen, ChevronRight, Sparkles, GraduationCap, Lightbulb, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LessonPage() {
    const [step, setStep] = useState(0); // 0: Intro, 1: Presentation, 2: Lab/Success
    
    const nextLesson = null;

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
            {/* 顶部简易导航 */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-8">
                <div className="flex items-center gap-6">
                    <Link href="/course/l1" className="text-white/40 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-tighter">L1-16</span>
                        <h1 className="font-black text-sm italic tracking-widest uppercase">梨园华彩：秦腔脸谱艺术</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-1">
                        {[0, 1, 2].map((s) => (
                            <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${s <= step ? 'bg-blue-500' : 'bg-white/10'}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* 主教学区 */}
            <div className="pt-24 pb-12 px-6 max-w-[1400px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="flex-1 relative rounded-[48px] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl flex flex-col p-16"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-30" />
                            <div className="relative z-10 flex-1 flex flex-col justify-center gap-8">
                                <div className="flex items-center gap-4">
                                    <div className="px-4 py-1.5 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-blue-500/20">Phase 01 | 文化溯源</div>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500/30 to-transparent" />
                                </div>
                                <h2 className="text-5xl md:text-6xl font-black italic leading-[1.2]">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">数字非遗进化：</span><br />
                                    梨园华彩
                                </h2>
                                <p className="text-xl text-blue-100/60 max-w-2xl leading-relaxed font-light">
                                    探索传统工艺的底层几何逻辑，利用 3D 打印技术赋予千年文化数字新生。
                                </p>
                                <button onClick={() => setStep(1)} className="w-fit px-12 py-5 bg-white text-black rounded-3xl font-black italic hover:scale-105 transition-transform flex items-center gap-3 shadow-2xl">
                                    进入沉浸式数字课件 <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="viewer"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 relative rounded-[48px] overflow-hidden shadow-2xl border border-white/5 bg-slate-900"
                        >
                            <div className="absolute top-8 left-8 z-30 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-black text-white/40 uppercase tracking-widest">Interactive Courseware</span>
                            </div>

                            <PresentationViewer slug="qinqiang-mask" dataFile="refined.json" />

                            <div className="absolute top-8 right-8 z-30 flex gap-4">
                                <button onClick={() => setStep(2)} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all shadow-2xl active:scale-95">
                                    完成学习 <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                            className="flex-1 rounded-[48px] bg-slate-900 border border-white/5 flex flex-col items-center justify-center p-20 text-center gap-10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
                            <div className="w-32 h-32 bg-blue-600 rounded-[40px] flex items-center justify-center shadow-[0_0_80px_rgba(37,99,235,0.4)] relative z-10">
                                <Trophy className="w-16 h-16 text-white" />
                            </div>
                            <div className="space-y-4 relative z-10">
                                <h2 className="text-6xl font-black italic tracking-tighter text-white">MISSION COMPLETE</h2>
                                <p className="text-blue-200/60 font-medium max-w-lg mx-auto leading-relaxed">
                                    恭喜！你已完成《梨园华彩：秦腔脸谱艺术》的数字化溯源学习。相关的 3D 打印实践任务已在创客空间开启。
                                </p>
                            </div>
                            <div className="flex gap-4 relative z-10">
                                <Link href="/course/l1" className="px-8 py-4 bg-white/5 rounded-2xl font-black text-sm text-white/60 hover:text-white transition-colors">
                                    返回课程索引
                                </Link>
                                {nextLesson && (
                                    <Link href={`/course/l1/${nextLesson}`} className="px-10 py-4 bg-blue-600 rounded-2xl font-black text-sm text-white shadow-xl hover:bg-blue-500 transition-all">
                                        进入下一章 <ChevronRight className="w-5 h-5" />
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
