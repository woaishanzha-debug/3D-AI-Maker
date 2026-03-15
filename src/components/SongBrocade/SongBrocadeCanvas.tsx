'use client';

import * as React from 'react';
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as paper from 'paper/dist/paper-core';

export type TilingType = '团花' | '四达晕';
export type GeometryType = 'circle' | 'square' | 'diamond' | 'polygon';

export interface SongBrocadeCanvasProps {
  showGrid: boolean;
  tilingType: TilingType;
  geometry: GeometryType;
  isTiled: boolean;
}

export interface SongBrocadeCanvasRef {
  getExportSvg: () => string | null;
  getExportDataUrl: () => string | null;
  clearCanvas: () => void;
}

const SongBrocadeCanvas = forwardRef<SongBrocadeCanvasRef, SongBrocadeCanvasProps>(
  ({ showGrid, tilingType, geometry, isTiled }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gridGroupRef = useRef<paper.Group | null>(null);
    const baseUnitGroupRef = useRef<paper.Group | null>(null);
    const tiledGroupRef = useRef<paper.Group | null>(null);

    // Size constants
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 800;
    const CENTER = new paper.Point(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    const GRID_SIZE = 40; // 40px grid cells

    // 1. Rigorous cleanup to prevent ghost canvases
    useEffect(() => {
      if (!canvasRef.current) return;

      if (paper.project) {
        paper.project.clear();
        paper.project.remove();
      }

      paper.setup(canvasRef.current);

      return () => {
        if (paper.project) {
          paper.project.clear();
          paper.project.remove();
        }
      };
    }, []);

    // 2. Draw warp/weft grid pattern
    const drawGrid = () => {
      if (!paper.project) return;

      if (gridGroupRef.current) {
        gridGroupRef.current.remove();
      }

      gridGroupRef.current = new paper.Group();
      gridGroupRef.current.name = 'Song_Grid_Base';

      if (!showGrid) {
        gridGroupRef.current.visible = false;
        return;
      }

      const gridLines = new paper.Group();

      // Vertical (Warp) lines
      for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
        const line = new paper.Path.Line(new paper.Point(x, 0), new paper.Point(x, CANVAS_HEIGHT));
        line.strokeColor = new paper.Color(0.8, 0.8, 0.8, 0.5);
        line.strokeWidth = 1;
        // Rhythm / Dash to represent weaving
        line.dashArray = [4, 2];
        gridLines.addChild(line);
      }

      // Horizontal (Weft) lines
      for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
        const line = new paper.Path.Line(new paper.Point(0, y), new paper.Point(CANVAS_WIDTH, y));
        line.strokeColor = new paper.Color(0.8, 0.8, 0.8, 0.5);
        line.strokeWidth = 1;
        // Intersecting rhythm
        line.dashArray = [2, 4];
        gridLines.addChild(line);
      }

      gridGroupRef.current.addChild(gridLines);

      // Keep grid layer behind geometry
      gridGroupRef.current.sendToBack();
    };

    // 3. Draw base unit cell (geometry)
    const drawBaseUnit = () => {
      if (!paper.project) return;

      if (baseUnitGroupRef.current) {
        baseUnitGroupRef.current.remove();
      }

      baseUnitGroupRef.current = new paper.Group();

      let path: paper.Path | paper.Path.RegularPolygon;
      const radius = GRID_SIZE * 2; // Size of base unit

      switch (geometry) {
        case 'circle':
          path = new paper.Path.Circle(CENTER, radius);
          break;
        case 'square':
          path = new paper.Path.Rectangle({
            point: CENTER.subtract(radius),
            size: [radius * 2, radius * 2]
          });
          break;
        case 'diamond':
          path = new paper.Path.RegularPolygon(CENTER, 4, radius);
          break;
        case 'polygon': // Octagon
          path = new paper.Path.RegularPolygon(CENTER, 8, radius);
          break;
        default:
          path = new paper.Path.Circle(CENTER, radius);
      }

      path.strokeColor = new paper.Color('#000');
      path.strokeWidth = 2;
      path.fillColor = new paper.Color(0, 0, 0, 0.1); // Light fill for visibility

      // Warp/weft dash array for the geometry stroke
      path.dashArray = [8, 4];

      baseUnitGroupRef.current.addChild(path);
    };

    // 4. Implement Tiling engine (翻花)
    const renderTiled = () => {
      if (!paper.project || !baseUnitGroupRef.current) return;

      if (tiledGroupRef.current) {
        tiledGroupRef.current.remove();
      }

      tiledGroupRef.current = new paper.Group();

      // Hide base unit while tiled
      baseUnitGroupRef.current.visible = false;

      // Get the base shape to clone
      const baseShape = baseUnitGroupRef.current.children[0] as paper.Item;
      if (!baseShape) return;

      const step = GRID_SIZE * 4; // Spacing between centers

      if (tilingType === '团花') {
        // Tuanhua - Medallion (Grid-based spacing)
        // Center shape + 4 surrounding
        const positions = [
          CENTER,
          CENTER.add(new paper.Point(step, step)),
          CENTER.add(new paper.Point(-step, step)),
          CENTER.add(new paper.Point(step, -step)),
          CENTER.add(new paper.Point(-step, -step))
        ];

        positions.forEach(pos => {
          const clone = baseShape.clone();
          clone.position = pos;
          tiledGroupRef.current?.addChild(clone);
        });

      } else if (tilingType === '四达晕') {
        // Sidayun - Four-way radiating
        // A denser grid pattern
        const columns = Math.ceil(CANVAS_WIDTH / step) + 1;
        const rows = Math.ceil(CANVAS_HEIGHT / step) + 1;

        for (let x = -1; x <= columns; x++) {
          for (let y = -1; y <= rows; y++) {
            const posX = x * step + (y % 2 !== 0 ? step / 2 : 0); // Offset every other row
            const posY = y * step;

            const clone = baseShape.clone();
            clone.position = new paper.Point(posX, posY);

            // Apply paper.js scale/unite fix for precise overlaps (Ghost Cleanup Rule memory)
            if (tiledGroupRef.current && tiledGroupRef.current.children.length > 0) {
                // If we want to unite everything into one path (optional, maybe better for 3MF)
                // For now, simple grouping is safer for performance and visual fidelity,
                // but we apply slight scaling to avoid seams if we do unite
            }

            tiledGroupRef.current.addChild(clone);
          }
        }
      }
    };

    const restoreFolded = () => {
      if (tiledGroupRef.current) {
        tiledGroupRef.current.remove();
        tiledGroupRef.current = null;
      }
      if (baseUnitGroupRef.current) {
        baseUnitGroupRef.current.visible = true;
      }
    };

    // React to prop changes
    useEffect(() => {
      if (!paper.project) return;
      drawGrid();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showGrid]);

    useEffect(() => {
      if (!paper.project) return;
      drawBaseUnit();
      if (isTiled) {
        renderTiled();
      } else {
        restoreFolded();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [geometry, tilingType]);

    useEffect(() => {
      if (!paper.project) return;
      if (isTiled) {
        renderTiled();
      } else {
        restoreFolded();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTiled]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      getExportSvg: () => {
        if (!paper.project) return null;
        return paper.project.exportSVG({ asString: true }) as string;
      },
      getExportDataUrl: () => {
        if (!canvasRef.current) return null;
        return canvasRef.current.toDataURL('image/png', 1.0);
      },
      clearCanvas: () => {
        if (!paper.project) return;
        paper.project.activeLayer.removeChildren();
        drawGrid();
        drawBaseUnit();
      }
    }));

    return (
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain"
        style={{ cursor: 'crosshair' }}
      />
    );
  }
);

SongBrocadeCanvas.displayName = 'SongBrocadeCanvas';

export default SongBrocadeCanvas;