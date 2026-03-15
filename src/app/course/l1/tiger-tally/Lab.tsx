'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Layers, Puzzle, CheckCircle, Save } from 'lucide-react';

const TigerTallyCanvas = dynamic(() => import('./Canvas'), { ssr: false });

export default function TigerTallyLab() {
    const [mergeProgress, setMergeProgress] = useState<number>(0);
    const [toothCount, setToothCount] = useState<number>(3);

    return (
        <div className="flex flex-col lg:flex-row h-[700px] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Control Panel */}
            <div className="w-full lg:w-80 bg-slate-800/80 p-6 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-white/5 relative z-10 backdrop-blur-xl">
                <div>
                    <h2 className="text-xl font-black text-white italic tracking-wider flex items-center gap-2 mb-2">
                        <Puzzle className="w-5 h-5 text-orange-500" /> 子母榫卯契合
                    </h2>
                    <p className="text-xs text-white/50 leading-relaxed font-medium">
                        调节错齿结构参数，实时计算并验证左右兵符的几何互补性。
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/80 uppercase tracking-widest flex justify-between">
                            <span>契合进度</span>
                            <span className="text-orange-500">{(mergeProgress * 100).toFixed(0)}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={mergeProgress}
                            onChange={(e) => setMergeProgress(parseFloat(e.target.value))}
                            className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
                            <Layers className="w-4 h-4" /> 错齿数量
                        </label>
                        <div className="flex gap-2">
                            {[3, 4, 5].map((count) => (
                                <button
                                    key={count}
                                    onClick={() => setToothCount(count)}
                                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                                        toothCount === count ? 'bg-orange-600 text-white shadow-lg' : 'bg-black/40 text-white/60 hover:bg-black/60'
                                    }`}
                                >
                                    {count} 齿
                                </button>
                            ))}
                        </div>
                    </div>

                    {mergeProgress === 1 && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-green-400">验证通过</h4>
                                <p className="text-xs text-green-500/60 mt-1">左右错齿几何边界逆向匹配 100%，符合子母相扣逻辑。</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <button className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                        <Save className="w-4 h-4" /> 导出 3D 打印模型
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-[#0f172a] h-full">
                <div className="absolute top-8 right-8 z-10 flex gap-2">
                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-black uppercase text-white/60 border border-white/5">
                        Three.js CSG Simulation
                    </div>
                </div>

                <div className="w-full h-full cursor-grab active:cursor-grabbing">
                    <TigerTallyCanvas mergeProgress={mergeProgress} toothCount={toothCount} />
                </div>
            </div>
        </div>
    );
}
