'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Save, Edit3 } from 'lucide-react';

const CoalSealCanvas = dynamic(() => import('./Canvas'), { ssr: false });

export default function CoalSealLab() {
    const [text, setText] = useState<string>('印');

    return (
        <div className="flex flex-col lg:flex-row h-[700px] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Control Panel */}
            <div className="w-full lg:w-80 bg-slate-800/80 p-6 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-white/5 relative z-10 backdrop-blur-xl">
                <div>
                    <h2 className="text-xl font-black text-white italic tracking-wider flex items-center gap-2 mb-2">
                        <Edit3 className="w-5 h-5 text-blue-400" /> 文字雕刻设定
                    </h2>
                    <p className="text-xs text-white/50 leading-relaxed font-medium">
                        输入单字以生成矢量路径并布尔相减至展开面上。
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/80 uppercase tracking-widest flex justify-between">
                            <span>雕刻文字</span>
                            <span className="text-blue-400">{text}</span>
                        </label>
                        <input
                            type="text"
                            maxLength={1}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="mt-auto space-y-3 pt-6 border-t border-white/5">
                    <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                        <Save className="w-4 h-4" /> 保存并导出 SVG
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-[#0f172a] p-6 lg:p-8 flex flex-col min-h-[400px]">
                <div className="absolute top-8 right-8 z-10 flex gap-2">
                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-black uppercase text-white/60 border border-white/5">
                        Paper.js Vector Boolean Subtraction
                    </div>
                </div>

                <div className="flex-1 w-full h-full relative">
                    <CoalSealCanvas text={text} />
                </div>
            </div>
        </div>
    );
}
