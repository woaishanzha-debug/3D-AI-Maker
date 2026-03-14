'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import paper from 'paper';
import { exportSvgTo3mf } from '@/lib/svgTo3mfConverter';
import { LanternTool, ShapeOption } from './InteractionBoard';

interface LanternCanvasProps {
  currentTool: LanternTool;
  shapeOption: ShapeOption;
  clearTrigger: number;
  exportTrigger: number;
}

export const LanternCanvas: React.FC<LanternCanvasProps> = ({
  currentTool,
  shapeOption,
  clearTrigger,
  exportTrigger
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameGroupRef = useRef<paper.Group | null>(null);
  const latticeGroupRef = useRef<paper.Group | null>(null);
  const stampGroupRef = useRef<paper.Group | null>(null);

  const lineToolRef = useRef<paper.Tool | null>(null);
  const stampToolRef = useRef<paper.Tool | null>(null);

  const currentLineRef = useRef<paper.Path | null>(null);
  const startPointRef = useRef<paper.Point | null>(null);

  // Store the latest export trigger to prevent double calls
  const lastExportRef = useRef<number>(0);

  const setupTools = useCallback(() => {
    if (!lineToolRef.current) {
      lineToolRef.current = new paper.Tool();
    }
    if (!stampToolRef.current) {
      stampToolRef.current = new paper.Tool();
    }

    const lineTool = lineToolRef.current;
    const stampTool = stampToolRef.current;

    // --- Line Tool (扎骨 - Straight Line Lattice Brush) ---
    lineTool.onMouseDown = (event: paper.ToolEvent) => {
      if (currentTool !== '扎骨') return;
      startPointRef.current = event.point;
      currentLineRef.current = new paper.Path();
      currentLineRef.current.strokeColor = new paper.Color('#8B4513'); // Wooden brown
      currentLineRef.current.strokeWidth = 6;
      currentLineRef.current.add(event.point);
      currentLineRef.current.add(event.point);
    };
    lineTool.onMouseDrag = (event: paper.ToolEvent) => {
      if (currentTool !== '扎骨' || !currentLineRef.current || !startPointRef.current) return;
      currentLineRef.current.removeSegments();
      currentLineRef.current.add(startPointRef.current);
      currentLineRef.current.add(event.point);
    };
    lineTool.onMouseUp = () => {
      if (currentTool !== '扎骨' || !currentLineRef.current) return;
      // Convert stroked line to a filled shape for 3MF extrusion if needed,
      // or exportSvgTo3mf handles stroke?
      // For safety, converting simple line to thin rectangle (stroke to path):
      // const lineClone = currentLineRef.current.clone();
      const thickLine = paper.Path.Rectangle({
         point: currentLineRef.current.bounds.topLeft,
         size: currentLineRef.current.bounds.size
      });
      thickLine.fillColor = new paper.Color('#8B4513');
      thickLine.rotation = currentLineRef.current.bounds.center.getDirectedAngle(event.point); // Roughly

      // Just keep the stroked line, assuming SVG to 3MF can handle stroke paths or we provide a valid path.
      currentLineRef.current.name = 'Lantern_Lattice_Stroke';
      if (latticeGroupRef.current) {
        latticeGroupRef.current.addChild(currentLineRef.current);
      }
      currentLineRef.current = null;
    };

    // --- Stamp Tool (贴花 - Stamp Tool) ---
    stampTool.onMouseDown = (event: paper.ToolEvent) => {
      if (currentTool !== '贴花') return;

      // Draw a simple decorative flower/star shape as a stamp
      const numPoints = 5;
      const radius1 = 15;
      const radius2 = 7;
      const stampPath = new paper.Path.Star(event.point, numPoints, radius1, radius2);
      stampPath.fillColor = new paper.Color('#FFD700'); // Gold
      stampPath.name = 'Lantern_Stamp';

      if (stampGroupRef.current) {
        stampGroupRef.current.addChild(stampPath);
      }
    };
  }, [currentTool]);

  const drawFrame = useCallback((shape: ShapeOption) => {
    if (!frameGroupRef.current) return;
    frameGroupRef.current.removeChildren();

    const center = paper.view.center;
    // Lantern panel frame size based on shape option to keep aspect ratio visually distinct,
    // though a simple rectangle is required.
    const width = shape === '4-sided' ? 200 : 160;
    const height = 300;

    const bounds = new paper.Rectangle(
      center.x - width / 2,
      center.y - height / 2,
      width,
      height
    );

    const outerRect = new paper.Path.Rectangle(bounds);

    // Create an inner rectangle to make a frame (border)
    const innerRect = outerRect.clone() as paper.Path.Rectangle;
    innerRect.scale(0.9, 0.95); // 10% horizontal padding, 5% vertical padding for frame thickness

    // Cut out innerRect from outerRect to make a true frame shape
    const framePath = outerRect.subtract(innerRect) as paper.PathItem;

    framePath.fillColor = new paper.Color('#D32F2F'); // Traditional Lantern Red
    framePath.name = 'Lantern_Frame_Base';

    outerRect.remove();
    innerRect.remove();

    frameGroupRef.current.addChild(framePath);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Reset Paper project if already initialized
    if (paper.project) {
      paper.project.clear();
      paper.project.remove();
    }

    paper.setup(canvasRef.current);

    frameGroupRef.current = new paper.Group();
    latticeGroupRef.current = new paper.Group();
    stampGroupRef.current = new paper.Group();

    drawFrame(shapeOption);
    setupTools();

  }, [shapeOption, setupTools, drawFrame]);

  // Handle Tool Activation
  useEffect(() => {
    if (currentTool === '扎骨' && lineToolRef.current) {
      lineToolRef.current.activate();
    } else if (currentTool === '贴花' && stampToolRef.current) {
      stampToolRef.current.activate();
    } else {
      // Deactivate tools (e.g., when '定型' is selected)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      paper.tool = null as any;
    }
  }, [currentTool]);

  // Handle Clear
  useEffect(() => {
    if (clearTrigger > 0) {
      if (latticeGroupRef.current) latticeGroupRef.current.removeChildren();
      if (stampGroupRef.current) stampGroupRef.current.removeChildren();
    }
  }, [clearTrigger]);

  const handleExport = useCallback(() => {
    if (!frameGroupRef.current || !latticeGroupRef.current || !stampGroupRef.current) return;

    // Create a temporary group to hold the flat-pack layout
    const exportGroup = new paper.Group();
    exportGroup.name = 'Lantern_Export_Layout';

    // Combine current drawn panel into one group
    const singlePanelGroup = new paper.Group([
      ...frameGroupRef.current.children.map(c => c.clone()),
      ...latticeGroupRef.current.children.map(c => c.clone()),
      ...stampGroupRef.current.children.map(c => c.clone())
    ]);

    // Set baseLayerId to ensure 3MF export captures everything under it
    singlePanelGroup.name = 'Lantern_Frame';

    const count = shapeOption === '4-sided' ? 4 : 6;
    const gap = 10;
    const panelBounds = singlePanelGroup.bounds;

    // Arrange panels side-by-side
    for (let i = 0; i < count; i++) {
      const clonedPanel = singlePanelGroup.clone();
      const xOffset = i * (panelBounds.width + gap);
      clonedPanel.position.x += xOffset;
      exportGroup.addChild(clonedPanel);
    }

    // Clean up original combined group
    singlePanelGroup.remove();

    // Export SVG
    const svgString = exportGroup.exportSVG({ asString: true }) as string;

    // Export to 3MF with specific config
    exportSvgTo3mf(svgString, 'Traditional_Lantern_Panels.3mf', {
      baseLayerId: 'Lantern_Frame',
      baseDepth: 1.5,
      itemDepth: 2.0
    });

    // Remove temp group
    exportGroup.remove();
  }, [shapeOption]);

  // Handle Export
  useEffect(() => {
    if (exportTrigger > lastExportRef.current) {
      lastExportRef.current = exportTrigger;
      handleExport();
    }
  }, [exportTrigger, handleExport]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair border border-border bg-white shadow-inner rounded-md"
        style={{ touchAction: 'none' }}
        data-paper-resize="true"
      />
      {/* Grid Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10"
           style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>
    </div>
  );
};
