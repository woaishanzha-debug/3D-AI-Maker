'use client';

import { Zap, Box, ShoppingBag, ArrowRight, ShieldCheck, Microscope, FlaskConical, ChevronLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthorization } from '@/hooks/useAuthorization';

export default function MakerCourseIndex() {
    const { isAuthorizedSeries, isLoading } = useAuthorization();

    const kits = [
        {
            id: 'maker-l1',
            level: 'L1',
            title: '3D打印非遗套件',
            target: 'Level 1: 空间感知与文化认知',
            desc: '作为创客之路的起点，我们将 3D 打印笔与中国传统文化结合。通过制作实物，学生将建立起从平面到三维的直观空间感。',
            modules: ['三维画纸概念', '结构连接逻辑', '文化符号拆解'],
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            borderColor: 'border-blue-100',
            href: '/course/l1'
        },
        {
            id: 'maker-l2',
            level: 'L2',
            title: '3D打印声光电套件',
            target: 'Level 2: 硬件系统与物理交互',
            desc: '作品不应是静态的。在 L2 阶段，我们引入电子传感器、LED 和音频模组。让学生学习电路原理，赋予模型感知外部世界的能力。',
            modules: ['基础电路原理', '传感器接入', '物理交互反馈'],
            color: 'text-green-600',
            bg: 'bg-green-50',
            borderColor: 'border-green-100',
            href: '/course/l2'
        },
        {
            id: 'maker-l3',
            level: 'L3',
            title: 'AI 编程智能套件',
            target: 'Level 3: 算法驱动与智能造物',
            desc: '高阶创客的分水岭。结合平台 AI 模型，学习利用代码生成复杂几何体。模型将具备 AI “大脑”，实现真正的智能逻辑闭环。',
            modules: ['参数化建模', 'AI逻辑接口', '代码控制硬件'],
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            borderColor: 'border-purple-100',
            href: '/course/l3'
        }
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 pb-20">
            {/* Header Area */}
            <div className="bg-slate-50 border-b border-slate-200 pt-32 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-purple-400 blur-[100px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="flex justify-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-bold text-sm group">
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回主控中心
                        </Link>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black tracking-widest uppercase mb-8 border border-blue-200">
                        <Zap className="w-4 h-4" /> AI Maker Kits Series
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6 text-slate-900 leading-none">
                        AI 创客套件<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 italic">实操全览目录</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-slate-600 text-lg font-medium leading-relaxed mb-10">
                        以硬件套件为载体，配合 SaaS 平台的 AI 算法工具，构建从“手脑重塑”到“智能编程”的完整闭环。
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/course/l1/cloisonne">
                            <button className="flex items-center gap-3 px-8 py-4 bg-blue-600 shadow-xl shadow-blue-500/20 text-white rounded-2xl font-black text-sm hover:bg-blue-700 hover:scale-[1.02] transition-all group active:scale-95">
                                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" /> 体验课直达
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Kits List */}
            <div className="max-w-7xl mx-auto px-6 py-20 space-y-12">
                {kits.map((kit, i) => {
                    const authorized = isAuthorizedSeries(kit.id);

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className={cn(
                                "group relative bg-white rounded-[48px] p-8 md:p-12 border-2 border-slate-100 transition-all overflow-hidden shadow-xl shadow-slate-200/40",
                                !authorized && !isLoading && "bg-slate-50/50 grayscale-[0.8] opacity-80"
                            )}
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                                <Box className="w-80 h-80 rotate-12" />
                            </div>

                            <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
                                <div className={`w-24 h-24 rounded-[32px] ${kit.bg} flex flex-col items-center justify-center border-2 ${kit.borderColor} shadow-sm shrink-0`}>
                                    <span className={`text-4xl font-black ${kit.color}`}>{kit.level}</span>
                                    <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-tighter">PHASE</span>
                                </div>

                                <div className="grow space-y-4 text-center lg:text-left">
                                    <div className="flex flex-col lg:flex-row items-center lg:items-end gap-3 justify-center lg:justify-start">
                                        <h2 className="text-3xl font-black italic text-slate-900">{kit.title}</h2>
                                        {!authorized && !isLoading && (
                                            <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-full uppercase tracking-widest italic mb-1 flex items-center gap-2 border border-white/20">
                                                <Lock className="w-3 h-3 text-blue-400" /> 体验模式 (Trial Mode)
                                            </span>
                                        )}
                                        {authorized && !isLoading && (
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black rounded-full uppercase tracking-widest italic mb-1 border border-blue-100">
                                                已授权 (Licensed)
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                        <ShieldCheck className="w-4 h-4 text-blue-500" /> {kit.target}
                                    </div>
                                    <p className="max-w-3xl text-slate-500 font-medium leading-relaxed mx-auto lg:mx-0">
                                        {kit.desc}
                                    </p>

                                    <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-6">
                                        {kit.modules.map(mod => (
                                            <div key={mod} className="px-4 py-2 rounded-xl bg-slate-50 text-[10px] font-black text-slate-400 border border-slate-100 flex items-center gap-2 uppercase tracking-tighter">
                                                <div className="w-1 h-1 rounded-full bg-blue-500" /> {mod}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="shrink-0 w-full lg:w-auto flex flex-col items-center">
                                    <Link href={kit.href} className="w-full">
                                        <button className={cn(
                                            "w-full lg:w-56 py-6 rounded-3xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 group",
                                            authorized
                                                ? "bg-slate-900 text-white hover:bg-blue-600 hover:scale-[1.02] shadow-blue-500/10"
                                                : "bg-white border-2 border-slate-200 text-slate-400 hover:border-blue-500 hover:text-blue-600"
                                        )}>
                                            {authorized ? '开启正式学习' : '进入体验课'}
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                    <p className="text-[10px] text-center mt-4 font-black text-slate-300 flex items-center justify-center gap-2 uppercase tracking-widest">
                                        <ShoppingBag className="w-3.5 h-3.5" /> Hardware Bundle Required
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Bottom Highlights */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 rounded-[48px] bg-slate-900 text-white flex gap-6 items-center shadow-2xl">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center shrink-0">
                        <Microscope className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <div className="font-black text-lg mb-1 italic">科学实证教学法</div>
                        <div className="text-sm text-slate-400 font-medium">结合费曼学习法与 PBL，确保每个套件都有实质性的教学产出。</div>
                    </div>
                </div>
                <div className="p-10 rounded-[48px] bg-blue-600 text-white flex gap-6 items-center shadow-2xl shadow-blue-600/20">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
                        <FlaskConical className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <div className="font-black text-lg mb-1 italic">软硬协同进化</div>
                        <div className="text-sm text-blue-100 font-medium">套件不只是硬件，而是连接线上 AI 与 SaaS 生成能力的实体媒介。</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
