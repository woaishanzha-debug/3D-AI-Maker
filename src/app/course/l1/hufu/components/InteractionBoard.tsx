'use client';

import React from 'react';

interface Props {
  activeTool: string;
  onToolSelect: (tool: string) => void;
}

const TOOLS = [
  { id: '制胎', label: '制胎', desc: 'Object Shape Selection' },
  { id: '铭文/错金', label: '铭文/错金', desc: 'Engraving/Inlay Brush' },
  { id: '对缝', label: '对缝', desc: 'Symmetry/Mating Logic' },
  { id: '验真', label: '验真', desc: 'Verification Simulation' },
  { id: '颁发', label: '颁发', desc: 'Export 3MF' },
];

export default function InteractionBoard({ activeTool, onToolSelect }: Props) {
  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <h2 className="text-xl font-semibold text-neutral-200 border-b border-neutral-700 pb-2 mb-4">
        工艺流程
      </h2>

      <div className="flex flex-col gap-3">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            className={`
              flex flex-col items-start p-3 rounded-lg border text-left transition-all
              ${activeTool === tool.id
                ? 'bg-amber-900/40 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 hover:border-neutral-500'
              }
            `}
          >
            <span className={`text-lg font-medium tracking-wide ${activeTool === tool.id ? 'text-amber-400' : 'text-neutral-200'}`}>
              {tool.label}
            </span>
            <span className="text-xs text-neutral-500 mt-1">
              {tool.desc}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-auto p-4 bg-neutral-900 rounded-lg border border-neutral-800">
        <h3 className="text-sm font-medium text-amber-500 mb-2">指尖兵符状态</h3>
        <p className="text-xs text-neutral-400">
          {activeTool === 'none' ? '请选择左侧工艺流程开始。' : `当前激活：${activeTool}`}
        </p>
      </div>
    </div>
  );
}
