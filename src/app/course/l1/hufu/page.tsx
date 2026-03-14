'use client';

import React, { useState } from 'react';
import InteractionBoard from './components/InteractionBoard';
import HufuCanvas from './components/HufuCanvas';

export default function HufuPage() {
  const [activeTool, setActiveTool] = useState<string>('none');
  const [triggerExport, setTriggerExport] = useState<number>(0);

  const handleToolSelect = (tool: string) => {
    if (tool === '颁发') {
      setTriggerExport(Date.now());
    } else {
      setActiveTool(tool);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-900 text-white font-sans">
      <header className="p-4 bg-neutral-800 shadow-md">
        <h1 className="text-2xl font-bold tracking-widest text-amber-500">指尖兵符 (Hufu)</h1>
        <p className="text-sm text-neutral-400 mt-1">阴刻错金工艺体验</p>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Interaction Board */}
        <aside className="w-64 bg-neutral-800 border-r border-neutral-700 flex flex-col">
          <InteractionBoard activeTool={activeTool} onToolSelect={handleToolSelect} />
        </aside>

        {/* Right Side: Canvas */}
        <section className="flex-1 bg-neutral-900 relative p-4 flex justify-center items-center">
          <div className="w-full h-full max-w-4xl max-h-[800px] border border-neutral-700 bg-black rounded-lg overflow-hidden shadow-2xl relative">
            <HufuCanvas activeTool={activeTool} triggerExport={triggerExport} />
          </div>
        </section>
      </main>
    </div>
  );
}
