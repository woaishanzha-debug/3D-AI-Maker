import React from 'react';
import { Download, SlidersHorizontal, RefreshCcw } from 'lucide-react';

interface Props {
  shatterCount: number;
  setShatterCount: (val: number) => void;
  gapSize: number;
  setGapSize: (val: number) => void;
  onGenerate: () => void;
  onExport: () => void;
}

export function InteractionBoard({
  shatterCount,
  setShatterCount,
  gapSize,
  setGapSize,
  onGenerate,
  onExport,
}: Props) {
  return (
    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 flex flex-col gap-6 w-80 text-white shadow-xl h-full">
      <div>
        <h3 className="text-xl font-black italic tracking-wider flex items-center gap-2 mb-1">
          螺钿碎片 <span className="text-xs text-blue-400 uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 rounded-full">Shatter</span>
        </h3>
        <p className="text-xs text-slate-400 font-medium leading-relaxed">
          调整碎片数量和间隙，模拟天然贝壳的破裂拼贴效果 (Voronoi 细分)。
        </p>
      </div>

      <div className="space-y-6 flex-1">
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-300">碎片密度 (Density)</span>
            <span className="text-blue-400 font-mono">{shatterCount}</span>
          </div>
          <input
            type="range"
            min="10"
            max="150"
            step="5"
            value={shatterCount}
            onChange={(e) => setShatterCount(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-300">碎片间隙 (Gap)</span>
            <span className="text-blue-400 font-mono">{gapSize}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={gapSize}
            onChange={(e) => setGapSize(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <button
          onClick={onGenerate}
          className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 font-bold transition-colors"
        >
          <RefreshCcw className="w-4 h-4" /> 重新生成碎纹
        </button>
      </div>

      <div className="pt-6 border-t border-white/10 mt-auto">
        <button
          onClick={onExport}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center gap-2 font-black transition-colors shadow-lg active:scale-95"
        >
          <Download className="w-4 h-4" /> 导出 SVG 底板
        </button>
      </div>
    </div>
  );
}
