'use client';

import React, { useState, useRef } from 'react';
import PaperCuttingCanvas, { PaperCuttingCanvasRef } from './PaperCuttingCanvas';
import { exportSvgTo3mf } from '@/lib/svgTo3mfConverter';

export type FoldCount = 4 | 6 | 8;

export default function InteractionBoard() {
  const [folds, setFolds] = useState<FoldCount>(8);
  const [isUnfolded, setIsUnfolded] = useState<boolean>(false);
  const canvasRef = useRef<PaperCuttingCanvasRef>(null);

  const handleExport3MF = async () => {
    if (!canvasRef.current) return;

    // Make sure we get the full unfolded SVG for 3MF export
    const svgString = canvasRef.current.getUnfoldedSvg();
    if (!svgString) {
        alert('Failed to generate SVG.');
        return;
    }

    try {
      await exportSvgTo3mf(svgString, {
        baseLayerId: 'PaperCut_Base',
        baseDepth: 0.8,
        itemDepth: 1.2,
        filename: `paper_cut_${folds}fold.3mf`,
        groupName: 'Paper_Cut_Project'
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export to 3MF failed.');
    }
  };

  const handleClear = () => {
      if(canvasRef.current) {
          canvasRef.current.clearCanvas();
      }
  }

  return (
    <div className="flex flex-col flex-1 h-full gap-4 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-red-100">
        <div className="flex gap-4 items-center">
          <span className="font-semibold text-gray-700">折叠次数 (Folds):</span>
          <select
            value={folds}
            onChange={(e) => {
              setFolds(Number(e.target.value) as FoldCount);
              setIsUnfolded(false);
              if (canvasRef.current) canvasRef.current.clearCanvas();
            }}
            className="border-gray-300 rounded-md text-gray-700 focus:ring-red-500 focus:border-red-500 shadow-sm px-3 py-1.5 border"
            disabled={isUnfolded}
          >
            <option value={4}>4-fold (四角)</option>
            <option value={6}>6-fold (六角)</option>
            <option value={8}>8-fold (八角)</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsUnfolded(!isUnfolded)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isUnfolded
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
            }`}
          >
            {isUnfolded ? '折叠 (Fold)' : '展开 (Unfold)'}
          </button>

          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md font-medium transition-colors"
          >
            清除 (Clear)
          </button>

          <button
            onClick={handleExport3MF}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md font-medium shadow-sm transition-colors"
          >
            导出 3MF (Export to 3MF)
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-inner overflow-hidden border border-gray-200 relative flex justify-center items-center">
        <PaperCuttingCanvas
            ref={canvasRef}
            folds={folds}
            isUnfolded={isUnfolded}
        />
        {!isUnfolded && (
           <div className="absolute top-4 left-4 bg-white/80 p-2 rounded text-sm text-gray-600 pointer-events-none shadow-sm backdrop-blur-sm">
             剪刀工具: 拖拽鼠标绘制闭合图形进行裁剪。<br/>(Draw a closed shape to cut)
           </div>
        )}
      </div>
    </div>
  );
}
