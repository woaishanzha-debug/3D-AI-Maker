'use client';

import { motion } from 'framer-motion';
import { Terminal, Cpu, ChevronRight, Binary } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function Lesson1() {
    const [activeTab, setActiveTab] = useState('token');

    return (
        <div className="bg-white text-slate-900 min-h-screen font-sans selection:bg-blue-100 pb-20">
            {/* 1. Sticky Header */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/course/l1" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <ChevronRight className="w-5 h-5 rotate-180 text-slate-400" />
                        </Link>
                        <div>
                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Module AI-A1 | Neural Foundations</div>
                            <div className="text-sm font-black text-slate-800">数字神经元：Token 机制与概率引擎</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">System Link: Active</span>
                        </div>
                        <button className="px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-lg hover:bg-slate-800 transition-all">
                            同步笔记
                        </button>
                    </div>
                </div>
            </nav>

            {/* 2. Hero Section */}
            <header className="py-24 relative overflow-hidden bg-slate-50 border-b border-slate-100">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:40px_40px]"></div>
                </div>
                <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200"
                    >
                        <Binary className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">A1: 数字化认知理论</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black italic tracking-tighter text-slate-900"
                    >
                        数字神经元：<br />
                        <span className="text-blue-600">Token</span> 机制与概率引擎
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl"
                    >
                        欢迎来到人工智能的底层世界。在本节课中，我们将拆解大语言模型的黑盒，观察文本如何被切割为数字（Tokens），以及 AI 如何通过概率预测构建逻辑。
                    </motion.p>
                </div>
            </header>

            {/* 3. Core Concept Interactive Area */}
            <main className="max-w-5xl mx-auto px-6 -mt-12 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* Theory Sidebar */}
                    <div className="md:col-span-4 space-y-6">
                        <div className={`p-6 rounded-3xl border transition-all cursor-pointer ${activeTab === 'token' ? 'bg-white border-blue-600 shadow-xl shadow-blue-500/10' : 'bg-white/50 border-slate-200 opacity-60'}`} onClick={() => setActiveTab('token')}>
                            <Terminal className="w-6 h-6 mb-4 text-blue-600" />
                            <h3 className="text-lg font-black italic mb-2 text-slate-900">01. TOKENIZATION 分词机制</h3>
                            <p className="text-xs text-slate-500 font-medium font-mono leading-relaxed">AI 并不阅读文字，它看到的由 Token 组成的序列。这是人类文明与机器计算的第一次握手。</p>
                        </div>
                        <div className={`p-6 rounded-3xl border transition-all cursor-pointer ${activeTab === 'prob' ? 'bg-white border-blue-600 shadow-xl shadow-blue-500/10' : 'bg-white/50 border-slate-200 opacity-60'}`} onClick={() => setActiveTab('prob')}>
                            <Cpu className="w-6 h-6 mb-4 text-blue-600" />
                            <h3 className="text-lg font-black italic mb-2 text-slate-900">02. NEXT-TOKEN 概率预测</h3>
                            <p className="text-xs text-slate-500 font-medium font-mono leading-relaxed">AI 的本质是一台超级预测器：给定上文，计算下一个 Token 出现的概率值。</p>
                        </div>
                    </div>

                    {/* Interactive Lab View */}
                    <div className="md:col-span-8 bg-slate-900 rounded-[40px] border border-slate-800 p-8 shadow-2xl overflow-hidden relative group">
                        {activeTab === 'token' ? (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-white/5 font-mono text-[10px] text-slate-500">
                                    <span>Input String: &quot;Future Maker&quot;</span>
                                    <span className="text-blue-500 font-black">Process: Success</span>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {['Fut', 'ure', ' Mak', 'er'].map((t, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2">
                                            <div className="px-6 py-4 bg-blue-600 rounded-xl text-white font-black text-xl italic shadow-lg shadow-blue-500/20">{t}</div>
                                            <div className="text-[10px] font-black text-slate-300 font-mono text-center">ID: {1204 + i}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-10 border-t border-white/5">
                                    <p className="text-sm text-slate-400 font-medium italic">练习：将你的名字输入系统，观察 ID 转化规则。</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="text-xs text-blue-500 font-black font-mono">Context Window...</div>
                                    <div className="text-2xl font-black italic text-white line-through decoration-blue-600 decoration-4">The future is ...</div>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { word: 'Bright', prob: '82%', width: 'w-full' },
                                        { word: 'Digital', prob: '12%', width: 'w-1/4' },
                                        { word: 'Here', prob: '4%', width: 'w-12' },
                                    ].map((item, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between text-xs font-black italic">
                                                <span className="text-white">{item.word}</span>
                                                <span className="text-blue-500">{item.prob}</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className={`h-full bg-blue-600 ${item.width}`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* 4. Footer & Next Link */}
            <footer className="max-w-5xl mx-auto px-6 pt-20 flex justify-end">
                <Link href="/course/12-ai/lesson-2" className="group flex items-center gap-6 p-2 rounded-3xl hover:bg-slate-50 transition-all">
                    <div className="text-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Evolution</div>
                        <div className="text-lg font-black italic text-slate-900">A2 - Persona 特征向量设定</div>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <ChevronRight className="w-8 h-8" />
                    </div>
                </Link>
            </footer>
        </div>
    );
}
