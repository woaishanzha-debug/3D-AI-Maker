"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import paper from 'paper/dist/paper-core';
import { exportSvgTo3mf } from '@/lib/svgTo3mfConverter';

export interface CoalSealCanvasProps {
  polyhedron: 'cube' | 'octahedron';
  activeTool: 'select' | 'text' | 'clear' | 'export';
  textInput: string;
  setActiveTool: (tool: 'select' | 'text' | 'clear' | 'export') => void;
}

export interface CoalSealCanvasRef {
  exportModel: () => void;
  clearCanvas: () => void;
}

const CoalSealCanvas = forwardRef<CoalSealCanvasRef, CoalSealCanvasProps>(
  ({ polyhedron, activeTool, textInput, setActiveTool }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const projectRef = useRef<paper.Project | null>(null);
    const toolRef = useRef<paper.Tool | null>(null);
    const groupRef = useRef<paper.Group | null>(null);

    // Maintain latest state for event handlers
    const stateRef = useRef({
      polyhedron,
      activeTool,
      textInput,
      setActiveTool,
    });

    useEffect(() => {
      stateRef.current = {
        polyhedron,
        activeTool,
        textInput,
        setActiveTool,
      };
    }, [polyhedron, activeTool, textInput, setActiveTool]);

    // Initialization
    useEffect(() => {
      if (!canvasRef.current) return;

      const project = new paper.Project(canvasRef.current);
      projectRef.current = project;

      const tool = new paper.Tool();
      toolRef.current = tool;

      tool.onMouseDown = (event: paper.ToolEvent) => {
        const { activeTool, textInput, setActiveTool } = stateRef.current;
        if (activeTool !== 'text') return;

        // Find which face was clicked
        const hitResult = project.hitTest(event.point, {
          fill: true,
          tolerance: 5,
        });

        if (hitResult && hitResult.item) {
          const item = hitResult.item;
          // Verify it's a face we can engrave
          if (item.data && item.data.isFace) {
            engraveText(item as paper.PathItem, textInput, event.point);
            setActiveTool('select');
          }
        }
      };

      drawNet();

      return () => {
        project.clear();
        project.remove();
        tool.remove();
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-draw when polyhedron changes
    useEffect(() => {
      if (projectRef.current) {
        drawNet();
      }
    }, [polyhedron]);

    const engraveText = async (faceItem: paper.PathItem, text: string, point: paper.Point) => {
      if (!text || !projectRef.current) return;

      // Ensure imagetracerjs is loaded
      let ImageTracer: { imagedataToSVG: (data: ImageData, options: unknown) => string };
      try {
        const module = await import('imagetracerjs');
        ImageTracer = module as unknown as typeof ImageTracer;
      } catch (err) {
        console.error("Failed to load imagetracerjs:", err);
        return;
      }

      // 1. Draw text on an offscreen canvas
      const size = 64; // size of the text bounding box
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Fill background black, text white (ImageTracer traces colors)
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, size, size);

      // Draw text
      ctx.fillStyle = 'white';
      // Use a bold generic font
      ctx.font = `bold ${size * 0.8}px "Microsoft YaHei", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Draw it perfectly centered
      ctx.fillText(text, size / 2, size / 2 + size * 0.05);

      // 2. Trace the image to an SVG string using imagetracerjs
      // We want to trace the white text into paths
      const options = {
        corsenabled: false,
        ltres: 1,
        qtres: 1,
        pathomit: 8,
        rightangleenhance: false,
        pal: [{ r: 0, g: 0, b: 0, a: 255 }, { r: 255, g: 255, b: 255, a: 255 }] // Black and white only
      };

      const svgString = ImageTracer.imagedataToSVG(ctx.getImageData(0, 0, size, size), options);

      if (!svgString) {
          console.warn("SVG Tracing failed.");
          return;
      }

      // 3. Import SVG into Paper.js to get paths
      const project = projectRef.current;
      const importedItem = project.importSVG(svgString, { expandShapes: true }) as paper.Item;

      // The imported item is likely a Group containing paths for black and white
      // We need to extract the white paths (the text)
      const textPaths: paper.PathItem[] = [];

      importedItem.getItems({
        class: paper.Path,
        match: (item: paper.Path) => {
          // Check if fillColor is white or light
          if (item.fillColor && (
              item.fillColor.toCSS(true) === '#ffffff' ||
              item.fillColor.toCSS(true) === '#f6f6f6' ||
              item.fillColor.toCSS(true) === 'rgb(255,255,255)' ||
              item.fillColor.toCSS(true) === 'rgb(246,246,246)' ||
              (item.fillColor.components && item.fillColor.components[0] > 0.9 && item.fillColor.components[1] > 0.9)
          )) {
            textPaths.push(item);
            return true;
          }
          return false;
        }
      });

      if (textPaths.length === 0) {
        console.warn("No text paths traced.");
        importedItem.remove();
        return;
      }

      // Unite all text paths into a single CompoundPath
      let unitedTextPath: paper.PathItem = textPaths[0];
      for (let i = 1; i < textPaths.length; i++) {
        const result = unitedTextPath.unite(textPaths[i]);
        if (unitedTextPath !== textPaths[0]) unitedTextPath.remove(); // cleanup intermediate
        unitedTextPath = result as paper.PathItem;
      }

      // Center the text path around origin so we can move it to the click point easily
      unitedTextPath.position = new paper.Point(0, 0);
      unitedTextPath.scale(1.2); // Adjust size relative to face
      unitedTextPath.position = point;

      // 4. Subtract the text path from the face path
      const newFace = faceItem.subtract(unitedTextPath) as paper.CompoundPath;

      newFace.fillColor = new paper.Color('#e5e7eb');
      newFace.strokeColor = new paper.Color('#9ca3af');
      newFace.strokeWidth = 2;
      newFace.data = { isFace: true };
      newFace.name = faceItem.name;

      // Replace old face with new face
      if (faceItem.parent) {
        faceItem.parent.addChild(newFace);
      }

      // Cleanup
      faceItem.remove();
      importedItem.remove();
      if (unitedTextPath.parent) unitedTextPath.remove();
    };

    const drawNet = () => {
      const project = projectRef.current;
      if (!project) return;

      project.clear();
      groupRef.current = new paper.Group();
      groupRef.current.name = 'baseLayer';

      const { polyhedron } = stateRef.current;
      const center = project.view.center;
      const size = 100; // side length
      const gap = 2; // small gap in screen coords (representing 0.5mm gap for 3D printing)

      if (polyhedron === 'cube') {
        const createFace = (xOffset: number, yOffset: number) => {
          const rect = new paper.Rectangle(
            center.x + xOffset * (size + gap) - size / 2,
            center.y + yOffset * (size + gap) - size / 2,
            size,
            size
          );
          const path = new paper.Path.Rectangle(rect);
          path.fillColor = new paper.Color('#e5e7eb');
          path.strokeColor = new paper.Color('#9ca3af');
          path.strokeWidth = 2;
          path.data = { isFace: true };
          groupRef.current?.addChild(path);
        };

        createFace(0, 0);   // Center
        createFace(0, -1);  // Top
        createFace(0, 1);   // Bottom
        createFace(-1, 0);  // Left
        createFace(1, 0);   // Right
        createFace(2, 0);   // Back
      } else if (polyhedron === 'octahedron') {
        const h = size * Math.sqrt(3) / 2;
        const createTriangle = (xOffset: number, yOffset: number, pointUp: boolean) => {
          const path = new paper.Path();
          const cx = center.x + xOffset * (size / 2 + gap / 2);
          const cy = center.y + yOffset * (h + gap);

          if (pointUp) {
            path.add(new paper.Point(cx, cy - h/2));
            path.add(new paper.Point(cx - size/2, cy + h/2));
            path.add(new paper.Point(cx + size/2, cy + h/2));
          } else {
            path.add(new paper.Point(cx - size/2, cy - h/2));
            path.add(new paper.Point(cx + size/2, cy - h/2));
            path.add(new paper.Point(cx, cy + h/2));
          }

          path.closed = true;
          path.fillColor = new paper.Color('#e5e7eb');
          path.strokeColor = new paper.Color('#9ca3af');
          path.strokeWidth = 2;
          path.data = { isFace: true };
          groupRef.current?.addChild(path);
        };

        createTriangle(-1.5, -0.5, true);
        createTriangle(-0.5, -0.5, false);
        createTriangle(0.5, -0.5, true);
        createTriangle(1.5, -0.5, false);

        createTriangle(-1, 0.5, false);
        createTriangle(0, 0.5, true);
        createTriangle(1, 0.5, false);
        createTriangle(2, 0.5, true);

        groupRef.current.position = center;
      }
    };

    useImperativeHandle(ref, () => ({
      exportModel: async () => {
        if (!projectRef.current) return;

        // SVG Export
        const svgString = projectRef.current.exportSVG({ asString: true }) as string;

        try {
          await exportSvgTo3mf(svgString, {
            baseLayerId: 'baseLayer',
            baseDepth: 1.5, // Thick faces as requested
            itemDepth: 1.5,
            filename: `coal-seal-${stateRef.current.polyhedron}.3mf`,
          });
        } catch (error) {
          console.error("Failed to export 3MF:", error);
          alert("Export failed. Please check console.");
        }
      },
      clearCanvas: () => {
        drawNet();
      }
    }));

    return (
      <div className="w-full h-full relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair bg-white"
          style={{ touchAction: 'none' }}
        />
        <div className="absolute top-4 left-4 text-xs text-gray-400 bg-white/80 p-2 rounded pointer-events-none">
          Click on a face with the Engrave tool active to place a seal cut (hole).<br/>
          Faces are separated by a 0.5mm gap for 3D pen welding after printing.
        </div>
      </div>
    );
  }
);

CoalSealCanvas.displayName = 'CoalSealCanvas';

export default CoalSealCanvas;
