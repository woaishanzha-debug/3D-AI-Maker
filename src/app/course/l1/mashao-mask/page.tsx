'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { PresentationViewer } from '@/components/PresentationViewer';
import TotemInteractionBoard from '@/components/Mashao/TotemInteractionBoard';
import { EVENTS } from '@/lib/event-bus';
import { ArrowLeft, BookOpen, MessageCircle, Trophy, Wand2, Box, ChevronRight, Share2, Sparkles, GraduationCap, Lightbulb, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MashaoCanvas = dynamic(() => import('@/components/MashaoCanvas').then((mod) => mod.MashaoCanvas), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[600px] bg-slate-900 rounded-[40px] flex items-center justify-center border border-white/5 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <p className="text-red-400 font-black text-xs uppercase tracking-widest animate-pulse">正在初始化脸谱实验室...</p>
            </div>
        </div>
    )
});

export default function MashaoLesson() {
    const [step, setStep] = useState(0); // 0: Intro, 1: Culture, 2: Interactive Lab, 3: Success
    const [showTeacherGuide, setShowTeacherGuide] = useState(false);
    const [quests, setQuests] = useState({ 
        cultureExplored: false, 
        designCompleted: false, 
        exported3D: false 
    });

    useEffect(() => {
        const handleTotemAdd = () => setQuests(prev => ({ ...prev, cultureExplored: true }));
        const handleShapeChange = () => setQuests(prev => ({ ...prev, designCompleted: true }));
        const handleExportSuccess = () => setQuests(prev => ({ ...prev, exported3D: true }));

        window.addEventListener(EVENTS.TOTEM_ADD, handleTotemAdd);
        window.addEventListener(EVENTS.SHAPE_CHANGED, handleShapeChange);
        window.addEventListener(EVENTS.EXPORT_3MF_SUCCESS, handleExportSuccess);

        return () => {
            window.removeEventListener(EVENTS.TOTEM_ADD, handleTotemAdd);
            window.removeEventListener(EVENTS.SHAPE_CHANGED, handleShapeChange);
            window.removeEventListener(EVENTS.EXPORT_3MF_SUCCESS, handleExportSuccess);
        };
    }, []);

    const teacherGuides = [
        "【导入语】同学们，今天我们要跨越黄土高原，去认识一位‘守门神’——关中马勺脸谱。它不仅是以前家里舀水的工具，更是辟邪祈福的图腾。这一课，我们要用 AI 的逻辑去‘解密’这些狂放的线条。",
        "【工艺讲解】马勺脸谱的精髓在于‘粗犷’与‘色彩冲击’。红色象征忠义，黑色象征正直。在 3D 打印笔创作前，我们先要在数字画布上，利用‘镜像算法’捕捉这种强烈的对称美感。",
        "【实操引导】现在，请开启‘镜像画笔’。在马勺轮廓内，勾勒出眉眼。你会发现，虽然马勺是圆润的，但线条是硬朗有力的。这就是秦风社火的生命力。设计的线稿将成为我们 3D 笔的骨架。",
        "【总结】太棒了！你创作的这张脸谱既有‘秦腔’的豪迈，又有‘数字’的精准。点击导出，让这份来自黄土地的艺术，在 3D 打印的世界里重生。"
    ];

    const currentGuide = teacherGuides[step];

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-red-500/30">
            {/* 顶部简易导航 */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-8">
                <div className="flex items-center gap-6">
                    <Link href="/course/l1" className="text-white/40 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-tighter">L1-07</span>
                        <h1 className="font-black text-sm italic tracking-widest uppercase">秦风社火：马勺脸谱</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-1">
                        {[0, 1, 2, 3].map((s) => (
                            <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${s <= step ? 'bg-red-600' : 'bg-white/10'}`} />
                        ))}
                    </div>
                    <button
                        onClick={() => setShowTeacherGuide(!showTeacherGuide)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${showTeacherGuide ? 'bg-white text-black' : 'bg-red-600/20 text-red-400 border border-red-500/20'}`}
                    >
                        <GraduationCap className="w-4 h-4" /> 教师引导助手
                    </button>
                </div>
            </div>

            {/* 主教学区 */}
            <div className="pt-24 pb-12 px-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[calc(100vh-4rem)]">

                {/* 左侧：教学交互区 */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className="relative aspect-video rounded-[48px] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl flex flex-col p-16"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-orange-600/10 opacity-30" />
                                <div className="relative z-10 flex-1 flex flex-col justify-center gap-8">
                                    <div className="flex items-center gap-4">
                                        <div className="px-4 py-1.5 bg-red-600/20 text-red-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-red-500/20">Phase 01 | 文化溯源</div>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-red-500/30 to-transparent" />
                                    </div>
                                    <h2 className="text-5xl font-black italic leading-[1.2]">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-300">秦风之骨：</span><br />
                                        关中马勺脸谱
                                    </h2>
                                    <p className="text-xl text-red-100/60 max-w-2xl leading-relaxed font-light">
                                        不仅是盛粮的器皿，更是秦地人对忠义与正气的艺术投射。让我们在数字化浪潮中，用 3D 笔复刻这份豪迈。
                                    </p>
                                    <button onClick={() => setStep(1)} className="w-fit px-12 py-5 bg-white text-black rounded-3xl font-black italic hover:scale-105 transition-transform flex items-center gap-3 shadow-2xl">
                                        开启数字化溯源之旅 <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div
                                key="viewer"
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="relative h-full rounded-[48px] overflow-hidden shadow-2xl border border-white/5 bg-slate-900"
                            >
                                <div className="absolute top-8 left-8 z-30 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xs font-black text-white/40 uppercase tracking-widest">Interactive Courseware</span>
                                </div>

                                <PresentationViewer slug="mashao-mask" dataFile="refined.json" />

                                <div className="absolute top-8 right-8 z-30 flex gap-4">
                                    <button onClick={() => setStep(2)} className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-red-500 transition-all shadow-2xl active:scale-95">
                                        进入设计实验室 <Wand2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="lab"
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 min-h-[700px] flex flex-col gap-8"
                            >
                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1">
                                    {/* Left: Interaction Board */}
                                    <div className="xl:col-span-4 h-fit sticky top-24">
                                        <TotemInteractionBoard />
                                    </div>
                                    
                                    {/* Right: Canvas */}
                                    <div className="xl:col-span-8 h-[700px]">
                                        <MashaoCanvas />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button 
                                        onClick={() => setStep(1)} 
                                        className="px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 rounded-2xl font-black text-xs tracking-widest uppercase transition-all"
                                    >
                                        返回课件
                                    </button>
                                    <button 
                                        onClick={() => setStep(3)} 
                                        className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl shadow-red-900/20"
                                    >
                                        确认设计并进入成功页
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                                className="flex-1 rounded-[48px] bg-slate-900 border border-white/5 flex flex-col items-center justify-center p-20 text-center gap-10 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
                                <div className="w-32 h-32 bg-red-600 rounded-[40px] flex items-center justify-center shadow-[0_0_80px_rgba(220,38,38,0.4)] relative z-10">
                                    <Trophy className="w-16 h-16 text-white" />
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <h2 className="text-6xl font-black italic tracking-tighter text-white">MISSION COMPLETE</h2>
                                    <p className="text-red-200/60 font-medium max-w-lg mx-auto leading-relaxed">
                                        恭喜！你已完成马勺脸谱的数字化溯源与设计。你的专属线稿已导出，现在可以开始 3D 打印笔的实物创作了。
                                    </p>
                                </div>
                                <div className="flex gap-4 relative z-10">
                                    <button onClick={() => setStep(2)} className="px-8 py-4 bg-white/5 rounded-2xl font-black text-sm text-white/60 hover:text-white transition-colors">
                                        回到设计实验室
                                    </button>
                                    <Link href="/course/l1" className="px-10 py-4 bg-red-600 rounded-2xl font-black text-sm text-white shadow-xl hover:bg-red-500 transition-all">
                                        返回课程目录 <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 右侧：引导与提示区 */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <AnimatePresence>
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="p-8 rounded-[40px] bg-red-600 shadow-[0_20px_50px_rgba(220,38,38,0.3)] relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-24 h-24 text-white" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                                            <Lightbulb className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-[10px] text-white font-black uppercase tracking-widest">关键知识：马勺脸谱</span>
                                    </div>
                                    <h3 className="text-xl font-black italic mb-3 text-white">极简与夸张</h3>
                                    <p className="text-sm text-red-50 leading-relaxed font-medium">
                                        马勺脸谱并不追求细节的真实，而是通过<strong className="text-white border-b-2 border-white/50">几何化的线条</strong>和强烈的色彩对比来表现神圣感。这种“非逼真”的逻辑其实非常契合 3D 打印笔的线条创作特点。
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {showTeacherGuide && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="p-10 rounded-[48px] bg-white text-black flex flex-col gap-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 py-2 px-10 bg-red-600 text-white font-black text-[10px] uppercase tracking-tighter rotate-12 translate-x-12 translate-y-6">Live Guidance</div>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                                    <MessageCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <div>
                                    <div className="font-black text-sm uppercase tracking-widest opacity-40">Teacher Script</div>
                                    <div className="font-black text-xl italic tracking-tighter">实时引导话术</div>
                                </div>
                            </div>
                            <div className="text-lg font-bold leading-relaxed border-l-4 border-red-600 pl-6 py-2">
                                “{currentGuide}”
                            </div>
                        </motion.div>
                    )}

                    <div className="p-10 rounded-[48px] bg-white/5 border border-white/10 flex flex-col gap-8 flex-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <Box className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="font-black text-[10px] opacity-40 uppercase tracking-widest">Quest Progress</div>
                                    <div className="font-black text-lg italic">教学目标清单</div>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-[10px] font-black tracking-widest">ACTIVE</div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { t: '完成马勺脸谱文化内涵探索', icon: BookOpen, s: quests.cultureExplored },
                                { t: '在数字实验室完成对称构图设计', icon: Wand2, s: quests.designCompleted },
                                { t: '成功导出马勺 3D 打印线稿', icon: Share2, s: quests.exported3D },
                                { t: '了解 AI 风格迁移在非遗中的应用', icon: Sparkles, s: step >= 1 }
                            ].map((o, i) => (
                                <div key={i} className={`flex items-center gap-4 p-4 rounded-3xl transition-all ${o.s ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-white/5 text-white/40 border border-transparent'}`}>
                                    <div className={`p-2 rounded-xl transition-all ${o.s ? 'bg-green-500/20 scale-110 shadow-lg' : 'bg-white/10'}`}>
                                        {o.s ? (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                                                <ShieldCheck className="w-4 h-4" />
                                            </motion.div>
                                        ) : (
                                            <o.icon className="w-4 h-4" />
                                        )}
                                    </div>
                                    <span className={`text-xs font-bold transition-all ${o.s ? 'opacity-100' : 'opacity-60'}`}>{o.t}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
