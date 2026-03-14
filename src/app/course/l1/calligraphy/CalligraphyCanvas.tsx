'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import paper from 'paper/dist/paper-core';

interface CalligraphyCanvasProps {
  showGrid: boolean;
  referenceChar: string;
  currentTool: 'brush' | null;
}

export interface CalligraphyCanvasRef {
  clearCanvas: () => void;
  exportSvg: () => string | null;
}

const CalligraphyCanvas = forwardRef<CalligraphyCanvasRef, CalligraphyCanvasProps>(
  ({ showGrid, referenceChar, currentTool }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scopeRef = useRef<paper.PaperScope | null>(null);

    // Tools and Layers refs
    const brushToolRef = useRef<paper.Tool | null>(null);
    const backgroundLayerRef = useRef<paper.Layer | null>(null);
    const gridLayerRef = useRef<paper.Layer | null>(null);
    const referenceLayerRef = useRef<paper.Layer | null>(null);
    const drawingLayerRef = useRef<paper.Layer | null>(null);

    // State refs for tool events
    const currentPathRef = useRef<paper.Path | null>(null);
    const isBrushActiveRef = useRef<boolean>(currentTool === 'brush');

    // Sync state refs
    useEffect(() => {
      isBrushActiveRef.current = currentTool === 'brush';
      if (brushToolRef.current) {
        if (currentTool === 'brush') {
          brushToolRef.current.activate();
        } else {
          // Deactivate by creating an empty tool and activating it
          const emptyTool = new paper.Tool();
          emptyTool.activate();
        }
      }
    }, [currentTool]);

    // Initialize Paper.js
    useEffect(() => {
      if (!canvasRef.current) return;

      const scope = new paper.PaperScope();
      scope.setup(canvasRef.current);
      scopeRef.current = scope;

      // 1. Background Layer (baseplate for 3MF export)
      backgroundLayerRef.current = new scope.Layer();
      const baseplate = new scope.Path.Rectangle({
        point: [0, 0],
        size: [600, 600],
        fillColor: '#F5E6D3', // 宣纸色 (Rice paper color)
        name: 'Calligraphy_Paper_Base'
      });

      // 2. Grid Layer (Mi-zi Grid)
      gridLayerRef.current = new scope.Layer();
      drawMiZiGrid(scope, gridLayerRef.current);
      gridLayerRef.current.visible = showGrid;

      // 3. Reference Layer
      referenceLayerRef.current = new scope.Layer();

      // 4. Drawing Layer
      drawingLayerRef.current = new scope.Layer();
      drawingLayerRef.current.activate(); // Draw here

      // Setup Brush Tool
      const brushTool = new scope.Tool();
      brushTool.minDistance = 5;

      // Store the master unified path for all calligraphy strokes
      let globalInkPath: paper.PathItem | null = null;
      // To create fluid shapes without relying on strokes
      let currentStrokePoints: paper.Point[] = [];

      brushTool.onMouseDown = (event: paper.ToolEvent) => {
        if (!isBrushActiveRef.current) return;
        drawingLayerRef.current?.activate();
        currentStrokePoints = [event.point];

        currentPathRef.current = new scope.Path({
          segments: [event.point],
          strokeColor: 'black',
          strokeWidth: 20,
          strokeCap: 'round',
          strokeJoin: 'round',
        });
      };

      brushTool.onMouseDrag = (event: paper.ToolEvent) => {
        if (!isBrushActiveRef.current || !currentPathRef.current) return;
        currentStrokePoints.push(event.point);
        currentPathRef.current.add(event.point);
      };

      // Store reference to globalInkPath in a project property so we can clear it
      scope.project.activeLayer.data.globalInkPath = globalInkPath;
      brushTool.onMouseUp = (event: paper.ToolEvent) => {
        if (!isBrushActiveRef.current || !currentPathRef.current) return;

        currentStrokePoints.push(event.point);
        currentPathRef.current.add(event.point);

        // 1. Simplify the stroke path for fluid ink look
        currentPathRef.current.simplify(10);

        // 2. We need to convert this simplified, uniform stroke into a FILLED shape.
        let strokeOutline: paper.PathItem | null = null;
        const radius = 10; // strokeWidth 20 / 2

        const length = currentPathRef.current.length;
        const step = radius / 2; // overlap circles to prevent gaps

        for (let i = 0; i <= length; i += step) {
          const point = currentPathRef.current.getPointAt(i);
          if (point) {
            const circle = new scope.Path.Circle({
              center: point,
              radius: radius,
              insert: false // don't add to layer yet
            });

            if (!strokeOutline) {
              strokeOutline = circle;
            } else {
              const united = strokeOutline.unite(circle) as paper.PathItem;
              strokeOutline.remove();
              circle.remove();
              strokeOutline = united;
            }
          }
        }

        if (strokeOutline) {
          strokeOutline.fillColor = new scope.Color('black');

          drawingLayerRef.current?.addChild(strokeOutline);
          currentPathRef.current.remove();

          let currentGlobal = scope.project.activeLayer.data.globalInkPath;
          if (!currentGlobal) {
            currentGlobal = strokeOutline;
            currentGlobal.name = 'Calligraphy_Ink';
          } else {
             const unitedMaster = currentGlobal.unite(strokeOutline) as paper.PathItem;
             currentGlobal.remove();
             strokeOutline.remove();
             currentGlobal = unitedMaster;
             currentGlobal.name = 'Calligraphy_Ink';
             drawingLayerRef.current?.addChild(currentGlobal);
          }
          scope.project.activeLayer.data.globalInkPath = currentGlobal;
        }

        currentPathRef.current = null;
        currentStrokePoints = [];
      };

      brushToolRef.current = brushTool;
      if (isBrushActiveRef.current) {
        brushTool.activate();
      }

      return () => {
        scope.project.clear();
        scope.project.remove();
        scopeRef.current = null;
      };
    }, []);

    // Effect for handling grid visibility
    useEffect(() => {
      if (gridLayerRef.current) {
        gridLayerRef.current.visible = showGrid;
      }
    }, [showGrid]);

    // Effect for handling reference character
    useEffect(() => {
      if (!scopeRef.current || !referenceLayerRef.current) return;
      const scope = scopeRef.current;

      referenceLayerRef.current.removeChildren();
      referenceLayerRef.current.activate();

      if (referenceChar) {
        const text = new scope.PointText({
          point: [300, 420], // Center approximately
          content: referenceChar,
          fillColor: 'rgba(0, 0, 0, 0.15)', // Faint grey
          fontFamily: 'KaiTi, "Kaiti SC", serif', // Use standard KaiTi font
          fontSize: 400,
          justification: 'center',
        });

        // Ensure it doesn\'t interfere with 3MF baseplate
        text.name = 'Reference_Char';
      }

      // Return focus to drawing layer
      drawingLayerRef.current?.activate();
    }, [referenceChar]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      clearCanvas: () => {
        if (drawingLayerRef.current) {
          drawingLayerRef.current.removeChildren();
          if (scopeRef.current) {
             scopeRef.current.project.activeLayer.data.globalInkPath = null;
          }
        }
      },
      exportSvg: () => {
        if (!scopeRef.current) return null;

        // Hide grid and reference for clean export
        const wasGridVisible = gridLayerRef.current?.visible;
        const wasRefVisible = referenceLayerRef.current?.visible;

        if (gridLayerRef.current) gridLayerRef.current.visible = false;
        if (referenceLayerRef.current) referenceLayerRef.current.visible = false;

        // Force white color for strokes during export, because in exportSvgTo3mf we map fillColor
        // Wait, our brush paths only have strokeColor, no fillColor.
        // Our 3MF logic uses: path.userData?.style?.fill
        // Three.js SVGLoader handles styles. If we export a stroke with strokeWidth, SVGLoader might see it as stroke.
        // Let\'s convert strokes to paths if possible, or ensure SVGLoader processes them.
        // SVGLoader creates shapes from paths. If it\'s a stroke, SVGLoader extracts stroke style.
        // However, the export config uses `fillColor: \'#F5E6D3\'` for baseplate.
        const svgString = scopeRef.current.project.exportSVG({ asString: true }) as string;

        // Restore visibility
        if (gridLayerRef.current && wasGridVisible !== undefined) gridLayerRef.current.visible = wasGridVisible;
        if (referenceLayerRef.current && wasRefVisible !== undefined) referenceLayerRef.current.visible = wasRefVisible;

        return svgString;
      }
    }));

    return (
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="w-full h-full cursor-crosshair touch-none"
      />
    );
  }
);

