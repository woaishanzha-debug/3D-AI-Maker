'use client';

import { ArrowLeft, CheckCircle2, Cpu, PenTool, LayoutTemplate, Sparkles, BookOpen, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { BusinessModal } from '@/components/BusinessModal';

export default function CourseL1Page() {
    const [completions, setCompletions] = useState<string[]>([]);
    const [showBusinessModal, setShowBusinessModal] = useState(false);

    useEffect(() => {
        fetch('/api/courses/complete')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCompletions(data.map((c: { lessonId: string }) => c.lessonId));
                }
            });
    }, []);

    const toggleCompletion = async (lessonId: string) => {
        const isCurrentlyCompleted = completions.includes(lessonId);

        // Optimistic update
        if (isCurrentlyCompleted) {
            setCompletions(completions.filter(id => id !== lessonId));
        } else {
            setCompletions([...completions, lessonId]);
        }

        try {
            await fetch('/api/courses/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: 'L1', lessonId })
            });
        } catch (err) {
            console.error(err);
        }
    };

    const features = [
        { icon: PenTool, title: '零门槛空间重塑', desc: '通过3D打印笔，将平面思维脱轨至三维世界。' },
        { icon: LayoutTemplate, title: '非遗文化传承', desc: '结合皮影、灯笼等传统元素，在科技中寻根。' },
        { icon: Cpu, title: '底层逻辑积淀', desc: '培养工程直觉，为进阶参数化建模打下基础。' },
    ];

    const syllabus = [
        {
            id: 'P1', phase: '宫廷工艺篇',
            lessons: [
                { name: '景泰蓝工艺：点蓝与掐丝', ppt: '景泰蓝课件.pptx' },
                { name: '掐丝珐琅：金属线描之美', ppt: '掐丝珐琅课件.pptx' },
                { name: '传统刺绣：线性的律动', ppt: '刺绣课件.pptx' },
                { name: '宋锦织造：几何平铺逻辑', ppt: '宋锦课件.pptx' },
            ]
        },
        {
            id: 'P2', phase: '民间艺术篇',
            lessons: [
                { name: '影戏乾坤：皮影戏骨架', ppt: '皮影课件.pptx' },
                { name: '纸上乾坤：镂空艺术窗花', ppt: '窗花课件.pptx' },
                { name: '秦风社火：马勺脸谱', ppt: '马勺课件.pptx' },
                { name: '张灯结彩：传统灯笼形制', ppt: '灯笼课件.pptx' },
            ]
        },
        {
            id: 'P3', phase: '陶艺与书法',
            lessons: [
                { name: '古韵唐风：唐三彩造型', ppt: '唐三彩课件.pptx' },
                { name: '秦俑之光：兵马俑堆叠建造', ppt: '泥条盘筑兵马俑.pptx' },
                { name: '素胚勾勒：青花瓷纹饰', ppt: '青花瓷课件.pptx' },
                { name: '笔墨纸砚：书法空间间架', ppt: '书法课件.pptx' },
            ]
        },
        {
            id: 'P4', phase: '历史记忆篇',
            lessons: [
                { name: '指尖兵符：虎符立体复刻', ppt: '虎符课件.pptx' },
                { name: '流光溢彩：螺钿工艺设计', ppt: '螺钿课件.pptx' },
                { name: '金玉其内：煤精组印逻辑', ppt: '煤精组印课件.pptx' },
                { name: '梨园华彩：秦腔脸谱艺术', ppt: '秦腔脸谱课件.pptx' },
            ]
        },
    ];

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <Link href="/" className="inline-flex items-center text-foreground/60 hover:text-primary transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> 返回平台总览
                </Link>

                <div className="flex flex-col lg:flex-row gap-12 mb-20 items-center">
                    <div className="w-full lg:w-1/2 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                            <Sparkles className="w-4 h-4" /> Level 1 入门教具套件
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight">
                            16节 3D打印<span className="text-gradient">非遗创客</span>套件
                        </h1>
                        <p className="text-foreground/70 text-lg leading-relaxed">
                            专门为初学者打造的黄金起步套件。摒弃冗长枯燥的理论背诵，利用 3D 打印笔“即画即得”的特性，将中国传统非遗文化与现代三维空间能力训练完美融合。学生在零门槛的直观操作中，不知不觉完成工程思维的底层基石构建。
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                            {features.map((feature, i) => (
                                <div key={i} className="glass-panel p-4 flex flex-col gap-2">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-foreground text-sm">{feature.title}</h4>
                                    <p className="text-xs text-foreground/60 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6">
                            <button
                                onClick={() => setShowBusinessModal(true)}
                                className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-[0_0_20px_rgba(2,132,199,0.3)] hover:opacity-90 transition-opacity"
                            >
                                向教育顾问索取完整大纲
                            </button>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 relative h-[500px] md:h-[600px] rounded-3xl overflow-hidden glass-panel flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-primary/5 blur-[50px] z-0"></div>
                        <Image
                            src="/3d-pen-intro.jpg"
                            alt="3D打印笔部件说明图"
                            width={800}
                            height={600}
                            className="w-full h-full object-contain relative z-10 hover:scale-105 transition-transform duration-700 mix-blend-multiply"
                        />
                    </div>
                </div>

                <section className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black mb-4 flex items-center justify-center gap-3">
                            <Sparkles className="w-8 h-8 text-primary" /> 16件非遗主题图谱与物料清单
                        </h2>
                        <p className="text-foreground/60 max-w-2xl mx-auto">从平面图纸到立体成形，一套教具涵盖完整的中国传统非遗与现代创意结构模型实物实录。</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass-panel p-6 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow border border-primary/10 bg-white/60">
                            <h3 className="text-xl font-bold mb-4 text-center text-foreground">📦 专属教具包物料总览</h3>
                            <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-white flex items-center justify-center">
                                <Image
                                    src="/l1-materials.png"
                                    alt="16节3D打印套件教具包物料清单"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow border border-primary/10 bg-white/60">
                            <h3 className="text-xl font-bold mb-4 text-center text-foreground">✨ 16件知识作品实录</h3>
                            <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-white flex items-center justify-center">
                                <Image
                                    src="/l1-works.png"
                                    alt="16节3D打印非遗套件作品实物展示"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black mb-4 flex items-center justify-center gap-3">
                            <Star className="w-8 h-8 text-secondary" /> 优秀学生随堂作品选萃
                        </h2>
                        <p className="text-foreground/60 max-w-2xl mx-auto">见证孩子们如何应用 L1 套件，在现实中将奇思妙想落地成型。</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                        {[
                            { title: '3D打印唐三彩', img: '/students/stu1_new.jpg', tag: '唐三彩' },
                            { title: '3D打印书法', img: '/students/stu2_new.jpg', tag: '装裱工艺' },
                            { title: '3D打印螺钿蝴蝶', img: '/students/stu3_new.jpg', tag: '非遗螺钿' },
                            { title: '3D打印刺绣', img: '/students/stu4_new.jpg', tag: '非遗复刻' },
                            { title: '3D打印悟空皮影', img: '/students/stu5_new.jpg', tag: '皮影戏' }
                        ].map((work, idx) => (
                            <div key={idx} className="group relative rounded-3xl overflow-hidden glass-panel aspect-[4/5] hover:shadow-2xl hover:shadow-primary/20 transition-all cursor-pointer border border-primary/10">
                                <Image
                                    src={work.img}
                                    alt={work.title}
                                    width={400}
                                    height={500}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <div className="inline-block px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-full mb-2 shadow-lg">
                                        {work.tag}
                                    </div>
                                    <h3 className="text-white font-bold text-sm sm:text-base leading-tight">{work.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="syllabus" className="bg-white/50 border border-primary/10 rounded-3xl p-8 md:p-12 shadow-sm">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black mb-4 flex items-center justify-center gap-3">
                            <BookOpen className="w-8 h-8 text-secondary" /> 教具配套核心课程阵列
                        </h2>
                        <p className="text-foreground/60 max-w-2xl mx-auto">16节连环 PBL (项目式学习) 课程，循序渐进搭建学生空间感知能力</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {syllabus.map((phase, idx) => (
                            <div key={idx} className="glass-panel p-6 hover:shadow-lg transition-shadow border-t-4 border-t-primary">
                                <div className="text-4xl font-black text-primary/20 mb-2">P{idx + 1}</div>
                                <h3 className="text-xl font-bold mb-4">{phase.phase}</h3>
                                <ul className="space-y-4 pt-2">
                                    {phase.lessons.map((lesson, i) => {
                                        const lessonKey = `${idx}-${i}`;
                                        const isCompleted = completions.includes(lessonKey);
                                        const isCloisonne = lesson.name.includes('掐丝珐琅');
                                        const isInteractive = isCloisonne; // Currently only cloisonne is interactive

                                        return (
                                            <li
                                                key={i}
                                                className={`group flex items-start gap-4 p-3 rounded-2xl transition-all border ${isInteractive
                                                    ? 'bg-blue-50/50 border-blue-100 hover:border-blue-400 hover:bg-white hover:shadow-xl cursor-pointer shadow-sm'
                                                    : 'bg-slate-50 border-slate-100 opacity-60 grayscale-[0.3]'
                                                    }`}
                                            >
                                                <div className="pt-0.5">
                                                    {isInteractive ? (
                                                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                                                            <Sparkles className="w-3 h-3 text-white animate-pulse" />
                                                        </div>
                                                    ) : (
                                                        <CheckCircle2
                                                            onClick={() => toggleCompletion(lessonKey)}
                                                            className={`w-5 h-5 shrink-0 transition-colors ${isCompleted ? 'text-green-500' : 'text-slate-300 hover:text-primary cursor-pointer'}`}
                                                        />
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-2 grow">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-sm font-black italic tracking-tight ${isInteractive ? 'text-slate-900 group-hover:text-blue-600' : 'text-slate-400'
                                                            } ${isCompleted ? 'line-through opacity-60' : ''}`}>
                                                            {lesson.name}
                                                        </span>
                                                        {isInteractive && (
                                                            <span className="text-[8px] px-2 py-0.5 bg-blue-600 text-white font-black uppercase tracking-widest rounded-full shadow-lg">
                                                                Visitor Access
                                                            </span>
                                                        )}
                                                    </div>

                                                    {isInteractive ? (
                                                        <Link
                                                            href="/course/l1/cloisonne"
                                                            className="text-[10px] text-blue-600 font-black uppercase tracking-[0.1em] flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all font-sans"
                                                        >
                                                            开启数字非遗实验室 <ArrowRight className="w-3 h-3" />
                                                        </Link>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest flex items-center gap-1">
                                                                <BookOpen className="w-3 h-3" /> PPT CONTENT
                                                            </span>
                                                            <span className="text-[9px] text-slate-200 font-medium">|</span>
                                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-200/50 px-2 py-0.5 rounded italic">
                                                                账号解锁
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            <BusinessModal isOpen={showBusinessModal} onClose={() => setShowBusinessModal(false)} />
        </div>
    );
}
