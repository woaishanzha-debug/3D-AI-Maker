'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { PresentationViewer } from '@/components/PresentationViewer';
import { ArrowLeft, BookOpen, MessageCircle, Trophy, Wand2, Box, ChevronRight, Sparkles, GraduationCap, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Canvas = dynamic(() => import('@/components/SongBrocade/Canvas').then((mod) => mod.Canvas), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[600px] bg-slate-900 rounded-[40px] flex items-center justify-center border border-white/5 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-orange-400 font-black text-xs uppercase tracking-widest animate-pulse">正在初始化数字织机...</p>
            </div>
        </div>
    )
});

export default function SongBrocadeLesson() {
    const [step, setStep] = useState(0);
    const [showTeacherGuide, setShowTeacherGuide] = useState(false);

    const teacherGuides = [
        "【导入语】宋锦，被誉为中国四大名锦之一。它的纹样有一个神奇的特点——可以无限延展。这在数学中被称为‘平面密铺’或‘四方连续’。",
        "【工艺讲解】在织机上，经线和纬线的交错决定了图案的循环。我们可以通过调整单元格的排列和交错偏移量，瞬间改变整匹布的外观。",
        "【实操引导】请尝试修改行列数和偏移比例。生成的纹样可以通过导出 PDF 作为课堂教案的填色卡。",
        "【总结】恭喜完成！你们掌握了四方连续的设计法则。"
    ];

    const currentGuide = teacherGuides[step];

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-orange-500/30">
            <div className="fixed top-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-8">
                <div className="flex items-center gap-6">
                    <Link href="/course/l1" className="text-white/40 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-tighter">L1-NEW</span>
                        <h1 className="font-black text-sm italic tracking-widest uppercase">宋锦织造：四方连续的阵列密码</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowTeacherGuide(!showTeacherGuide)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${showTeacherGuide ? 'bg-white text-black' : 'bg-orange-600/20 text-orange-400 border border-orange-500/20'}`}
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
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-transparent to-red-600/10 opacity-30" />
                                <div className="relative z-10 flex-1 flex flex-col justify-center gap-8">
                                    <h2 className="text-5xl font-black italic leading-[1.2]">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">无限延展：</span><br />
                                        宋锦的四方连续美学
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
                                <button onClick={() => setStep(2)} className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-orange-500 transition-all shadow-2xl active:scale-95">
                                    进入数字织机 <Wand2 className="w-4 h-4" />
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
                                        完成阵列设计
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
                                <h2 className="text-6xl font-black italic tracking-tighter text-white">READY FOR PRINT</h2>
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
                                <div className="font-bold border-l-4 border-orange-600 pl-6 py-2">
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
                                className="w-full mt-auto py-5 bg-white text-black rounded-3xl font-black italic hover:bg-orange-400 hover:text-white transition-all shadow-xl font-sm uppercase tracking-widest"
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