CalligraphyCanvas.displayName = 'CalligraphyCanvas';
export default CalligraphyCanvas;

// Helper to draw the Mi-zi (米字) grid
function drawMiZiGrid(scope: paper.PaperScope, layer: paper.Layer) {
  layer.activate();
  const width = 600;
  const height = 600;
  const color = '#E63946'; // Red grid lines
  const strokeWidth = 2;
  const dashArray = [10, 10]; // Dashed lines for diagonals and inner crosses

  // Outer border
  new scope.Path.Rectangle({
    point: [10, 10],
    size: [width - 20, height - 20],
    strokeColor: color,
    strokeWidth: 4,
  });

  // Vertical center
  new scope.Path.Line({
    from: [width / 2, 10],
    to: [width / 2, height - 10],
    strokeColor: color,
    strokeWidth: strokeWidth,
    dashArray: dashArray,
  });

  // Horizontal center
  new scope.Path.Line({
    from: [10, height / 2],
    to: [width - 10, height / 2],
    strokeColor: color,
    strokeWidth: strokeWidth,
    dashArray: dashArray,
  });

  // Diagonal 1
  new scope.Path.Line({
    from: [10, 10],
    to: [width - 10, height - 10],
    strokeColor: color,
    strokeWidth: strokeWidth,
    dashArray: dashArray,
  });

  // Diagonal 2
  new scope.Path.Line({
    from: [width - 10, 10],
    to: [10, height - 10],
    strokeColor: color,
    strokeWidth: strokeWidth,
    dashArray: dashArray,
  });
}
