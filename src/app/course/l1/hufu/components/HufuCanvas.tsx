'use client';

import React, { useEffect, useRef, useState } from 'react';
import paper from 'paper';
import { exportSvgTo3mf, Export3mfConfig } from '@/lib/svgTo3mfConverter';

interface HufuCanvasProps {
  activeTool: string;
  triggerExport: number;
}

export default function HufuCanvas({ activeTool, triggerExport }: HufuCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toolRef = useRef<paper.Tool | null>(null);
  const activePathRef = useRef<paper.Path | null>(null);

  // Base shapes
  const leftHalfRef = useRef<paper.Path | null>(null);
  const rightHalfRef = useRef<paper.Path | null>(null);
  const centerLineRef = useRef<paper.Path | null>(null);
  const baseGroupRef = useRef<paper.Group | null>(null);

  // Engravings
  const strokesGroupRef = useRef<paper.Group | null>(null);

  const isVerifiedRef = useRef<boolean>(false);
  const isSplitRef = useRef<boolean>(false);

  // Re-sync props to refs for the paper tool closures
  const currentToolRef = useRef(activeTool);
  useEffect(() => {
    currentToolRef.current = activeTool;

    // Logic specific to tool selection changes
    if (activeTool === '制胎' && !baseGroupRef.current) {
      createTigerTally();
    } else if (activeTool === '验真' && !isVerifiedRef.current) {
        verifyTally();
    } else if (activeTool === '对缝') {
        toggleSplit();
    }
  }, [activeTool]);

  // Export Logic
  useEffect(() => {
    if (triggerExport > 0 && baseGroupRef.current) {
        handleExport();
    }
  }, [triggerExport]);

  const handleExport = async () => {
    if (!paper.project) return;

    // Group everything for export
    const exportGroup = new paper.Group();
    if (baseGroupRef.current) exportGroup.addChild(baseGroupRef.current.clone());
    if (strokesGroupRef.current) exportGroup.addChild(strokesGroupRef.current.clone());

    // Ensure naming convention is correct
    if (exportGroup.children.length > 0) {
        exportGroup.children[0].name = 'Hufu_Base';
    }

    // Setup config
    const config: Export3mfConfig = {
        baseLayerId: 'Hufu_Base',
        baseDepth: 2.0,
        itemDepth: 1.0, // Drawn strokes depth
        isSunken: true, // Recessed into the base!
        filename: 'hufu-fingertip.3mf',
        groupName: 'Hufu_Project'
    };

    const svgString = exportGroup.exportSVG({ asString: true }) as string;

    try {
        await exportSvgTo3mf(svgString, config);
        console.log("颁发成功 (Exported)");
    } catch (err) {
        console.error("颁发失败:", err);
    } finally {
        exportGroup.remove(); // Ghost Cleanup
    }
  };

  const createTigerTally = () => {
      if (!paper.project) return;

      const center = paper.view.center;

      // Basic Tiger Silhouette logic
      const w = 300;
      const h = 180;

      const rect = new paper.Path.Rectangle({
          point: [center.x - w/2, center.y - h/2],
          size: [w, h],
          radius: 30
      });

      // A simple bump for the "tiger head"
      const head = new paper.Path.Circle({
          center: [center.x - w/2 + 50, center.y - h/2 - 20],
          radius: 60
      });

      let baseShape = rect.unite(head) as paper.Path;
      rect.remove();
      head.remove();

      baseShape.fillColor = new paper.Color('#8b6914'); // Golden Bronze
      baseShape.strokeColor = new paper.Color('#333');
      baseShape.strokeWidth = 2;

      // Center split line
      const line = new paper.Path.Line({
          from: [center.x, center.y - h],
          to: [center.x, center.y + h],
          strokeColor: new paper.Color('red'),
          strokeWidth: 1,
          dashArray: [5, 5]
      });

      // Split into Left and Right
      // A quick split using boolean logic
      const leftMask = new paper.Path.Rectangle({
          point: [0, 0],
          size: [center.x, paper.view.bounds.height]
      });
      const rightMask = new paper.Path.Rectangle({
          point: [center.x, 0],
          size: [paper.view.bounds.width - center.x, paper.view.bounds.height]
      });

      const leftHalf = baseShape.intersect(leftMask) as paper.Path;
      const rightHalf = baseShape.intersect(rightMask) as paper.Path;

      leftHalf.fillColor = baseShape.fillColor;
      rightHalf.fillColor = baseShape.fillColor;

      // Add mating teeth (榫卯/凹凸) via boolean operations
      const tooth = new paper.Path.Rectangle({
          point: [center.x - 10, center.y - 40],
          size: [20, 80]
      });

      leftHalfRef.current = leftHalf.unite(tooth) as paper.Path;
      rightHalfRef.current = rightHalf.subtract(tooth) as paper.Path;

      leftHalf.remove();
      rightHalf.remove();
      tooth.remove();
      leftMask.remove();
      rightMask.remove();
      baseShape.remove();

      centerLineRef.current = line;

      baseGroupRef.current = new paper.Group([leftHalfRef.current, rightHalfRef.current]);
      baseGroupRef.current.name = 'Hufu_Base';

      paper.view.requestUpdate();
  };

  const toggleSplit = () => {
      if (!leftHalfRef.current || !rightHalfRef.current || !baseGroupRef.current) return;

      const splitAmount = 150;

      if (isSplitRef.current) {
          // Join
          leftHalfRef.current.position.x += splitAmount;
          rightHalfRef.current.position.x -= splitAmount;
          if (strokesGroupRef.current) {
              // Group items are split, recombine logic needs care, keeping simple for demo
              strokesGroupRef.current.children.forEach(item => {
                  if (item.data.half === 'left') item.position.x += splitAmount;
                  if (item.data.half === 'right') item.position.x -= splitAmount;
              });
          }
          isSplitRef.current = false;
      } else {
          // Split
          leftHalfRef.current.position.x -= splitAmount;
          rightHalfRef.current.position.x += splitAmount;
          if (strokesGroupRef.current) {
              strokesGroupRef.current.children.forEach(item => {
                 if (item.data.half === 'left') item.position.x -= splitAmount;
                 if (item.data.half === 'right') item.position.x += splitAmount;
              });
          }
          isSplitRef.current = true;
      }
      paper.view.requestUpdate();
  }

  const verifyTally = () => {
      if (!leftHalfRef.current || !rightHalfRef.current) return;
      if (isSplitRef.current) toggleSplit(); // Must join to verify

      isVerifiedRef.current = true;

      // Visual feedback for verification
      const center = paper.view.center;
      const halo = new paper.Path.Circle({
          center: center,
          radius: 200,
          strokeColor: new paper.Color('#f59e0b'), // Amber 500
          strokeWidth: 5,
          opacity: 0.8
      });

      // Glow animation
      halo.onFrame = (event: any) => {
          halo.scale(1.02);
          halo.opacity -= 0.02;
          if (halo.opacity <= 0) {
              halo.remove();
          }
      };
  }

  // Paper.js Setup and Cleanup
  useEffect(() => {
    if (!canvasRef.current) return;

    paper.setup(canvasRef.current);

    strokesGroupRef.current = new paper.Group();
    strokesGroupRef.current.name = 'Engravings';

    const tool = new paper.Tool();
    tool.minDistance = 5;

    tool.onMouseDown = (event: paper.ToolEvent) => {
      if (currentToolRef.current !== '铭文/错金') return;
      if (!baseGroupRef.current || isSplitRef.current) return; // Don't draw if split

      activePathRef.current = new paper.Path({
        segments: [event.point],
        strokeColor: new paper.Color('#fff'), // White for gold inlay effect
        strokeWidth: 8,
        strokeCap: 'round',
        strokeJoin: 'round',
      });

      strokesGroupRef.current?.addChild(activePathRef.current);
    };

    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (currentToolRef.current !== '铭文/错金' || !activePathRef.current) return;
      activePathRef.current.add(event.point);
    };

    tool.onMouseUp = (event: paper.ToolEvent) => {
      if (currentToolRef.current !== '铭文/错金' || !activePathRef.current) return;

      // Simplify the path to reduce points
      activePathRef.current.simplify(10);

      // In a real scenario, we might want to split the strokes based on left/right half for the split animation
      if (activePathRef.current && leftHalfRef.current && rightHalfRef.current) {
          // Tag stroke by finding which side its center belongs to
          const center = activePathRef.current.bounds.center;
          if (leftHalfRef.current.contains(center)) {
              activePathRef.current.data.half = 'left';
          } else {
              activePathRef.current.data.half = 'right';
          }
      }

      activePathRef.current = null;
    };

    toolRef.current = tool;

    return () => {
      if (toolRef.current) {
        toolRef.current.remove();
        toolRef.current = null;
      }
      if (paper.project) {
        paper.project.clear();
        paper.project.remove();
      }

      activePathRef.current = null;
      baseGroupRef.current = null;
      strokesGroupRef.current = null;
      leftHalfRef.current = null;
      rightHalfRef.current = null;
      centerLineRef.current = null;
    };
  }, []);

  return (
    <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        data-paper-resize
    />
  );
}
