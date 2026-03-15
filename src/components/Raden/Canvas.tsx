'use client';

import React, { useEffect, useRef, useState } from 'react';
import paper from 'paper/dist/paper-core';
import { InteractionBoard } from './InteractionBoard';
import { Delaunay } from 'd3-delaunay';

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [shatterCount, setShatterCount] = useState(50);
  const [gapSize, setGapSize] = useState(2);

  const initPaper = () => {
    if (canvasRef.current) {
      if (!paper.project) {
        paper.setup(canvasRef.current);
      } else {
        paper.project.clear();
      }
    }
  };

  const generateRadenPattern = () => {
    if (!paper.project) return;
    paper.project.clear();

    const bounds = paper.view.bounds;
    const center = bounds.center;

    // Background plate
    const bg = new paper.Path.Rectangle(bounds);
    bg.fillColor = new paper.Color('#0f172a');

    // Create an outline shape (e.g., a simple petal/leaf outline to contain the pattern)
    const containerShape = new paper.Path.RegularPolygon(center, 6, Math.min(bounds.width, bounds.height) * 0.35);
    containerShape.fillColor = new paper.Color('#ffffff');
    containerShape.opacity = 0.05;

    // Generate random points within bounds for Voronoi
    const points: [number, number][] = [];
    for (let i = 0; i < shatterCount; i++) {
      const rx = bounds.left + Math.random() * bounds.width;
      const ry = bounds.top + Math.random() * bounds.height;
      points.push([rx, ry]);
    }

    // Delaunay & Voronoi
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([bounds.left, bounds.top, bounds.right, bounds.bottom]);

    const shatterGroup = new paper.Group();

    for (let i = 0; i < shatterCount; i++) {
      const poly = voronoi.cellPolygon(i);
      if (!poly) continue;

      const path = new paper.Path();
      for (const [x, y] of poly) {
        path.add(new paper.Point(x, y));
      }
      path.closed = true;

      // Intersect Voronoi cell with container shape
      const intersected = containerShape.intersect(path);
      path.remove();

      if (intersected instanceof paper.PathItem) {
        // Apply gap size by scaling down slightly relative to center
        if (gapSize > 0) {
            const pathCenter = intersected.bounds.center;
            // Scale based on area roughly to simulate gap distance, simplified here
            intersected.scale(1 - (gapSize / 50), pathCenter);
        }

        // Randomly color with iridescence for display
        const hues = [200, 260, 320, 160, 220]; // Mother of pearl colors
        const h = hues[Math.floor(Math.random() * hues.length)];
        intersected.fillColor = new paper.Color(`hsl(${h}, 70%, 70%)`);
        intersected.strokeColor = new paper.Color('#1e293b');
        intersected.strokeWidth = 1;
        shatterGroup.addChild(intersected);
      }
    }

    paper.view.update();
  };

  useEffect(() => {
    initPaper();

    // Defer generation to ensure canvas has dimensions
    setTimeout(() => {
        generateRadenPattern();
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
        generateRadenPattern();
    }
  }, [shatterCount, gapSize]);

  const handleExport = () => {
    if (!paper.project) return;
    const svg = paper.project.exportSVG({ asString: true }) as string;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'raden-pattern.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          Voronoi Preview
        </div>
      </div>
      <InteractionBoard
        shatterCount={shatterCount}
        setShatterCount={setShatterCount}
        gapSize={gapSize}
        setGapSize={setGapSize}
        onGenerate={generateRadenPattern}
        onExport={handleExport}
      />
    </div>
  );
}
