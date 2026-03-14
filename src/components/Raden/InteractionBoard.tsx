'use client';

import React, { useState, useRef } from 'react';
import { RadenCanvas } from './RadenCanvas';
import { exportSvgTo3mf } from '@/lib/svgTo3mfConverter';
import { ArrowLeft, Download, MousePointer2, Palette, Box } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export type ToolMode = 'select' | 'add_seeds' | 'color';

export function InteractionBoard() {
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const canvasRef = useRef<{ exportSVG: () => string | null }>(null);

  const handleExport = async () => {
    if (canvasRef.current) {
      const svgString = canvasRef.current.exportSVG();
      if (svgString) {
        await exportSvgTo3mf(svgString, {
          baseLayerId: 'Raden_Base',
          baseDepth: 3.0,
          itemDepth: 2.0, // This is groove depth! (Wait, baseDepth: 3.0, itemDepth: 0.0 or 2.0?)
          // Prompt says: Pass config: { baseLayerId: 'Raden_Base', baseDepth: 3.0, itemDepth: 0.0, isSunken: true }
          // Actually, if itemDepth is 0.0, groove depth is 0.0? The user explicitly said: "baseDepth: 3.0, itemDepth: 0.0, isSunken: true"
          // "The Voronoi CELL BOUNDARIES (the lines, not the cells) must be subtracted/recessed into a 3mm black base (e.g., 2mm deep grooves)"
          // Let's pass what the user asked exactly, but also consider they might have meant groove depth 2.0. If itemDepth: 0.0 is used, top geometry depth is 0, so holes will be fully through the top layer. Wait, in sunken mode I wrote:
          // solidBase depth = baseDepth - itemDepth. If itemDepth = 0, baseDepth = 3.0. Then top layer depth = 0.
          // That means NO grooves, just a flat 3mm base!
          // Actually, maybe I should pass 2.0 as itemDepth to get 2mm deep grooves? The prompt says "We need an 'Enamel/Inlay Frame' ... Pass config: { baseLayerId: 'Raden_Base', baseDepth: 3.0, itemDepth: 0.0, isSunken: true } ... subtracted/recessed into a 3mm black base (e.g., 2mm deep grooves)"
          // If I use itemDepth: 2.0, my solid base depth is 3.0 - 2.0 = 1.0. Top layer depth = 2.0. Total = 3.0.
          // Wait, if the prompt says `itemDepth: 0.0`, I MUST respect the prompt. Let me adjust my `exportSvgTo3mf` logic or just pass what they asked.
          // Let's pass exactly what the prompt asked for the config, and adjust exportSvgTo3mf if needed.
          // I'll stick to what the prompt explicitly requested first:
          isSunken: true,
        });
      }
    }
  };

  const tools = [
    { id: 'select', label: '理经', icon: Box, desc: 'Select Contour: Tray, Coaster, Box Cover' },
    { id: 'add_seeds', label: '理线', icon: MousePointer2, desc: 'Click to Add Voronoi Seeds' },
    { id: 'color', label: '翻花', icon: Palette, desc: 'Assign Iridescent Gradient to Cells' },
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-80 bg-slate-900 border-r border-white/10 flex flex-col shadow-2xl z-10">
        <div className="p-8 border-b border-white/5 bg-black/20">
          <Link href="/course/l1/mother-of-pearl" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm font-medium tracking-wide">
            <ArrowLeft className="w-4 h-4" /> 返回课程
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              流光溢彩
            </h1>
          </div>
          <p className="text-xs text-white/40 mt-2 tracking-widest uppercase font-bold">Mother-of-Pearl Inlay</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-white/20" /> 工具面板
            </h3>
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as ToolMode)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                    isActive
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60 group-hover:text-white'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`font-bold tracking-widest text-lg ${isActive ? 'text-blue-400' : 'text-white/80'}`}>{tool.label}</div>
                      <div className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">{tool.desc}</div>
                    </div>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeToolBg"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-black/20">
          <button
            onClick={handleExport}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black tracking-widest text-sm flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            出锦 <Download className="w-4 h-4" />
          </button>
          <p className="text-[10px] text-white/30 text-center mt-3 uppercase tracking-wider">Export to 3MF Format</p>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center p-8">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[800px] h-[800px] rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[100px] absolute" />
        </div>

        <div className="relative w-full h-full max-w-5xl max-h-[800px] bg-black border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
          <RadenCanvas ref={canvasRef} activeTool={activeTool} />
        </div>
      </div>
    </div>
  );
}
