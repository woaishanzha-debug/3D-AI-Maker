'use client';

import React, { useEffect, useRef, useState } from 'react';
import paper from 'paper/dist/paper-core';
import { InteractionBoard } from './InteractionBoard';
import jsPDF from 'jspdf';

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [columns, setColumns] = useState(4);
  const [rows, setRows] = useState(4);
  const [offsetX, setOffsetX] = useState(50); // percentage

  const initPaper = () => {
    if (canvasRef.current) {
      if (!paper.project) {
        paper.setup(canvasRef.current);
      } else {
        paper.project.clear();
      }
    }
  };

  const drawBaseMotif = (center: paper.Point, size: number) => {
    // Simple geometric motif representing traditional brocade elements
    const motif = new paper.Group();

    // Outer octagon
    const baseShape = new paper.Path.RegularPolygon(center, 8, size / 2 * 0.9);
    baseShape.fillColor = new paper.Color('#f59e0b');
    motif.addChild(baseShape);

    // Inner square
    const innerShape = new paper.Path.Rectangle({
        center: center,
        size: [size * 0.4, size * 0.4]
    });
    innerShape.rotate(45);
    innerShape.fillColor = new paper.Color('#0f172a');
    motif.addChild(innerShape);

    return motif;
  };

  const generateBrocade = () => {
    if (!paper.project) return;
    paper.project.clear();

    const bounds = paper.view.bounds;
    const bg = new paper.Path.Rectangle(bounds);
    bg.fillColor = new paper.Color('#0f172a');

    // Calculate grid size based on smallest dimension to maintain aspect ratio of motifs
    const totalW = bounds.width;
    const totalH = bounds.height;

    const cellW = totalW / columns;
    const cellH = totalH / rows;

    const motifSize = Math.min(cellW, cellH);
    const startX = (totalW - (columns * cellW)) / 2 + cellW / 2;
    const startY = (totalH - (rows * cellH)) / 2 + cellH / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        // Apply offset on alternate rows
        const currentOffsetX = r % 2 !== 0 ? (cellW * offsetX / 100) : 0;

        const cx = startX + c * cellW + currentOffsetX;
        const cy = startY + r * cellH;

        drawBaseMotif(new paper.Point(cx, cy), motifSize);
      }
    }

    paper.view.update();
  };

  useEffect(() => {
    initPaper();

    // Defer generation to ensure canvas has dimensions
    setTimeout(() => {
        generateBrocade();
    }, 100);

    return () => {
      if (paper.project) {
        paper.project.clear();
        paper.project.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (paper.project) {
        generateBrocade();
    }
  }, [columns, rows, offsetX]);

  const handleExportPDF = () => {
    if (!canvasRef.current) return;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvasRef.current.width, canvasRef.current.height]
    });

    const imgData = canvasRef.current.toDataURL('image/jpeg', 1.0);
    pdf.addImage(imgData, 'JPEG', 0, 0, canvasRef.current.width, canvasRef.current.height);
    pdf.save('song-brocade-lesson-plan.pdf');
  };

  return (
    <div className="flex gap-6 h-full w-full">
      <div ref={containerRef} className="flex-1 rounded-[40px] bg-slate-900 border border-white/5 overflow-hidden shadow-2xl relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair"
          style={{ touchAction: 'none' }}
          data-paper-resize="true"
        />
        <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-white/60 text-xs font-bold tracking-widest uppercase">
          Tessellation Preview
        </div>
      </div>
      <InteractionBoard
        columns={columns}
        setColumns={setColumns}
        rows={rows}
        setRows={setRows}
        offsetX={offsetX}
        setOffsetX={setOffsetX}
        onExportPDF={handleExportPDF}
      />
    </div>
  );
}
