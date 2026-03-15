'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Layers, Palette } from 'lucide-react';

const TangSancaiCanvas = dynamic(() => import('./Canvas'), { ssr: false });

export default function TangSancaiLab() {
    const [glazeIntensity, setGlazeIntensity] = useState<number>(0.5);
    const [headType, setHeadType] = useState<number>(0);
    const [bodyType, setBodyType] = useState<number>(0);

    return (
        <div className="flex flex-col lg:flex-row h-[700px] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Control Panel */}
            <div className="w-full lg:w-80 bg-slate-800/80 p-6 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-white/5 relative z-10 backdrop-blur-xl">
                <div>
                    <h2 className="text-xl font-black text-white italic tracking-wider flex items-center gap-2 mb-2">
                        <Palette className="w-5 h-5 text-amber-500" /> 唐三彩窑变与釉流
                    </h2>
                    <p className="text-xs text-white/50 leading-relaxed font-medium">
                        调节窑温（釉色流动强度）并组装不同造型的模块化结构。
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/80 uppercase tracking-widest flex justify-between">
                            <span>釉色流动强度</span>
                            <span className="text-amber-500">{(glazeIntensity * 100).toFixed(0)}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={glazeIntensity}
                            onChange={(e) => setGlazeIntensity(parseFloat(e.target.value))}
                            className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
                            <Layers className="w-4 h-4" /> 头部造型
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {[0, 1].map((type) => (
                                <button
                                    key={`head-${type}`}
                                    onClick={() => setHeadType(type)}
                                    className={`py-3 text-sm font-bold rounded-xl transition-all ${
                                        headType === type ? 'bg-amber-600 text-white shadow-lg' : 'bg-black/40 text-white/60 hover:bg-black/60'
                                    }`}
                                >
                                    Type {type + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
                            <Layers className="w-4 h-4" /> 身体造型
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {[0, 1].map((type) => (
                                <button
                                    key={`body-${type}`}
                                    onClick={() => setBodyType(type)}
                                    className={`py-3 text-sm font-bold rounded-xl transition-all ${
                                        bodyType === type ? 'bg-amber-600 text-white shadow-lg' : 'bg-black/40 text-white/60 hover:bg-black/60'
                                    }`}
                                >
                                    Type {type + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <button className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                        保存窑变方案
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-[#0f172a] h-full">
                <div className="absolute top-8 right-8 z-10 flex gap-2">
                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-black uppercase text-white/60 border border-white/5">
                        WebGL Shader Material
                    </div>
                </div>

                <div className="w-full h-full cursor-grab active:cursor-grabbing">
                    <TangSancaiCanvas glazeIntensity={glazeIntensity} headType={headType} bodyType={bodyType} />
                </div>
            </div>
        </div>
    );
}
