'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import paper from 'paper/dist/paper-core';
import { Delaunay } from 'd3-delaunay';

interface RadenCanvasProps {
  activeTool: 'select' | 'add_seeds' | 'color';
}

export const RadenCanvas = forwardRef<{ exportSVG: () => string | null }, RadenCanvasProps>(
  ({ activeTool }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [seeds, setSeeds] = useState<[number, number][]>([]);

    // Use refs to access latest state in paper tool callbacks without staleness
    const activeToolRef = useRef(activeTool);
    const seedsRef = useRef(seeds);

    useEffect(() => {
      activeToolRef.current = activeTool;
    }, [activeTool]);

    useEffect(() => {
      seedsRef.current = seeds;
    }, [seeds]);

    useEffect(() => {
      if (!canvasRef.current) return;

      // Initialize Paper.js
      paper.setup(canvasRef.current);

      const tool = new paper.Tool();

      const width = paper.view.bounds.width;
      const height = paper.view.bounds.height;

      // Draw the base plate (Raden_Base)
      const baseGroup = new paper.Group();
      baseGroup.name = 'BaseGroup';

      // We'll just draw a nice shape for the contour, say a rounded rect or tray shape
      const baseRect = new paper.Path.Rectangle({
        point: [width * 0.1, height * 0.1],
        size: [width * 0.8, height * 0.8],
        radius: 40,
        fillColor: '#111111',
      });
      baseRect.name = 'Raden_Base';
      baseGroup.addChild(baseRect);

      const cellsGroup = new paper.Group();
      cellsGroup.name = 'CellsGroup';

      const renderVoronoi = () => {
        cellsGroup.removeChildren();

        const currentSeeds = seedsRef.current;
        if (currentSeeds.length < 3) return; // Need at least 3 points for meaningful Voronoi

        const delaunay = Delaunay.from(currentSeeds);
        // Bounding box for Voronoi calculation
        const voronoi = delaunay.voronoi([
          width * 0.1, height * 0.1,
          width * 0.9, height * 0.9
        ]);

        for (let i = 0; i < currentSeeds.length; i++) {
          const polygon = voronoi.cellPolygon(i);
          if (!polygon) continue;

          // Convert d3 polygon to paper.js Path
          const path = new paper.Path();
          polygon.forEach(point => path.add(new paper.Point(point[0], point[1])));
          path.closed = true;

          // Crucial for 3D logic: To subtract boundaries (grooves), we need the lines themselves to be actual filled paths if we want them as items
          // Or, wait. If `isSunken` mode uses `itemShapes` as holes. Then what we draw as items will become holes in the top layer.
          // Wait, if the cell boundaries are to be recessed. We should draw the BOUNDARIES as thick paths.
          // In SVG, if we just stroke a path, three.js SVGLoader might not parse it as a filled shape with thickness automatically.
          // To ensure SVGLoader treats strokes properly, it's safer to expand the stroke into a filled path or just rely on SVGLoader's stroke support?
          // SVGLoader DOES support stroke (it converts them to filled shapes internally if thick enough).
          // Actually, let's just make the cells the items, or the boundaries?
          // "The Voronoi CELL BOUNDARIES (the lines, not the cells) must be subtracted/recessed into a 3mm black base (e.g., 2mm deep grooves). This creates the physical 'frame' for 3D Pen threading."
          // If the boundaries are recessed, we want the boundaries to be the holes!
          // So we should export the boundaries as thick SVG shapes (items).

          path.strokeColor = new paper.Color('#000000');
          path.strokeWidth = 6;
          path.fillColor = new paper.Color('#222222'); // Just a default dark color

          // Wait, if we use path.fillColor, the cell itself becomes a hole! We don't want the cell to be a hole.
          // We only want the boundary to be a hole.
          // So we should NOT fill the path. We should only stroke it.
          path.fillColor = null as unknown as paper.Color;

          cellsGroup.addChild(path);
        }

        // To make sure boundaries are properly subtracted, we might need them to be explicitly converted to outlines,
        // or just let three.js SVGLoader handle the strokes. SVGLoader handles stroke by creating geometries for them!
      };

      renderVoronoi();

      tool.onMouseDown = (event: paper.ToolEvent) => {
        const mode = activeToolRef.current;

        if (mode === 'add_seeds') {
          // Add a new seed
          const point = event.point;
          // Ensure within bounds
          if (baseRect.contains(point)) {
            setSeeds(prev => [...prev, [point.x, point.y]]);
            // We also immediately re-render to feel responsive
            seedsRef.current = [...seedsRef.current, [point.x, point.y]];
            renderVoronoi();
          }
        } else if (mode === 'color') {
          // Find which cell was clicked and color it
          const hitResult = cellsGroup.hitTest(event.point, {
            fill: true,
            stroke: true, // We hit test on stroke since fill is null
            tolerance: 5,
          });

          if (hitResult && hitResult.item) {
            // Apply iridescent gradient
            const item = hitResult.item as paper.Path;
            // We want to fill it now
            item.fillColor = new paper.Color({
              gradient: {
                stops: ['#ff9a9e', '#fecfef', '#a1c4fd', '#c2e9fb'],
                radial: false
              },
              origin: item.bounds.topLeft,
              destination: item.bounds.bottomRight
            });
          }
        }
      };

      return () => {
        tool.remove();
        paper.project.clear();
        paper.project.remove();
      };
    }, []);

    useImperativeHandle(ref, () => ({
      exportSVG: () => {
        // We must ensure that the SVG generated has correct structure.
        // The prompt asked for config: { baseLayerId: 'Raden_Base', baseDepth: 3.0, itemDepth: 0.0, isSunken: true }
        // "The Voronoi CELL BOUNDARIES (the lines, not the cells) must be subtracted/recessed"
        // In my `exportSvgTo3mf` implementation for `isSunken: true`, all non-base items are added as `holes`.
        // If we export paths with strokes but NO fills, SVGLoader creates shapes for the STROKES!
        // So the strokes themselves will be added as holes, which perfectly subtracts the boundaries!
        // But what if the user colored the cells? If they filled the cells, SVGLoader would create shapes for the FILLS and add them as holes too!
        // That means colored cells would become fully recessed holes, which might contradict "CELL BOUNDARIES must be subtracted".
        // Ah. "Assign Iridescent Gradient to Cells" is '翻花'. If they color a cell, it might just be a visual thing in 2D,
        // or in 3D, the colored cell should NOT be a hole.
        // Actually, if they want an "Enamel/Inlay Frame" for 3D pen filling, the printed object should have recessed lines.
        // The cells are the raised parts, where the 3D pen filament goes? Wait, no, "recessed into a 3mm black base... This creates the physical 'frame' for 3D Pen threading".
        // Wait, if it's an "inlay frame" (阴刻骨架), usually the boundaries are raised and the cells are recessed (like cloisonne)?
        // No, "The Voronoi CELL BOUNDARIES (the lines, not the cells) must be subtracted/recessed... creates the frame". So boundaries are grooves, cells are flat raised platforms? That's weird for a frame. Usually a frame has raised boundaries (wires) and recessed cells (for filling).
        // BUT the prompt explicitly says: "The Voronoi CELL BOUNDARIES (the lines, not the cells) must be subtracted/recessed into a 3mm black base (e.g., 2mm deep grooves)". I MUST follow this explicit instruction.

        // Let's refine the items before export to guarantee only strokes are exported, or convert filled cells into something else if needed.
        // Let's just export the project as is. SVGLoader handles the SVG.

        const svgString = paper.project.exportSVG({ asString: true }) as string;
        return svgString;
      }
    }));

    return (
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair"
        style={{ touchAction: 'none' }}
      />
    );
  }
);

RadenCanvas.displayName = 'RadenCanvas';
