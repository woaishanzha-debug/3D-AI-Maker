'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap, PlayCircle, Lightbulb, Box, Share2, Sparkles, Wand2, Download, MousePointer2 } from 'lucide-react';

export default function LithophaneCourse() {
    const [step, setStep] = useState(0);
    const [torchPos, setTorchPos] = useState({ x: 50, y: 50 });
    const containerRef = useRef<HTMLDivElement>(null);

    // 处理手电筒移动逻辑
    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;
        setTorchPos({ x, y });
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden">
            {/* 顶栏导航 */}
            <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center backdrop-blur-md bg-black/20 border-b border-white/5">
                <div className="flex items-center gap-6">
                    <Link href="/course/3d" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all group">
                        <ChevronLeft className="w-5 h-5 text-white/40 group-hover:text-white" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-black tracking-widest leading-none">FREE S1</span>
                            <h1 className="text-sm font-black italic tracking-tight">光影魔术师：LITHOPHANE</h1>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {[0, 1, 2].map((s) => (
                                <div key={s} className={`h-1 w-6 rounded-full transition-all duration-500 ${s <= step ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-[10px] text-white/30 font-bold tracking-widest uppercase">Target Technique</span>
                        <span className="text-xs font-black text-blue-400 italic">Greyscale-to-Depth Algorithm</span>
                    </div>
                    <button className="px-6 py-2.5 bg-blue-600 rounded-xl text-xs font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-white">
                        解锁完整课程内容
                    </button>
                </div>
            </nav>

            {/* 主渲染区 */}
            <main className="pt-24 px-8 max-w-[1600px] mx-auto min-h-screen flex flex-col lg:flex-row gap-12 items-center justify-center">

                <AnimatePresence mode="wait">
                    {/* STEP 0: 魔法序章 */}
                    {step === 0 && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                            className="bg-slate-900/50 rounded-[64px] border border-white/5 p-16 text-center max-w-4xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-transparent to-transparent opacity-50" />
                            <div className="relative z-10 space-y-8">
                                <div className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center animate-bounce shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                                    <Sparkles className="w-12 h-12 text-white" />
                                </div>
                                <h2 className="text-6xl font-black italic tracking-tighter leading-none">
                                    让光线拥有“重量”
                                </h2>
                                <p className="text-xl text-white/40 max-w-2xl mx-auto font-light leading-relaxed">
                                    在普通人的眼中，照片只是像素的集合。<br />
                                    在 3D 创客眼里，光影是<span className="text-blue-400 font-bold">厚度</span>的变化。
                                </p>
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-12 py-5 bg-white text-black rounded-3xl font-black italic hover:scale-105 transition-transform shadow-2xl flex items-center gap-3 mx-auto mt-8"
                                >
                                    进入光影实验场 <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 1: 核心实验室交互 - 虚拟手电筒 */}
                    {step === 1 && (
                        <motion.div
                            key="lab"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
                        >
                            {/* 左侧实验室 */}
                            <div className="lg:col-span-8 flex flex-col gap-6">
                                <div
                                    ref={containerRef}
                                    onMouseMove={handleMouseMove}
                                    onTouchMove={handleMouseMove}
                                    className="relative aspect-[4/3] bg-black rounded-[48px] overflow-hidden border border-white/10 cursor-none group shadow-2xl"
                                >
                                    {/* 下层图像 (模拟背光呈现的效果) */}
                                    <div
                                        className="absolute inset-0 grayscale contrast-150 saturate-0"
                                        style={{
                                            backgroundImage: `url('/courseware/lithophane_sample.jpg')`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            maskImage: `radial-gradient(circle at ${torchPos.x}% ${torchPos.y}%, black 50px, transparent 150px)`,
                                            WebkitMaskImage: `radial-gradient(circle at ${torchPos.x}% ${torchPos.y}%, black 50px, transparent 150px)`
                                        }}
                                    />

                                    {/* 上层 3D 打印件纹理 (模拟未照亮的白件) */}
                                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none" />

                                    {/* 模拟 3D 打印层纹 (Subtle noise/lines) */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.5)_0px,rgba(255,255,255,0.5)_1px,transparent_1px,transparent_2px)]" />

                                    {/* 虚拟手电筒光晕指示 */}
                                    <div
                                        className="absolute w-64 h-64 border border-white/10 rounded-full blur-3xl pointer-events-none opacity-40 mix-blend-screen"
                                        style={{
                                            left: `${torchPos.x}%`,
                                            top: `${torchPos.y}%`,
                                            transform: 'translate(-50%, -50%)',
                                            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)'
                                        }}
                                    />

                                    {/* 引导光圈 */}
                                    <div
                                        className="absolute w-8 h-8 border-2 border-white/50 rounded-full pointer-events-none z-50 flex items-center justify-center"
                                        style={{ left: `${torchPos.x}%`, top: `${torchPos.y}%`, transform: 'translate(-50%, -50%)' }}
                                    >
                                        <div className="w-1 h-1 bg-white rounded-full" />
                                    </div>

                                    {/* 实验室提示语 */}
                                    <div className="absolute top-10 left-10 text-[10px] font-black tracking-[0.4em] uppercase text-white/20 select-none">
                                        Active Simulation: Backlight Transmission
                                    </div>
                                </div>
                            </div>

                            {/* 右侧交互面板 */}
                            <div className="lg:col-span-4 space-y-10 group">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                                            <Lightbulb className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <h3 className="text-2xl font-black italic tracking-tight">探索：光线穿透法</h3>
                                    </div>
                                    <p className="text-white/40 text-sm leading-relaxed">
                                        试着在左侧“白板”上移动光亮。你会发现，暗部因为 3D 打印实体较厚而阻挡了光线，亮部则因为极薄而透光。
                                    </p>
                                </div>

                                <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 space-y-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-white/20 tracking-widest uppercase">Depth Analysis</span>
                                        <span className="text-xl font-mono font-black text-blue-400 italic">2.4mm Max</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ width: `${60 + Math.sin(Date.now() * 0.01) * 20}%` }}
                                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-400"
                                        />
                                    </div>
                                    <p className="text-[11px] text-white/30 font-medium">通过控制层厚（Layer Height），我们能实现 256 级的灰度还原。</p>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full py-6 bg-white text-black rounded-[28px] font-black italic hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-3"
                                >
                                    掌握原理，开始创造 <Zap className="w-5 h-5 fill-black" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: 工具集成引导 */}
                    {step === 2 && (
                        <motion.div
                            key="final"
                            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl w-full text-center space-y-12"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full mx-auto w-64 h-64" />
                                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[40px] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30 relative z-10">
                                    <Box className="w-16 h-16 text-white" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-7xl font-black italic tracking-tighter">TOOL UNLOCKED</h2>
                                <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed italic">
                                    原理已掌握。现在，你可以上传自己的照片，实验室将为你自动计算并导出属于你的 3D 光影模具。
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
                                <Link
                                    href="/course/3d"
                                    className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center gap-3 group/nav"
                                >
                                    <Share2 className="w-6 h-6 text-white/40 group-hover/nav:text-white transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover/nav:text-white transition-colors">返回全景预览</span>
                                </Link>

                                <Link
                                    href="/tools/s1"
                                    className="p-6 rounded-3xl bg-blue-600 shadow-xl shadow-blue-600/30 flex flex-col items-center gap-3 active:scale-95 transition-all text-white hover:bg-blue-500 hover:shadow-blue-500/50"
                                >
                                    <Wand2 className="w-6 h-6 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest tracking-[0.2em]">启动灰度生成器</span>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>

            {/* 背景动态元素 */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[150px] rounded-full" />
            </div>
        </div>
    );
}
