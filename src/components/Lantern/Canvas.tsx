'use client';

import React, { useEffect, useRef, useState } from 'react';
import paper from 'paper/dist/paper-core';
import { InteractionBoard } from './InteractionBoard';
import { exportSvgTo3mf } from '@/lib/svgTo3mfConverter';

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [sides, setSides] = useState(6);
  const [radius, setRadius] = useState(120);

  const initPaper = () => {
    if (canvasRef.current) {
      if (!paper.project) {
        paper.setup(canvasRef.current);
      } else {
        paper.project.clear();
      }
    }
  };

  const generateLanternFrame = () => {
    if (!paper.project) return;
    paper.project.clear();

    const bounds = paper.view.bounds;
    const center = bounds.center;
    const bg = new paper.Path.Rectangle(bounds);
    bg.fillColor = new paper.Color('#0f172a');

    const frameGroup = new paper.Group();

    // Outer polygon frame
    const outerFrame = new paper.Path.RegularPolygon(center, sides, radius);
    outerFrame.strokeColor = new paper.Color('#ef4444');
    outerFrame.strokeWidth = 10;

    // Convert stroke to fill for 3D extrusion compat
    const outerStrokePath = outerFrame.clone();
    outerStrokePath.strokeColor = null;
    outerStrokePath.fillColor = new paper.Color('#ef4444');

    // Simulate framing by creating a smaller inner polygon and subtracting
    const innerFrame = new paper.Path.RegularPolygon(center, sides, radius - 15);
    innerFrame.fillColor = new paper.Color('#ef4444');

    const frameCompound = outerStrokePath.subtract(innerFrame);
    if (frameCompound instanceof paper.PathItem) {
        frameCompound.fillColor = new paper.Color('#ef4444');
        frameCompound.name = 'frame';
        frameGroup.addChild(frameCompound);
    }

    outerFrame.remove();
    outerStrokePath.remove();
    innerFrame.remove();

    // Center hub for mortise and tenon
    const hub = new paper.Path.Circle(center, 20);
    hub.fillColor = new paper.Color('#ef4444');
    frameGroup.addChild(hub);

    // Spokes connecting hub to frame
    for (let i = 0; i < sides; i++) {
        const angle = (i * 360) / sides;
        // Adjust angle to point to vertices
        const radian = ((angle - 90) * Math.PI) / 180;

        const outerPt = new paper.Point(
            center.x + Math.cos(radian) * radius,
            center.y + Math.sin(radian) * radius
        );

        const spokeLine = new paper.Path.Line(center, outerPt);
        spokeLine.strokeColor = new paper.Color('#ef4444');
        spokeLine.strokeWidth = 8;

        // Convert to filled rectangle for 3MF
        const spokeVec = outerPt.subtract(center);
        const rect = new paper.Path.Rectangle({
            point: center.subtract(new paper.Point(4, 0)),
            size: [8, spokeVec.length]
        });

        rect.rotate(angle, center);
        rect.fillColor = new paper.Color('#ef4444');
        frameGroup.addChild(rect);
        spokeLine.remove();
    }

    // Clean up overlaps by uniting everything into a single compound path
    let finalFrame = frameGroup.children[0].clone() as paper.PathItem;
    for (let i = 1; i < frameGroup.children.length; i++) {
        const item = frameGroup.children[i] as paper.PathItem;
        const united = finalFrame.unite(item);
        finalFrame.remove();
        finalFrame = united as paper.PathItem;
    }

    frameGroup.remove();
    finalFrame.fillColor = new paper.Color('#fca5a5'); // lighter red for preview
    finalFrame.name = 'lantern_frame_unified';

    paper.view.update();
  };

  useEffect(() => {
    initPaper();

    // Defer generation to ensure canvas has dimensions
    setTimeout(() => {
        generateLanternFrame();
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
        generateLanternFrame();
    }
  }, [sides, radius]);

  const handleExport3MF = async () => {
    if (!paper.project) return;

    // We only want to export the unified frame
    const finalFrame = paper.project.activeLayer.children.find(c => c.name === 'lantern_frame_unified');
    if (!finalFrame) return;

    // Create a temporary project just for export to strip background
    const exportProject = new paper.Project(new paper.Size(1000, 1000));
    exportProject.activate();

    const clone = finalFrame.clone();
    clone.position = new paper.Point(radius + 20, radius + 20); // Move near origin
    clone.fillColor = new paper.Color('#ef4444');
    clone.name = 'lantern_frame_unified';

    const svgString = exportProject.exportSVG({ asString: true }) as string;

    exportProject.clear();
    exportProject.remove();

    // Reactivate main project
    paper.project.activate();

    try {
        await exportSvgTo3mf(svgString, {
            baseLayerId: 'lantern_frame_unified',
            baseDepth: 3,
            itemDepth: 3,
            filename: 'lantern-frame.3mf'
        });
    } catch (e) {
        console.error("Failed to export 3MF", e);
        alert("3MF 导出失败，请检查控制台。");
    }
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
          Structure Preview
        </div>
      </div>
      <InteractionBoard
        sides={sides}
        setSides={setSides}
        radius={radius}
        setRadius={setRadius}
        onExport3MF={handleExport3MF}
      />
    </div>
  );
}
