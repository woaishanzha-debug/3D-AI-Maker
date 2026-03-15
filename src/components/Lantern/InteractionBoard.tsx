import React from 'react';
import { Download, SlidersHorizontal, RefreshCcw } from 'lucide-react';

interface Props {
  sides: number;
  setSides: (val: number) => void;
  radius: number;
  setRadius: (val: number) => void;
  onExport3MF: () => void;
}

export function InteractionBoard({
  sides,
  setSides,
  radius,
  setRadius,
  onExport3MF,
}: Props) {
  return (
    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 flex flex-col gap-6 w-80 text-white shadow-xl h-full">
      <div>
        <h3 className="text-xl font-black italic tracking-wider flex items-center gap-2 mb-1">
          榫卯花灯 <span className="text-xs text-red-400 uppercase tracking-widest px-2 py-0.5 bg-red-500/10 rounded-full">Frame</span>
        </h3>
        <p className="text-xs text-slate-400 font-medium leading-relaxed">
          调整多边形骨架的边数和半径，生成榫卯结构的灯笼框架以供 3D 打印。
        </p>
      </div>

      <div className="space-y-6 flex-1">
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-300">框架边数 (Sides)</span>
            <span className="text-red-400 font-mono">{sides}</span>
          </div>
          <input
            type="range"
            min="3"
            max="12"
            step="1"
            value={sides}
            onChange={(e) => setSides(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-300">灯笼半径 (Radius)</span>
            <span className="text-red-400 font-mono">{radius}px</span>
          </div>
          <input
            type="range"
            min="50"
            max="200"
            step="10"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-white/10 mt-auto">
        <button
          onClick={onExport3MF}
          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl flex items-center justify-center gap-2 font-black transition-colors shadow-lg active:scale-95"
        >
          <Download className="w-4 h-4" /> 导出 3MF 骨架
        </button>
      </div>
    </div>
  );
}
