'use client';

import Link from 'next/link';
import { Layers, Image as ImageIcon, Cpu, Boxes, Rotate3d, Grid, Flower2, Wind, Network, Waves, Sparkles, Lock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

export default function ToolsMarket() {
    const { data: session } = useSession();

    const tools = [
        {
            id: "s1",
            lesson: "S1",
            title: "光影魔术师 (Lithophane)",
            desc: "灰度映射算法：上传二维相片，快速生成 3D 可打印浮雕。厚处成影，薄处透光。",
            icon: ImageIcon,
            color: "text-blue-400",
            status: "Online",
            requiresLogin: false
        },
        {
            id: "s2",
            lesson: "S2",
            title: "物理链接器 (3D QR-Code)",
            desc: "投影阴影算法：生成带有自定义链接的 3D 二维码，通过高低落差形成识别特征。",
            icon: Cpu,
            color: "text-emerald-400",
            status: "Online",
            requiresLogin: true
        },
        {
            id: "s3",
            lesson: "S3",
            title: "柔性折叠结构 (Hinge)",
            desc: "应力分散算法：计算超薄结构弯折形变，生成免装配的一次性打印机械零件。",
            icon: Boxes,
            color: "text-orange-400",
            status: "Coming Soon",
            requiresLogin: true
        },
        {
            id: "s4",
            lesson: "S4",
            title: "重力平衡大师",
            desc: "质心偏移算法：通过非对称填充率计算，实现模型在特定姿态下的重心平衡。",
            icon: Rotate3d,
            color: "text-purple-400",
            status: "Coming Soon",
            requiresLogin: true
        },
        {
            id: "s5",
            lesson: "S5",
            title: "点阵轻量化造型",
            desc: "空间平铺算法：使用 TPMS 函数生成高强度、极轻量的蜂窝状内部网格系统。",
            icon: Grid,
            color: "text-cyan-400",
            status: "Coming Soon",
            requiresLogin: true
        },
        {
            id: "s6",
            lesson: "S6",
            title: "曼陀罗算法艺术",
            desc: "对称递归算法：基于极坐标数学函数，参数化生成镜像对称的精密装饰模型。",
            icon: Flower2,
            color: "text-rose-400",
            status: "Coming Soon",
            requiresLogin: true
        },
        {
            id: "s7",
            lesson: "S7",
            title: "斐波那契螺旋",
            desc: "黄金分割算法：模拟植物生长规律，生成空间最优化分布的螺旋叶片或凹槽。",
            icon: Wind,
            color: "text-amber-400",
            status: "Coming Soon",
            requiresLogin: true
        },
        {
            id: "s8",
            lesson: "S8",
            title: "Voronoi 细胞骨架",
            desc: "空间分区算法：在三维面域内计算泰森多边形，构建具有生物感的镂空骨架。",
            icon: Network,
            color: "text-indigo-400",
            status: "Coming Soon",
            requiresLogin: true
        },
        {
            id: "s9",
            lesson: "S9",
            title: "声波纹理解码",
            desc: "傅里叶变换：将声音频率转化为高度图，为模型表面赋予独特的“声音皮肤”。",
            icon: Waves,
            color: "text-teal-400",
            status: "Coming Soon",
            requiresLogin: true
        },
        {
            id: "s10",
            lesson: "S10",
            title: "AI 创客助手",
            desc: "语义生成算法：利用大模型将描述转化为建模指令，打通从 Prompt 到模型的全路径。",
            icon: Sparkles,
            color: "text-fuchsia-400",
            status: "Coming Soon",
            requiresLogin: true
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-32 space-y-12 relative z-20">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <h1 className="text-4xl md:text-5xl font-black flex justify-center items-center gap-3 italic">
                    <Layers className="w-10 h-10 text-orange-500" />
                    3D 打印教育课程 <span className="text-gradient">Course</span>
                </h1>
                <p className="text-foreground/60 text-lg">
                    10 节原理与算法实操课。每一个轻量化工具对应一个核心算法原理，打通 3D 教育的最后一公里。
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => {
                    const isLocked = tool.requiresLogin && !session;

                    return (
                        <Link
                            href={isLocked ? '/login' : `/tools/${tool.id}`}
                            key={tool.id}
                            className={cn(
                                "group block",
                                isLocked && "opacity-70 grayscale-[0.5]"
                            )}
                        >
                            <div className="glass-panel p-6 h-full flex flex-col hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer relative overflow-hidden">
                                {/* S-Tag Badge */}
                                <div className="absolute -right-2 top-4 bg-primary/20 text-primary font-black text-xl px-4 py-1 italic skew-x-[-12deg] shadow-lg border-l border-white/20 z-10">
                                    {tool.lesson}
                                </div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn(
                                        "w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform",
                                        tool.color
                                    )}>
                                        <tool.icon className="w-7 h-7" />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {isLocked ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold rounded-full border border-red-500/20">
                                                <Lock className="w-3 h-3" /> 激活码授权
                                            </div>
                                        ) : (
                                            <span className={cn(
                                                "px-3 py-1 text-[10px] font-bold rounded-full",
                                                tool.status === 'Online' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-foreground/10 text-foreground/50'
                                            )}>
                                                {tool.status}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                                    {tool.title}
                                </h2>
                                <p className="text-foreground/60 text-xs flex-1 leading-relaxed line-clamp-3">
                                    {tool.desc}
                                </p>

                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">Algorithm Principle</span>
                                    {!isLocked && (
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
