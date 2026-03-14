'use client';

import React, { useState, useRef } from 'react';
import TerracottaCanvas, { TerracottaCanvasRef } from './TerracottaCanvas';
import { exportSvgTo3mf } from '@/lib/svgTo3mfConverter';
import { Eraser, Pencil, MousePointer2, Download, Layers } from 'lucide-react';

export type ToolType = 'base' | 'coil' | 'detail' | 'eraser';
export type LayerType = 'Layer 1' | 'Layer 2' | 'Layer 3';

export default function InteractionBoard() {
  const [tool, setTool] = useState<ToolType>('base');
  const [layer, setLayer] = useState<LayerType>('Layer 1');
  const canvasRef = useRef<TerracottaCanvasRef>(null);

  const handleExport3MF = async () => {
    if (!canvasRef.current) return;

    const svgString = canvasRef.current.getSvg();
    if (!svgString) {
      alert('Failed to generate SVG. Please draw something first.');
      return;
    }

    try {
      await exportSvgTo3mf(svgString, {
        baseLayerId: 'Terracotta_Base',
        baseDepth: 1.5,
        itemDepth: 3.0, // Fallback depth
        layerConfigs: [
          { id: 'Coil_Layer_1', depth: 3.0 },
          { id: 'Coil_Layer_2', depth: 4.5 },
          { id: 'Coil_Layer_3', depth: 6.0 }
        ],
        filename: 'terracotta_warrior.3mf',
        groupName: 'Terracotta_Warrior_Project'
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export to 3MF failed.');
    }
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full gap-4 max-w-6xl mx-auto w-full text-black">
      <div className="flex flex-wrap justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">

        {/* Tools */}
        <div className="flex gap-2 items-center mb-2 md:mb-0">
          <div className="text-sm font-bold text-slate-500 mr-2 uppercase tracking-wider">Tools</div>
          <button
            onClick={() => setTool('base')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              tool === 'base'
                ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-inner'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
            title="Base Silhouette"
          >
            <Layers className="w-4 h-4" /> 立胎
          </button>

          <button
            onClick={() => setTool('coil')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              tool === 'coil'
                ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-inner'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
            title="Coiling/Stacking Brush"
          >
            <Pencil className="w-4 h-4" /> 盘条
          </button>

          <button
            onClick={() => setTool('detail')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              tool === 'detail'
                ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-inner'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
            title="Armor Details"
          >
            <MousePointer2 className="w-4 h-4" /> 塑形
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              tool === 'eraser'
                ? 'bg-red-50 text-red-600 border border-red-200 shadow-inner'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
            title="Clear/Eraser"
          >
            <Eraser className="w-4 h-4" /> 清泥
          </button>
        </div>

        {/* Layers (Only active when Coiling or Details are selected) */}
        <div className="flex gap-2 items-center border-l pl-4 border-slate-200 mb-2 md:mb-0">
          <div className="text-sm font-bold text-slate-500 mr-2 uppercase tracking-wider">Layer</div>
          {(['Layer 1', 'Layer 2', 'Layer 3'] as LayerType[]).map((l) => (
            <button
              key={l}
              onClick={() => setLayer(l)}
              disabled={tool === 'base' || tool === 'eraser'}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                layer === l
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 md:ml-auto border-l pl-4 border-slate-200">
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-colors border border-slate-200"
          >
            清空 (Clear)
          </button>

          <button
            onClick={handleExport3MF}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium shadow-md transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> 入窑 (Export 3MF)
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-inner overflow-hidden border border-slate-200 relative flex justify-center items-center">
        <TerracottaCanvas ref={canvasRef} tool={tool} layer={layer} />
      </div>
    </div>
  );
}
