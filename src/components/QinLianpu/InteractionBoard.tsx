"use client";

import React, { useState, useEffect } from 'react';
import { Download, Trash2, Eye, Paintbrush, Stamp } from 'lucide-react';
import { EVENTS } from '@/lib/event-bus';
import { exportSvgTo3mf } from '@/lib/svgTo3mfConverter';

type ToolId = 'draw' | 'stamp';

export default function InteractionBoard() {
  const [activeTool, setActiveTool] = useState<ToolId>('draw');
  const [showGuides, setShowGuides] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Notify tool changes to canvas
  useEffect(() => {
    const event = new CustomEvent(EVENTS.TOOL_CHANGED, { detail: { tool: activeTool } });
    window.dispatchEvent(event);
  }, [activeTool]);

  const toggleGuides = () => {
    const newValue = !showGuides;
    setShowGuides(newValue);
    const event = new CustomEvent('qinlianpu:toggle_guides', { detail: { show: newValue } });
    window.dispatchEvent(event);
  };

  const clearCanvas = () => {
    const event = new CustomEvent(EVENTS.CLEAR_CANVAS);
    window.dispatchEvent(event);
  };

  const export3MF = () => {
    setIsExporting(true);

    // Request SVG from canvas
    const handleSvgExported = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const svgString = customEvent.detail.svg;

      try {
        await exportSvgTo3mf(svgString, {
          baseLayerId: 'Lianpu_Base',
          baseDepth: 2.0,
          itemDepth: 3.5
        });

        // Dispatch success
        window.dispatchEvent(new CustomEvent(EVENTS.EXPORT_3MF_SUCCESS));
      } catch (error) {
        console.error('Export failed:', error);
      } finally {
        setIsExporting(false);
        window.removeEventListener(EVENTS.SVG_EXPORTED, handleSvgExported);
      }
    };

    window.addEventListener(EVENTS.SVG_EXPORTED, handleSvgExported);
    window.dispatchEvent(new CustomEvent(EVENTS.REQUEST_SVG));
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 bg-red-500 rounded-full" />
        <h2 className="text-xl font-bold text-white tracking-wider">秦腔脸谱工作坊</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveTool('draw')}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
            activeTool === 'draw'
              ? 'bg-red-500/20 border-red-500/50 text-red-400'
              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Paintbrush className="w-4 h-4" />
          <span className="font-medium">勾骨 (Symmetrical Brush)</span>
        </button>

        <button
          onClick={() => setActiveTool('stamp')}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
            activeTool === 'stamp'
              ? 'bg-red-500/20 border-red-500/50 text-red-400'
              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Stamp className="w-4 h-4" />
          <span className="font-medium">点纹 (Totem Stamp)</span>
        </button>
      </div>

      <div className="h-px w-full bg-white/5" />

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={toggleGuides}
          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
            showGuides
              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span className="text-xs font-medium">立轴 (Toggle Guide)</span>
        </button>

        <button
          onClick={clearCanvas}
          className="flex flex-col items-center gap-2 p-3 rounded-xl border bg-white/5 border-white/10 text-slate-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-xs font-medium">净面 (Clear Canvas)</span>
        </button>

        <button
          onClick={export3MF}
          disabled={isExporting}
          className="flex flex-col items-center gap-2 p-3 rounded-xl border bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-emerald-400 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all disabled:opacity-50"
        >
          {isExporting ? (
            <div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          <span className="text-xs font-medium">出模 (Export 3MF)</span>
        </button>
      </div>
    </div>
  );
}
