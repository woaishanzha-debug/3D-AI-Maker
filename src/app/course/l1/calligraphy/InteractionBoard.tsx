'use client';

import React from 'react';

interface InteractionBoardProps {
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
  referenceChar: string;
  setReferenceChar: (char: string) => void;
  currentTool: 'brush' | null;
  setCurrentTool: (tool: 'brush' | null) => void;
  onClear: () => void;
  onExport: () => void;
}

export default function InteractionBoard({
  showGrid,
  setShowGrid,
  referenceChar,
  setReferenceChar,
  currentTool,
  setCurrentTool,
  onClear,
  onExport,
}: InteractionBoardProps) {
  return (
    <div className="flex flex-col h-full space-y-6">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">工具箱</h2>

      <div className="flex flex-col space-y-2">
        <label className="text-gray-700 font-medium">铺纸 (Toggle Grid)</label>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-4 py-2 rounded-md font-bold transition-colors ${
            showGrid ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          {showGrid ? '隐藏米字格' : '显示米字格'}
        </button>
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-gray-700 font-medium">临帖 (Reference)</label>
        <select
          value={referenceChar}
          onChange={(e) => setReferenceChar(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- 无 --</option>
          <option value="永">永 (Yong)</option>
          <option value="水">水 (Shui)</option>
          <option value="木">木 (Mu)</option>
        </select>
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-gray-700 font-medium">运笔 (Brush Tool)</label>
        <button
          onClick={() => setCurrentTool(currentTool === 'brush' ? null : 'brush')}
          className={`px-4 py-2 rounded-md font-bold transition-colors ${
            currentTool === 'brush' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          毛笔
        </button>
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-gray-700 font-medium">洗笔 (Clear)</label>
        <button
          onClick={onClear}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-bold transition-colors"
        >
          清除画板
        </button>
      </div>

      <div className="flex-1"></div>

      <div className="flex flex-col space-y-2 mt-auto">
        <label className="text-gray-700 font-medium">刻碑 (Export 3MF)</label>
        <button
          onClick={onExport}
          className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-bold transition-colors text-lg"
        >
          导出阴刻 3MF
        </button>
      </div>
    </div>
  );
}
