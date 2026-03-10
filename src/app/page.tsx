'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Award, Terminal, Layers, Database } from 'lucide-react';
import Link from 'next/link';
import NewsTicker from '@/components/NewsTicker';
import STEAMRadar from '@/components/STEAMRadar';
import AILogicAnimation from '@/components/animations/AILogicAnimation';
import PhysicalManifestationAnimation from '@/components/animations/PhysicalManifestationAnimation';
import SyntheticCreationAnimation from '@/components/animations/SyntheticCreationAnimation';

export default function Home() {
  const learningStepCards = [
    {
      step: '01',
      title: 'AI 互动教育体系：逻辑基石',
      subTitle: 'The Neural Foundation',
      description: '掌握 Token 机制、概率引擎与提示词工程。在学习造物之前，先理解人工智能如何辅助人类思考，建立与未来智能对话的底层逻辑。',
      icon: <AILogicAnimation />,
      link: '/course/ai',
      color: 'blue',
      courses: ['Tokenization 原理', 'Prompt Engineering', 'AI 辅助设计']
    },
    {
      step: '02',
      title: '3D 打印教育体系：物理触达',
      subTitle: 'The Physical Manifestation',
      description: '利用 10 大参数化建模工具，将算法转化为实体。结合非遗文化主题，在指尖实现从 0 到 1 的物理形态构建与 3D 制造。',
      icon: <PhysicalManifestationAnimation />,
      link: '/course/3d',
      color: 'orange',
      courses: ['参数化工具墙', '非遗建模课程', '3D 打印实操']
    },
    {
      step: '03',
      title: 'AI 创客教育体系：软硬协同',
      subTitle: 'The Synthetic Creation',
      description: '融合 AI 代码驱动与声光电硬件。通过高阶创客套件，完成从简单的模型制造到具有交互能力的智能实体的跨越式进化。',
      icon: <SyntheticCreationAnimation />,
      link: '/course/maker',
      color: 'purple',
      courses: ['L-系列综合课', '智能硬件开发', '大模型驱动套件']
    }
  ];

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans selection:bg-blue-100">
      <NewsTicker />

      {/* 1. Hero Section - The Gateway */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-50/50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-100 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-xs font-black tracking-widest text-blue-600 uppercase"
            >
              <Sparkles className="w-3 h-3" />
              <span>Future Maker Management System v2.0</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-8xl font-black tracking-tighter italic leading-[0.9] text-slate-900"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              探索《3D打印<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">AI创客</span>》进化之路
            </motion.h1>

            <motion.p
              className="text-slate-600 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              打破“建模难”与“创意枯竭”瓶颈。我们通过 **AI 逻辑启发**、**3D 算法造物** 与 **智能硬件集成**，建立了一套贯穿数字世界与物理实体的创客成长体系。
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link href="/login">
                <button className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/10 hover:scale-105 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-3">
                  立即接入平台系统 <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/gallery" className="text-slate-500 hover:text-blue-600 transition-colors font-bold flex items-center gap-2">
                浏览创客作品集 <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. The Learning Journey - Tree Logic Structure */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-24 relative">
            {/* Visual Path Line (Desktop) */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200"></div>

            {learningStepCards.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* Text Content */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-6xl font-black italic text-slate-100">{item.step}</span>
                    <div className="h-px flex-1 bg-slate-100"></div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black tracking-[0.3em] text-blue-600 uppercase">{item.subTitle}</h3>
                    <h2 className="text-3xl md:text-5xl font-black italic text-slate-900">{item.title}</h2>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-4">
                    {item.courses.map(c => (
                      <span key={c} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-black text-slate-500">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="pt-6">
                    <Link href={item.link} className="inline-flex items-center gap-3 py-3 px-6 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all group">
                      <span className="text-sm font-black text-slate-900">探索课程目录</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-blue-600" />
                    </Link>
                  </div>
                </div>

                {/* Visual Card */}
                <div className="flex-1 w-full flex justify-center">
                  <div className={`w-full max-w-md aspect-square rounded-[48px] bg-gradient-to-br ${item.color === 'blue' ? 'from-blue-100/50' :
                    item.color === 'orange' ? 'from-orange-100/50' : 'from-purple-100/50'
                    } to-transparent border border-slate-100 p-1 relative overflow-hidden group shadow-sm`}>
                    <div className="absolute inset-0 bg-white rounded-[47px] flex items-center justify-center overflow-hidden">
                      {/* Animated Illustration Component - Full Size */}
                      <div className="w-full h-full relative z-10 transition-transform duration-700">
                        {item.icon}
                      </div>

                      {/* Subtle Background Glow */}
                      <div className={`absolute inset-0 opacity-20 blur-3xl ${item.color === 'blue' ? 'bg-blue-400' :
                        item.color === 'orange' ? 'bg-orange-400' : 'bg-purple-400'
                        }`} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. STEAM Radar integration */}
      <section className="py-32 bg-slate-50 border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-flex py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-200 font-mono">
              Data Driven Growth
            </div>
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none text-slate-900">
              每一步成长<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">皆可量化</span>
            </h2>
            <p className="text-slate-600 font-medium leading-relaxed max-w-lg">
              我们在每一个模块设计中都嵌入了五维能力指标（STEAM）。后台 SaaS 系统实时捕捉学习动态，为学生生成专属的数字创客素养画像。
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-2xl font-black text-slate-900">PBL 导向</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Project Based Learning</div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">跨学科融合</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Synthetic Skills</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400/5 blur-[80px] rounded-full"></div>
            <div className="relative z-10 p-10 bg-white border border-slate-200 shadow-2xl rounded-[48px]">
              <STEAMRadar />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Showcase Simplified */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-black italic mb-4 text-slate-900">进化成就：硬核作品集</h2>
              <p className="text-slate-500 font-medium text-lg">从“构思”到“实体”，见证 AI 与 3D 打印驱动的造物奇迹。</p>
            </div>
            <Link href="/gallery" className="px-8 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all shrink-0">
              进入全球创客社区
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all duration-700">
                <div className="absolute inset-0 flex items-center justify-center p-12 opacity-10">
                  <Award className="w-full h-full text-blue-600" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-200/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 space-y-1">
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Entry #{i}</div>
                  <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors italic">待上传作品工程存档</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-20 border-t border-slate-100 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4">
            3D AI MAKER • SYSTEM ARCHITECTURE
          </div>
          <p className="text-slate-400 text-xs font-medium">© 2026 SONG DESIGN. ALL RIGHTS RESERVED. POWERED BY AI GENERATED AGENTS.</p>
        </div>
      </footer>
    </div>
  );
}
