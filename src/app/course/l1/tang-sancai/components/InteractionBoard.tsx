import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SancaiCanvas, SancaiCanvasRef } from './SancaiCanvas';
import { exportSvgTo3mf } from '@/lib/svgTo3mfConverter';
import { Download, Palette, Layers, Droplet } from 'lucide-react';

export const InteractionBoard = () => {
  const canvasRef = useRef<SancaiCanvasRef>(null);
  const [activeTool, setActiveTool] = useState<'move' | 'color'>('move');
  const [activeColor, setActiveColor] = useState<string>('#2e8b57'); // default Green

  const components = [
    'Horse Head', 'Horse Body',
    'Camel Head', 'Camel Body',
    'Lady Head', 'Lady Body',
    'Base'
  ];

  const colors = [
    { name: 'Green', value: '#2e8b57' },
    { name: 'Yellow', value: '#d4a373' },
    { name: 'Blue', value: '#4682b4' },
    { name: 'Brown', value: '#8b4513' },
    { name: 'White', value: '#fdf5e6' }
  ];

  const handleAddComponent = (type: string) => {
    canvasRef.current?.addComponent(type);
    setActiveTool('move');
    canvasRef.current?.setColor('move');
  };

  const handleColorSelect = (colorValue: string) => {
    setActiveTool('color');
    setActiveColor(colorValue);
    canvasRef.current?.setColor(colorValue);
  };

  const handleApplyGlaze = () => {
    canvasRef.current?.applyGlazeFlow();
  };

  const handleExport = async (isSingleColor: boolean) => {
    const svgString = canvasRef.current?.exportToSvg();
    if (!svgString) return;

    try {
      if (isSingleColor) {
        // Option 1: Export single-color rapid print
        await exportSvgTo3mf(svgString, {
          baseLayerId: 'Sancai_Base',
          baseDepth: 2.0,
          textureConfigs: [{ id: 'Sancai_Glaze_Texture', depth: 2.0 }], // Same depth for a monolithic rapid print
          filename: 'tang-sancai-rapid.3mf',
          groupName: 'Sancai_Rapid'
        });
      } else {
        // Option 2: Export textured base layer for 3D Pen tracing
        // We use the available options in the exportSvgTo3mf library mapping
        // based on the requested textureConfigs logic. The exporter differentiates base vs items by ID or index.
        await exportSvgTo3mf(svgString, {
          baseLayerId: 'Sancai_Base',
          baseDepth: 1.0,
          textureConfigs: [{ id: 'Sancai_Glaze_Texture', depth: 2.0 }],
          filename: 'tang-sancai-textured.3mf',
          groupName: 'Sancai_Textured'
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="flex h-full w-full gap-6 bg-[#020617] p-6 text-slate-200">
      {/* Sidebar Controls */}
      <div className="w-80 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">

        {/* 立胎 (Component Selection) */}
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="text-blue-400 w-5 h-5" />
            <h3 className="font-bold text-lg">立胎 <span className="text-xs text-slate-500 font-normal">Component Selection</span></h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {components.map((comp) => (
              <button
                key={comp}
                onClick={() => handleAddComponent(comp)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sm rounded-xl transition-colors text-left"
              >
                {comp}
              </button>
            ))}
          </div>
        </div>

        {/* 点蓝 (Color Palette) */}
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Palette className="text-blue-400 w-5 h-5" />
              <h3 className="font-bold text-lg">点蓝 <span className="text-xs text-slate-500 font-normal">Coloring</span></h3>
            </div>
            {activeTool === 'color' && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs">Active</span>}
          </div>
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => handleColorSelect(c.value)}
                className={`w-10 h-10 rounded-full shadow-inner border-2 transition-all ${activeTool === 'color' && activeColor === c.value ? 'border-blue-400 scale-110' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* 施釉 (Trigger Glaze Flow) */}
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Droplet className="text-blue-400 w-5 h-5" />
            <h3 className="font-bold text-lg">施釉 <span className="text-xs text-slate-500 font-normal">Glaze Flow</span></h3>
          </div>
          <button
            onClick={handleApplyGlaze}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg transition-all"
          >
            Simulate Glaze Flow
          </button>
        </div>

        {/* 出窑 (Export 3D Model) */}
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <Download className="text-blue-400 w-5 h-5" />
            <h3 className="font-bold text-lg">出窑 <span className="text-xs text-slate-500 font-normal">Export 3MF</span></h3>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleExport(false)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Export Textured (3D Pen)
            </button>
            <button
              onClick={() => handleExport(true)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Export Single-Color Rapid Print
            </button>
          </div>
        </div>

      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-slate-900 rounded-[32px] p-2 border border-white/10 shadow-2xl relative">
        <SancaiCanvas ref={canvasRef} />
      </div>
    </div>
  );
};
