'use client';

import { useState } from 'react';
import { Terminal, Palette, ArrowRight, Save, UserCheck, Sparkles, ShieldCheck, Zap, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Ailesson2Page() {
    const [persona, setPersona] = useState({
        name: '',
        role: '算法专家',
        tone: '专业且冷峻',
        expertise: ''
    });

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-purple-100 font-sans pb-20">
            {/* 1. Sticky Header */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/course/12-ai/lesson-1" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <ChevronLeft className="w-5 h-5 text-slate-400" />
                        </Link>
                        <div>
                            <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest leading-none mb-1">Module AI-A2 | Persona Architecture</div>
                            <div className="text-sm font-black text-slate-800">特征向量：Persona 系统角色设定</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Identity Engine: Online</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 2. Hero Section */}
            <header className="py-24 relative overflow-hidden bg-slate-50 border-b border-slate-100">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:40px_40px]"></div>
                </div>
                <div className="max-w-5xl mx-auto px-6 relative z-10 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full border border-purple-200"
                    >
                        <Sparkles className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">A2: 身份架构理论</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black italic tracking-tighter text-slate-900"
                    >
                        人设架构：<br />
                        <span className="text-purple-600">System Prompt</span> 设定
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl"
                    >
                        在 LLM 的世界里，身份即是一组复杂的参数偏移。通过定义系统提示词，我们可以在海量神经元中通过“人设”锚定特定的逻辑区域。
                    </motion.p>
                </div>
            </header>

            {/* 3. Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Theoretical Concept */}
                    <div className="lg:col-span-4 space-y-12">
                        <section className="space-y-6">
                            <h3 className="text-sm font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> 角色锚定原理
                            </h3>
                            <div className="space-y-6">
                                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                    <div className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">System Role</div>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        系统提示词是 AI 的“潜意识”。它先于用户提问被加载，决定了模型响应的基础概率分布。
                                    </p>
                                </div>
                                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                    <div className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Vector Shaping</div>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        通过“你是一个...”的设定，模型会进入特定的知识子空间（例如：代码子空间或艺术子空间）。
                                    </p>
                                </div>
                            </div>
                        </section>

                        <div className="p-8 bg-purple-50 rounded-[32px] border border-purple-100">
                            <h3 className="text-sm font-black mb-3 flex items-center gap-2 text-purple-700">
                                <Zap className="w-4 h-4" /> 专家指令秘籍
                            </h3>
                            <p className="text-xs text-purple-600/70 leading-relaxed font-medium">
                                优秀的 Persona 设定应包含“任务约束”、“语气字典”与“处理逻辑”。不要只说“你是老师”，要说“你是一个擅长用苏格拉底式提问来启发学生的引导者”。
                            </p>
                        </div>
                    </div>

                    {/* Interaction Workshop */}
                    <div className="lg:col-span-8 space-y-12">
                        <section className="bg-white rounded-[48px] border border-slate-200 p-8 md:p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                                <Palette className="w-64 h-64 rotate-12 text-purple-600" />
                            </div>

                            <h2 className="text-3xl font-black mb-12 italic flex items-center gap-4 text-slate-900">
                                <Terminal className="w-8 h-8 text-purple-500" /> 特征向量实验室
                            </h2>

                            <div className="space-y-10 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">助手标识符 (Identifier)</label>
                                        <input
                                            type="text"
                                            value={persona.name}
                                            onChange={(e) => setPersona({ ...persona, name: e.target.value })}
                                            placeholder="Entry Name..."
                                            className="w-full px-6 py-5 bg-slate-50 rounded-2xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/5 outline-none transition-all text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">工作角色 (Role Segment)</label>
                                        <select
                                            value={persona.role}
                                            onChange={(e) => setPersona({ ...persona, role: e.target.value })}
                                            className="w-full px-6 py-5 bg-slate-50 rounded-2xl border border-slate-200 focus:border-purple-500 outline-none text-sm font-bold cursor-pointer"
                                        >
                                            <option>算法专家</option>
                                            <option>非遗传承人</option>
                                            <option>架构师</option>
                                            <option>赛博艺术家</option>
                                            <option>逻辑审查员</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">知识库挂载 (Expertise Mapping)</label>
                                    <textarea
                                        value={persona.expertise}
                                        onChange={(e) => setPersona({ ...persona, expertise: e.target.value })}
                                        placeholder="详细定义其知识边界。例如：精通中国景泰蓝工艺流程，熟悉 Blender 几何节点算法..."
                                        className="w-full h-32 px-6 py-5 bg-slate-50 rounded-2xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/5 outline-none transition-all text-sm font-bold resize-none leading-relaxed"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">情感响应梯度 (Tone & Entropy)</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['专业且冷峻', '极具共情力', '充满极客气息', '禅意化表达'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setPersona({ ...persona, tone: t })}
                                                className={`px-6 py-3 rounded-full text-[10px] font-black transition-all border ${persona.tone === t
                                                    ? "bg-purple-600 text-white border-purple-600 shadow-xl shadow-purple-500/20"
                                                    : "bg-white text-slate-500 border-slate-200 hover:border-purple-300"
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button className="group w-full py-6 bg-slate-900 text-white font-black rounded-3xl hover:bg-purple-600 transition-all flex items-center justify-center gap-4 shadow-xl">
                                    <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 注入特征向量并部署
                                </button>
                            </div>
                        </section>

                        {/* Preview Zone */}
                        <div className="p-10 rounded-[48px] bg-slate-50 border border-slate-200 border-dashed">
                            <h3 className="text-[10px] font-black mb-8 flex items-center gap-3 text-slate-400 tracking-widest uppercase">
                                <UserCheck className="w-5 h-5" /> System Instruction Manifest (JSON)
                            </h3>
                            <div className="p-8 bg-slate-900 rounded-[32px] text-sm font-mono leading-relaxed text-purple-300 shadow-2xl">
                                <div className="flex gap-4">
                                    <span className="text-slate-600 shrink-0">01</span>
                                    <span>{`{"role": "system", "content": "你是 <b>${persona.name || '[INIT_NAME]'}</b>"`}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-slate-600 shrink-0">02</span>
                                    <span>{`"identity": "${persona.role}", "tone": "${persona.tone}",`}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-slate-600 shrink-0">03</span>
                                    <span>{`"expertise": "${persona.expertise || 'Global Knowledge Space'}"}`}</span>
                                </div>
                            </div>
                        </div>

                        {/* Next Navigation */}
                        <div className="flex justify-end pt-12">
                            <div className="flex items-center gap-6 py-4 px-8 rounded-3xl border border-slate-200 text-slate-300 cursor-not-allowed">
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-widest">Locked Level</div>
                                    <div className="text-sm font-black italic">A3 - 神经网络推理逻辑</div>
                                </div>
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
