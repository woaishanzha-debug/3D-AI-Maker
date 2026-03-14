"use client";

import React, { useState, useRef } from 'react';
import CoalSealCanvas from './CoalSealCanvas';

export type ToolType = 'select' | 'text' | 'clear' | 'export';
export type PolyhedronType = 'cube' | 'octahedron';

export default function InteractionBoard() {
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [polyhedron, setPolyhedron] = useState<PolyhedronType>('cube');
  const [textInput, setTextInput] = useState<string>('印');

  // Ref to trigger canvas methods
  const canvasRef = useRef<import("./CoalSealCanvas").CoalSealCanvasRef>(null);

  const handleExport = () => {
    if (canvasRef.current) {
      canvasRef.current.exportModel();
    }
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  return (
    <div className="flex h-[800px] w-[1000px] rounded-xl bg-white shadow-xl overflow-hidden border border-gray-200">
      {/* Toolbar */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">相石 (Select Stone)</h2>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={polyhedron}
            onChange={(e) => setPolyhedron(e.target.value as PolyhedronType)}
          >
            <option value="cube">正方体展开图 (Cube Net)</option>
            <option value="octahedron">八面体展开图 (Octahedron Net)</option>
          </select>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">篆刻 (Engrave Text)</h2>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              maxLength={1}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter 1 char"
            />
            <button
              className={`py-2 px-4 rounded-md font-medium transition-colors ${activeTool === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setActiveTool(activeTool === 'text' ? 'select' : 'text')}
            >
              {activeTool === 'text' ? 'Cancel Engraving' : 'Start Engraving'}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Click on a face on the canvas to engrave the character above.
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <button
            className="w-full py-3 bg-red-100 text-red-700 font-medium rounded-md hover:bg-red-200 transition-colors"
            onClick={handleClear}
          >
            洗石 (Clear)
          </button>

          <button
            className="w-full py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors shadow-sm"
            onClick={handleExport}
          >
            成印 (Export 3MF)
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative bg-gray-100">
        <CoalSealCanvas
          ref={canvasRef}
          polyhedron={polyhedron}
          activeTool={activeTool}
          textInput={textInput}
          setActiveTool={setActiveTool}
        />
      </div>
    </div>
  );
}
