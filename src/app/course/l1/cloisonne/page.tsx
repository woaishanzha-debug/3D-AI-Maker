'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { PresentationViewer } from '@/components/PresentationViewer';
import { ArrowLeft, BookOpen, MessageCircle, Trophy, Wand2, Box, ChevronRight, Share2, Sparkles, GraduationCap, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CloisonneCanvas = dynamic(() => import('@/components/CloisonneCanvas').then((mod) => mod.CloisonneCanvas), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[600px] bg-slate-900 rounded-[40px] flex items-center justify-center border border-white/5 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
                <p className="text-[#D4AF37] font-black text-xs uppercase tracking-widest animate-pulse">正在初始化数字实验室...</p>
            </div>
        </div>
    )
});

export default function CloisonneLesson() {
    const [step, setStep] = useState(0); // 0: Intro, 1: Culture, 2: Interactive Lab, 3: Success
    const [showTeacherGuide, setShowTeacherGuide] = useState(false);

    const teacherGuides = [
        "【导入语】同学们，今天我们要跨入乾隆皇帝的造办处，去探寻一件‘点石成金’的艺术——掐丝珐琅。请大家闭上眼，想象一条细如发丝的金线，如何在你的指尖跳舞？",
        "【工艺讲解】‘掐丝’的核心在于‘力度的均衡’。在 3D 打印的世界里，这对应着‘向量路径的闭合’。观察这些图案，它们往往是对称的，这不仅是为了美学，更是为了结构稳定。",
        "【实操引导】现在，请开启‘镜像模式’。在数字画板上，尝试勾勒一只蝴蝶的一侧翅膀。观察 AI 是如何实时镜像并平滑你的笔触的？这一步生成的 SVG 将直接化为 3D 打印的物理底板。",
        "【总结】恭喜完成！你们不仅是在画画，而是在通过算法复刻千年非遗。点击导出，我们将把这份‘数字金线’转化为实物底稿。"
    ];

    const currentGuide = teacherGuides[step];

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
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-tighter">L1-02</span>
                        <h1 className="font-black text-sm italic tracking-widest uppercase">掐丝珐琅：金属线描之美</h1>
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

            {/* 主教学区 */}
            <div className="pt-24 pb-12 px-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[calc(100vh-4rem)]">

                {/* 左侧：教学交互区 */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <AnimatePresence mode="wait">
                        {/* 第一步：文化发现 & 技艺解构 */}
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
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">智驭文明：</span><br />
                                        数字传承者的第一步
                                    </h2>
                                    <p className="text-xl text-blue-100/60 max-w-2xl leading-relaxed font-light">
                                        掐丝珐琅，又称“景泰蓝”。我们要挑战的，是让古老的“铜胎金丝”在 3D 实验室里焕发数字新生。
                                    </p>
                                    <button onClick={() => setStep(1)} className="w-fit px-12 py-5 bg-white text-black rounded-3xl font-black italic hover:scale-105 transition-transform flex items-center gap-3 shadow-2xl">
                                        开启数字化溯源之旅 <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* 第二步：沉浸式课件（精简逻辑） */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="relative h-full rounded-[48px] overflow-hidden shadow-2xl border border-white/5 bg-slate-900"
                            >
                                <div className="absolute top-8 left-8 z-30 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xs font-black text-white/40 uppercase tracking-widest">Interactive Courseware</span>
                                </div>

                                <PresentationViewer slug="cloisonne" dataFile="refined.json" />

                                <div className="absolute top-8 right-8 z-30 flex gap-4">
                                    <button onClick={() => setStep(2)} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all shadow-2xl active:scale-95">
                                        进入设计实验室 <Wand2 className="w-4 h-4" />
                                    </button>
                                </div>

                            </motion.div>
                        )}

                        {/* 第三步：实验画板 */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 min-h-[700px] flex flex-col gap-4"
                            >
                                <CloisonneCanvas />
                                <div className="flex justify-end">
                                    <button onClick={() => setStep(3)} className="px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all">
                                        完成闭合填色验证并确认
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* 第四步：成就达成 */}
                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                                className="flex-1 rounded-[48px] bg-slate-900 border border-white/5 flex flex-col items-center justify-center p-20 text-center gap-10 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
                                <div className="w-32 h-32 bg-green-500 rounded-[40px] flex items-center justify-center shadow-[0_0_80px_rgba(34,197,94,0.4)] relative z-10">
                                    <Trophy className="w-16 h-16 text-white" />
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <h2 className="text-6xl font-black italic tracking-tighter text-white">READY FOR PRINT</h2>
                                    <p className="text-green-200/60 font-medium max-w-lg mx-auto leading-relaxed">
                                        你已成功掌握数字掐丝逻辑。导出的 SVG 底稿现在可以前往 <span className="text-green-400">“创客工具箱”</span> 转化为 3D 模型进行打印了。
                                    </p>
                                </div>
                                <div className="flex gap-4 relative z-10">
                                    <button onClick={() => setStep(2)} className="px-8 py-4 bg-white/5 rounded-2xl font-black text-sm text-white/60 hover:text-white transition-colors">
                                        继续优化设计
                                    </button>
                                    <Link href="/course/l1/embroidery" className="px-10 py-4 bg-blue-600 rounded-2xl font-black text-sm text-white shadow-xl hover:bg-blue-500 transition-all">
                                        解锁下一章：传统刺绣 <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 右侧：引导与提示区 */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* 关键知识浮层 - 移动到侧边栏避免挡住课件内容 */}
                    <AnimatePresence>
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="p-8 rounded-[40px] bg-blue-600 shadow-[0_20px_50px_rgba(59,130,246,0.3)] relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-24 h-24 text-white" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                                            <Lightbulb className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-[10px] text-white font-black uppercase tracking-widest">关键知识：数字金丝</span>
                                    </div>
                                    <h3 className="text-xl font-black italic mb-3 text-white">什么是 SVG？</h3>
                                    <p className="text-sm text-blue-50 leading-relaxed font-medium">
                                        与照片（位图）不同，<strong className="text-white border-b-2 border-white/50">SVG 是数学定义的路径</strong>。它可以无限缩放而保持锐利，这意味着它可以直接作为底稿，指导 3D 打印笔进行精确的线条“掐丝”创作。
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 教师引导助手 - 展开/收起 */}
                    <AnimatePresence>
                        {showTeacherGuide && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                className="p-10 rounded-[48px] bg-white text-black flex flex-col gap-8 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 py-2 px-10 bg-blue-600 text-white font-black text-[10px] uppercase tracking-tighter rotate-12 translate-x-12 translate-y-6">Live Guidance</div>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                                        <MessageCircle className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-black text-sm uppercase tracking-widest opacity-40">Teacher Script</div>
                                        <div className="font-black text-xl italic tracking-tighter">实时引导话术</div>
                                    </div>
                                </div>
                                <div className="text-lg font-bold leading-relaxed border-l-4 border-blue-600 pl-6 py-2">
                                    “{currentGuide}”
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Sparkles className="w-3 h-3 text-blue-500" /> 教学建议：
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed font-bold">
                                        {step === 2 ? '提示学生在屏幕左侧绘制，观察右侧自动生产对称的金线规律。' : '引导学生观察屏幕背景的 3D 渲染质感。'}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 任务看板 */}
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
                            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black tracking-widest">ACTIVE</div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { t: '完成掐丝珐琅工艺背景扫描', icon: BookOpen, s: step >= 1 },
                                { t: '在数字实验室绘制出对称的主体框架', icon: Wand2, s: step >= 3 },
                                { t: '成功导出 SVG 格式底板线稿', icon: Share2, s: step >= 3 },
                                { t: '预备 3D 打印笔填色辅助教学', icon: Sparkles, s: step >= 3 }
                            ].map((o, i) => (
                                <div key={i} className={`flex items-center gap-4 p-4 rounded-3xl transition-all ${o.s ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/40'}`}>
                                    <div className={`p-2 rounded-xl ${o.s ? 'bg-green-500/20' : 'bg-white/10'}`}>
                                        <o.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold">{o.t}</span>
                                </div>
                            ))}
                        </div>

                        {step < 3 && step !== 0 && (
                            <button
                                onClick={() => step === 2 ? setStep(3) : setStep(step + 1)}
                                className="w-full mt-auto py-5 bg-white text-black rounded-3xl font-black italic hover:bg-blue-400 hover:text-white transition-all shadow-xl font-sm uppercase tracking-widest"
                            >
                                完成当前步骤 CONTINUE <ChevronRight className="w-4 h-4 ml-1 inline" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
