'use client';

import { Cpu, Terminal, Sparkles, Binary, ArrowRight, BrainCircuit, ChevronLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthorization } from '@/hooks/useAuthorization';
import { cn } from '@/lib/utils';

export default function AICourseIndex() {
    const { isAuthorizedSeries, isLoading } = useAuthorization();
    const isAIAuthorized = isAuthorizedSeries('ai-interactive');

    const aiModules = [
        {
            id: 'A1',
            title: '数字化认知：神经元原理',
            desc: '拆解 Token 机制与概率引擎，理解 AI 如何构建逻辑。',
            tech: 'NLP | Tokenization',
            status: '开放试读',
            isExperience: true,
            href: '/course/12-ai/lesson-1'
        },
        {
            id: 'A2',
            title: '提示词工程：与智能对话',
            desc: '通过 Prompt Engineering 引导 AI 完成复杂任务设计。',
            tech: 'Prompt Design',
            status: '账号解锁',
            isExperience: false,
            href: '/course/12-ai/lesson-2'
        }
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 pb-20">
            {/* Header Area */}
            <div className="bg-slate-50 border-b border-slate-200 pt-32 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 right-10 w-64 h-64 bg-blue-400 blur-[100px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-8 font-bold text-sm group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回主控中心
                    </Link>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black tracking-widest uppercase">
                            AI Core System
                        </div>
                        <div className="h-[1px] w-12 bg-slate-300"></div>
                        <span className="text-slate-400 text-xs font-black tracking-wider uppercase">Future Intelligence Education</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6 text-slate-900 leading-none">
                        AI 互动演化<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic">核心课程体系</span>
                    </h1>

                    <p className="max-w-2xl text-slate-600 text-lg font-medium leading-relaxed mb-10">
                        在学习造物之前，先理解人工智能如何辅助人类思考。我们建立了从底层逻辑到高阶提示词设计的完整认知链路。
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link href="/course/12-ai/lesson-1">
                            <button className="flex items-center gap-3 px-8 py-4 bg-blue-600 shadow-xl shadow-blue-500/20 text-white rounded-2xl font-black text-sm hover:bg-blue-700 hover:scale-[1.02] transition-all group active:scale-95">
                                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 体验课直达
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {aiModules.map((module, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link href={module.isExperience || isAIAuthorized ? module.href : "#"} className={cn("group", !module.isExperience && !isAIAuthorized && "cursor-not-allowed")}>
                                <div className={cn(
                                    "h-full bg-white rounded-[32px] border-2 border-slate-100 p-8 transition-all hover:shadow-2xl hover:shadow-blue-500/10",
                                    !module.isExperience && !isAIAuthorized && !isLoading ? "opacity-60 grayscale-[0.8] hover:border-slate-200" : "hover:border-blue-600"
                                )}>
                                    <div className="flex justify-between items-start mb-12">
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                            {idx === 0 ? <Binary className="w-6 h-6" /> : <BrainCircuit className="w-6 h-6" />}
                                        </div>
                                        {!module.isExperience && !isAIAuthorized && !isLoading ? (
                                            <div className="p-2 bg-slate-100 rounded-full text-slate-400">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <span className={cn(
                                                "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                                module.isExperience ? "bg-blue-600 text-white animate-pulse" : "bg-green-50 text-green-600 border border-green-100"
                                            )}>
                                                {isAIAuthorized ? "已授权" : module.status}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black text-slate-300 tracking-widest font-mono">{module.id} | MODULE</div>
                                        <h3 className="text-2xl font-black italic text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                                            {module.title}
                                        </h3>
                                        <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                            {module.desc}
                                        </p>
                                    </div>
                                    <div className="mt-12 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                                        <span>{module.tech}</span>
                                        {(module.isExperience || isAIAuthorized) && (
                                            <ArrowRight className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all" />
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}

                    {/* Placeholder for future expansion */}
                    <div className="bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                        <Sparkles className="w-10 h-10 text-slate-300" />
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Module syncing...</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
