'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { PresentationViewer } from '@/components/PresentationViewer';
import { ArrowLeft, BookOpen, MessageCircle, Trophy, Wand2, Box, ChevronRight, Sparkles, GraduationCap, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Canvas = dynamic(() => import('@/components/Raden/Canvas').then((mod) => mod.Canvas), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[600px] bg-slate-900 rounded-[40px] flex items-center justify-center border border-white/5 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-blue-400 font-black text-xs uppercase tracking-widest animate-pulse">正在初始化数字实验室...</p>
            </div>
        </div>
    )
});

export default function RadenLesson() {
    const [step, setStep] = useState(0);
    const [showTeacherGuide, setShowTeacherGuide] = useState(false);

    const teacherGuides = [
        "【导入语】同学们，螺钿镶嵌是利用贝壳的天然光泽在漆器上作画。今天我们要利用 Voronoi 算法，在数字世界中重现这种破碎而又自然的美。",
        "【工艺讲解】‘碎纹’是如何产生的？在自然界中，干裂的泥土、蜻蜓的翅膀都遵循着一种几何规律。我们用计算机算法（泰森多边形）来模拟这种细分效果。",
        "【实操引导】请调整密度和间隙，观察网格的变化。导出的 SVG 底板可用于激光切割，制作属于你的螺钿拼图。",
        "【总结】恭喜！数字螺钿不仅是图案，更是数学与非遗的完美结合。"
    ];

    const currentGuide = teacherGuides[step];

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
            <div className="fixed top-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-8">
                <div className="flex items-center gap-6">
                    <Link href="/course/l1" className="text-white/40 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-tighter">L1-NEW</span>
                        <h1 className="font-black text-sm italic tracking-widest uppercase">螺钿镶嵌：Voronoi 碎纹之美</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-1">
                        {[0, 1, 2, 3].map((s) => (
                            <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${s <= step ? 'bg-blue-500' : 'bg-white/10'}`} />
                        ))}
                    </div>
                    <button
                        onClick={() => setShowTeacherGuide(!showTeacherGuide)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${showTeacherGuide ? 'bg-white text-black' : 'bg-blue-600/20 text-blue-400 border border-blue-500/20'}`}
                    >
                        <GraduationCap className="w-4 h-4" /> 教师引导助手
                    </button>
                </div>
            </div>

            <div className="pt-24 pb-12 px-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[calc(100vh-4rem)]">
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className="relative aspect-video rounded-[48px] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl flex flex-col p-16"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-30" />
                                <div className="relative z-10 flex-1 flex flex-col justify-center gap-8">
                                    <div className="flex items-center gap-4">
                                        <div className="px-4 py-1.5 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-blue-500/20">Phase 01</div>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500/30 to-transparent" />
                                    </div>
                                    <h2 className="text-5xl font-black italic leading-[1.2]">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">自然算法：</span><br />
                                        螺钿镶嵌的碎纹解析
                                    </h2>
                                    <button onClick={() => setStep(1)} className="w-fit px-12 py-5 bg-white text-black rounded-3xl font-black italic hover:scale-105 transition-transform flex items-center gap-3 shadow-2xl">
                                        开启探索之旅 <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="relative h-full rounded-[48px] overflow-hidden shadow-2xl border border-white/5 bg-slate-900 flex flex-col items-center justify-center p-12"
                            >
                                <h3 className="text-2xl font-bold text-white mb-6">工艺背景学习 (占位)</h3>
                                <p className="text-slate-400 mb-8 text-center max-w-lg">实际课程中此处将嵌入 PresentationViewer 加载文化课件 JSON。</p>
                                <button onClick={() => setStep(2)} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all shadow-2xl active:scale-95">
                                    进入碎纹生成实验室 <Wand2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 min-h-[700px] flex flex-col gap-4"
                            >
                                <Canvas />
                                <div className="flex justify-end">
                                    <button onClick={() => setStep(3)} className="px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all">
                                        完成生成确认
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                                className="flex-1 rounded-[48px] bg-slate-900 border border-white/5 flex flex-col items-center justify-center p-20 text-center gap-10 shadow-2xl relative overflow-hidden"
                            >
                                <div className="w-32 h-32 bg-green-500 rounded-[40px] flex items-center justify-center shadow-[0_0_80px_rgba(34,197,94,0.4)] relative z-10">
                                    <Trophy className="w-16 h-16 text-white" />
                                </div>
                                <h2 className="text-6xl font-black italic tracking-tighter text-white">MISSION ACCOMPLISHED</h2>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <AnimatePresence>
                        {showTeacherGuide && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                className="p-10 rounded-[48px] bg-white text-black flex flex-col gap-8 shadow-2xl relative overflow-hidden"
                            >
                                <div className="font-bold border-l-4 border-blue-600 pl-6 py-2">
                                    “{currentGuide}”
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="p-10 rounded-[48px] bg-white/5 border border-white/10 flex flex-col gap-8 flex-1">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                <Box className="w-6 h-6 text-white" />
                            </div>
                            <div className="font-black text-lg italic">任务进度</div>
                        </div>
                        {step < 3 && step !== 0 && (
                            <button
                                onClick={() => step === 2 ? setStep(3) : setStep(step + 1)}
                                className="w-full mt-auto py-5 bg-white text-black rounded-3xl font-black italic hover:bg-blue-400 hover:text-white transition-all shadow-xl font-sm uppercase tracking-widest"
                            >
                                CONTINUE <ChevronRight className="w-4 h-4 ml-1 inline" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
