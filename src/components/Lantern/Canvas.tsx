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

  const projectRef = useRef<paper.Project | null>(null);

  const generateLanternFrame = () => {
    if (!paper.project || !paper.view) return;
    paper.project.clear();

    const bounds = paper.view.bounds;
    let center = bounds.center;
    if (bounds.width === 0 || bounds.height === 0) {
      const w = containerRef.current?.clientWidth || window.innerWidth;
      const h = containerRef.current?.clientHeight || window.innerHeight;
      paper.view.viewSize = new paper.Size(w, h);
      center = paper.view.bounds.center;
    }
    const bg = new paper.Path.Rectangle(paper.view.bounds);
    bg.fillColor = new paper.Color('#0f172a');

    const frameGroup = new paper.Group();

    // Outer polygon frame
    const outerFrame = new paper.Path.RegularPolygon(center, sides, radius);
    outerFrame.fillColor = new paper.Color('#ef4444');
    
    // Create a smaller inner polygon for the aperture
    const innerFrame = new paper.Path.RegularPolygon(center, sides, radius - 15);
    innerFrame.fillColor = new paper.Color('#ef4444');
    
    const frameCompound = outerFrame.subtract(innerFrame);
    if (frameCompound instanceof paper.PathItem) {
        frameCompound.fillColor = new paper.Color('#ef4444');
        frameCompound.name = 'frame';
        frameGroup.addChild(frameCompound);
    } else {
        console.error("Frame subtraction failed or returned non-path item");
    }

    outerFrame.remove();
    innerFrame.remove();

    // Center hub
    const hub = new paper.Path.Circle(center, 20);
    hub.fillColor = new paper.Color('#ef4444');
    frameGroup.addChild(hub);

    // Spokes
    for (let i = 0; i < sides; i++) {
        const angle = (i * 360) / sides;
        const radian = ((angle - 90) * Math.PI) / 180;

        const outerPt = new paper.Point(
            center.x + Math.cos(radian) * radius,
            center.y + Math.sin(radian) * radius
        );

        const spokeVec = outerPt.subtract(center);
        const rect = new paper.Path.Rectangle({
            point: center.subtract(new paper.Point(4, 0)),
            size: [8, spokeVec.length]
        });

        rect.rotate(angle, center);
        rect.fillColor = new paper.Color('#ef4444');
        frameGroup.addChild(rect);
    }

    // Final assembly
    const finalGroup = new paper.Group([...frameGroup.children, hub]);
    finalGroup.name = 'lantern_frame_unified';
    
    // Explicitly set styles for all items in the group
    finalGroup.children.forEach(child => {
        if (child instanceof paper.PathItem) {
            child.fillColor = new paper.Color('#fca5a5'); 
            child.strokeColor = new paper.Color('white');
            child.strokeWidth = 5;
        }
    });

    // Center and fit to view
    finalGroup.position = paper.view.center;
    if (finalGroup.bounds.width > paper.view.bounds.width * 0.8 || 
        finalGroup.bounds.height > paper.view.bounds.height * 0.8) {
        finalGroup.fitBounds(paper.view.bounds.scale(0.8));
    }

    finalGroup.bringToFront();
    paper.project.activeLayer.addChild(finalGroup);

    paper.view.update();
    console.log("Lantern Render Complete. Items:", finalGroup.children.length);
  };

  useEffect(() => {
    if (canvasRef.current) {
        // CRITICAL FIX: Destroy old projects that are clinging to detached DOM canvases
        while (paper.projects && paper.projects.length > 0) {
            paper.projects[0].remove();
        }
        paper.setup(canvasRef.current);
    }

    const onResize = () => {
        if (paper.view) {
            paper.view.viewSize = new paper.Size(
                containerRef.current?.clientWidth || window.innerWidth,
                containerRef.current?.clientHeight || window.innerHeight
            );
            generateLanternFrame();
        }
    };
    window.addEventListener('resize', onResize);

    setTimeout(() => {
        onResize();
    }, 100);

    return () => {
      window.removeEventListener('resize', onResize);
      while (paper.projects && paper.projects.length > 0) {
          paper.projects[0].remove();
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
          className="block cursor-crosshair"
          style={{ width: '100%', height: '100%', touchAction: 'none' }}
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
