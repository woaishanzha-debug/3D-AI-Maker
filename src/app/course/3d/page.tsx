'use client';

import { Sparkles, ArrowRight, BookOpen, Clock, Users, ChevronLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthorization } from '@/hooks/useAuthorization';
import { cn } from '@/lib/utils';

export default function ThreeDCourseIndex() {
    const { isAuthorizedSeries, isLoading } = useAuthorization();
    const is3DAuthorized = isAuthorizedSeries('3d-printing');

    const categories = [
        {
            title: 'S-系列：大屏互动轻量课',
            desc: '10个参数化 3D 建模工具原理。补足“只打不学”的痛点，打印前深度参与原理设计。',
            items: [
                { id: 'S1', name: '光影魔术师 (Lithophane)', status: '免费', tech: '灰度映射算法', isExperience: true },
                { id: 'S2', name: '物理链接器 (3D QR-Code)', status: '账号解锁', tech: '高低差投影算法', isExperience: false },
                { id: 'S3', name: '柔性折叠结构 (Hinge)', status: '账号解锁', tech: '应力分散算法', isExperience: false },
                { id: 'S4', name: '重力平衡大师 (不倒翁平衡工具)', status: '账号解锁', tech: '质心偏移算法', isExperience: false },
                { id: 'S5', name: '拓扑格子构造 (点阵)', status: '账号解锁', tech: '空间平铺算法', isExperience: false },
                { id: 'S6', name: '曼陀罗算法艺术 (生成式几何工具)', status: '账号解锁', tech: '对称递归算法', isExperience: false },
                { id: 'S7', name: '斐波那契螺旋 (自然频率工具)', status: '账号解锁', tech: '黄金分割算法', isExperience: false },
                { id: 'S8', name: 'Voronoi 细胞骨架 (泰森多边形工具)', status: '账号解锁', tech: '空间分区算法', isExperience: false },
                { id: 'S9', name: '声波纹理解码 (音频视觉化工具)', status: '账号解锁', tech: '傅里叶变换 (FFT)', isExperience: false },
                { id: 'S10', name: 'AI 创客助手 (Prompt-to-3D)', status: '账号解锁', tech: '大模型向量生成', isExperience: false },
            ],
            href: '/tools',
            icon: Sparkles,
            color: 'text-orange-600',
            borderColor: 'border-orange-200',
            bgColor: 'bg-orange-50',
        },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-orange-100 pb-20">
            {/* Header Area */}
            <div className="bg-slate-50 border-b border-slate-200 pt-32 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 right-10 w-64 h-64 bg-orange-400 blur-[100px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-600 transition-colors mb-8 font-bold text-sm group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回主控中心
                    </Link>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="px-3 py-1 bg-orange-600 text-white rounded-full text-[10px] font-black tracking-widest uppercase">
                            3D Printing Focus
                        </div>
                        <div className="h-[1px] w-12 bg-slate-300"></div>
                        <span className="text-slate-400 text-xs font-black tracking-wider uppercase">Digital Creation & Heritage</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6 text-slate-900 leading-none">
                        3D 打印教育<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 italic">课程全景目录</span>
                    </h1>

                    <p className="max-w-2xl text-slate-600 text-lg font-medium leading-relaxed mb-10">
                        补足“只打不学”的痛点。从参数化算法设计到非遗文化融合，我们建立了一套让 3D 打印真正服务于创造力的课程体系。
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link href="/course/3d/s1-lithophane">
                            <button className="flex items-center gap-3 px-8 py-4 bg-orange-600 shadow-xl shadow-orange-500/20 text-white rounded-2xl font-black text-sm hover:bg-orange-700 hover:scale-[1.02] transition-all group active:scale-95">
                                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 体验课直达
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="max-w-7xl mx-auto px-6 py-20 space-y-16">
                {categories.map((cat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={cn(
                            "bg-white rounded-[48px] border-2 p-8 md:p-12 relative overflow-hidden group hover:shadow-2xl transition-all shadow-xl shadow-slate-200/50",
                            cat.borderColor
                        )}
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                            <cat.icon className="w-80 h-80" />
                        </div>

                        <div className="flex flex-col lg:flex-row gap-16 relative z-10">
                            {/* Left Column: Category Info */}
                            <div className="lg:w-1/3 space-y-8">
                                <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center", cat.bgColor)}>
                                    <cat.icon className={cn("w-10 h-10", cat.color)} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black mb-4 group-hover:text-slate-900 transition-colors italic">{cat.title}</h2>
                                    <p className="text-slate-500 font-medium leading-relaxed">{cat.desc}</p>
                                </div>
                                <Link href={cat.href}>
                                    <button className="flex items-center gap-3 font-black text-slate-900 hover:text-orange-600 transition-all uppercase tracking-widest text-sm">
                                        进入体系专区 <ArrowRight className="w-5 h-5" />
                                    </button>
                                </Link>
                            </div>

                            {/* Right Column: Course Items Grid */}
                            <div className="lg:w-2/3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {cat.items.map((item, i) => {
                                        const isAccessible = item.isExperience || is3DAuthorized;
                                        const itemContent = (
                                            <div className={cn(
                                                "p-6 rounded-3xl border transition-all shadow-sm h-full flex flex-col justify-between group/item",
                                                isAccessible ? "bg-white border-orange-200 hover:border-orange-500 hover:shadow-xl cursor-pointer" : "bg-slate-50 border-slate-100 opacity-60 grayscale-[0.5]"
                                            )}>
                                                <div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-[12px] font-black text-slate-300 tracking-tighter">{item.id}</span>
                                                        {!isAccessible && !isLoading ? (
                                                            <div className="p-1.5 bg-slate-100 rounded-full text-slate-400">
                                                                <Lock className="w-3 h-3" />
                                                            </div>
                                                        ) : (
                                                            <span className={cn(
                                                                "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg transition-all",
                                                                item.isExperience ? 'bg-orange-600 text-white shadow-orange-600/20 animate-pulse' : 'bg-green-50 text-green-600 border border-green-100'
                                                            )}>
                                                                {is3DAuthorized ? '已授权' : item.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className={cn(
                                                        "font-black mb-2 italic transition-colors",
                                                        isAccessible ? "text-slate-900 group-hover/item:text-orange-600" : "text-slate-400"
                                                    )}>
                                                        {item.name}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center justify-between mt-4">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.tech}</p>
                                                    {isAccessible && <ArrowRight className="w-4 h-4 text-orange-600 opacity-0 group-hover/item:opacity-100 translate-x-[-10px] group-hover/item:translate-x-0 transition-all" />}
                                                </div>
                                            </div>
                                        );

                                        return isAccessible ? (
                                            <Link key={i} href={item.id === 'S1' ? "/course/3d/s1-lithophane" : cat.href}>
                                                {itemContent}
                                            </Link>
                                        ) : (
                                            <div key={i}>{itemContent}</div>
                                        );
                                    })}
                                    <div className="p-6 rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">
                                        More Tools syncing...
                                    </div>
                                </div>

                                {/* Tags Area */}
                                <div className="mt-12 flex flex-wrap items-center gap-8 text-[10px] uppercase font-black tracking-[0.3em] text-slate-400">
                                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg"><BookOpen className="w-3 h-3" /> 互动课件</div>
                                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg"><Users className="w-3 h-3" /> 协同大屏</div>
                                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg"><Clock className="w-3 h-3" /> 45MIN/课</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
