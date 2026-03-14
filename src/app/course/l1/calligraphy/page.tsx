'use client';

import React, { useState, useRef } from 'react';
import CalligraphyCanvas from './CalligraphyCanvas';
import InteractionBoard from './InteractionBoard';
import { exportSvgTo3mf } from '@/lib/svgTo3mfConverter';

export default function CalligraphyPage() {
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [referenceChar, setReferenceChar] = useState<string>('');
  const [currentTool, setCurrentTool] = useState<'brush' | null>('brush');

  // We can use an event bus or direct ref to trigger canvas clear and export
  const canvasRef = useRef<{ clearCanvas: () => void; exportSvg: () => string } | null>(null);

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  const handleExport = async () => {
    if (canvasRef.current) {
      const svgString = canvasRef.current.exportSvg();
      if (!svgString) return;

      try {
        await exportSvgTo3mf(svgString, {
          baseLayerId: 'Calligraphy_Paper_Base',
          baseDepth: 2.0,
          itemDepth: 0.0,
          isSunken: true,
          filename: 'calligraphy-sunken-relief.3mf'
        });
      } catch (e) {
        console.error('Failed to export:', e);
      }
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50">
      <header className="flex-none p-4 bg-white shadow z-10">
        <h1 className="text-2xl font-bold text-gray-800">笔墨纸砚 - Calligraphy</h1>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 flex justify-center items-center p-4 bg-gray-200">
          <div className="w-[600px] h-[600px] bg-white shadow-lg relative">
            <CalligraphyCanvas
              ref={canvasRef}
              showGrid={showGrid}
              referenceChar={referenceChar}
              currentTool={currentTool}
            />
          </div>
        </main>

        <aside className="w-80 bg-white border-l shadow-xl p-4 flex flex-col z-10">
          <InteractionBoard
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            referenceChar={referenceChar}
            setReferenceChar={setReferenceChar}
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
            onClear={handleClearCanvas}
            onExport={handleExport}
          />
        </aside>
      </div>
    </div>
  );
}
