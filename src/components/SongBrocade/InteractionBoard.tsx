import React from 'react';
import { Download, SlidersHorizontal, RefreshCcw } from 'lucide-react';

interface Props {
  columns: number;
  setColumns: (val: number) => void;
  rows: number;
  setRows: (val: number) => void;
  offsetX: number;
  setOffsetX: (val: number) => void;
  onExportPDF: () => void;
}

export function InteractionBoard({
  columns,
  setColumns,
  rows,
  setRows,
  offsetX,
  setOffsetX,
  onExportPDF,
}: Props) {
  return (
    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 flex flex-col gap-6 w-80 text-white shadow-xl h-full">
      <div>
        <h3 className="text-xl font-black italic tracking-wider flex items-center gap-2 mb-1">
          宋锦织造 <span className="text-xs text-orange-400 uppercase tracking-widest px-2 py-0.5 bg-orange-500/10 rounded-full">Tiling</span>
        </h3>
        <p className="text-xs text-slate-400 font-medium leading-relaxed">
          调整经纬结构和四方连续的平移量，生成宋锦循环纹样并导出为 PDF。
        </p>
      </div>

      <div className="space-y-6 flex-1">
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-300">列数 (Cols)</span>
            <span className="text-orange-400 font-mono">{columns}</span>
          </div>
          <input
            type="range"
            min="2"
            max="12"
            step="1"
            value={columns}
            onChange={(e) => setColumns(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-300">行数 (Rows)</span>
            <span className="text-orange-400 font-mono">{rows}</span>
          </div>
          <input
            type="range"
            min="2"
            max="12"
            step="1"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-300">交错偏移 (Offset X)</span>
            <span className="text-orange-400 font-mono">{offsetX}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={offsetX}
            onChange={(e) => setOffsetX(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-white/10 mt-auto">
        <button
          onClick={onExportPDF}
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl flex items-center justify-center gap-2 font-black transition-colors shadow-lg active:scale-95"
        >
          <Download className="w-4 h-4" /> 导出教案 PDF
        </button>
      </div>
    </div>
  );
}
