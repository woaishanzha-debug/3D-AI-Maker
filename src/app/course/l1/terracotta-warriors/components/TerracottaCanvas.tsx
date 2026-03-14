'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import paper from 'paper/dist/paper-core';
import { ToolType, LayerType } from './InteractionBoard';

export interface TerracottaCanvasRef {
  getSvg: () => string | null;
  clearCanvas: () => void;
}

interface TerracottaCanvasProps {
  tool: ToolType;
  layer: LayerType;
}

const TerracottaCanvas = forwardRef<TerracottaCanvasRef, TerracottaCanvasProps>(
  ({ tool, layer }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const paperProjectRef = useRef<paper.Project | null>(null);
    const toolRef = useRef<paper.Tool | null>(null);
    const currentPathRef = useRef<paper.Path | null>(null);

    useImperativeHandle(ref, () => ({
      getSvg: () => {
        if (!paperProjectRef.current) return null;
        return paperProjectRef.current.exportSVG({ asString: true }) as string;
      },
      clearCanvas: () => {
        if (!paperProjectRef.current) return;
        paperProjectRef.current.activeLayer.removeChildren();
      },
    }));

    useEffect(() => {
      if (!canvasRef.current) return;

      if (!paperProjectRef.current) {
        paper.setup(canvasRef.current);
        paperProjectRef.current = paper.project;
      }

      if (toolRef.current) {
        toolRef.current.remove();
      }

      const pTool = new paper.Tool();
      toolRef.current = pTool;

      pTool.onMouseDown = (event: paper.ToolEvent) => {
        if (!paperProjectRef.current) return;

        if (tool === 'eraser') {
          const hitResult = paperProjectRef.current.hitTest(event.point, {
            fill: true,
            stroke: true,
            segments: true,
            tolerance: 5,
          });
          if (hitResult && hitResult.item) {
            hitResult.item.remove();
          }
          return;
        }

        const path = new paper.Path();
        currentPathRef.current = path;

        let strokeColor = 'black';
        let fillColor = 'rgba(0,0,0,0.1)';
        let strokeWidth = 2;
        let pathId = 'Default_Path';

        if (tool === 'base') {
          strokeColor = '#8B4513';
          fillColor = 'rgba(139, 69, 19, 0.4)';
          strokeWidth = 3;
          pathId = 'Terracotta_Base';
        } else if (tool === 'coil' || tool === 'detail') {
          const layerNum = layer.split(' ')[1];
          pathId = `Coil_Layer_${layerNum}`;

          if (layer === 'Layer 1') {
            strokeColor = '#D2691E';
            fillColor = 'rgba(210, 105, 30, 0.5)';
            strokeWidth = 2;
          } else if (layer === 'Layer 2') {
            strokeColor = '#A0522D';
            fillColor = 'rgba(160, 82, 45, 0.5)';
            strokeWidth = 2;
          } else if (layer === 'Layer 3') {
            strokeColor = '#CD853F';
            fillColor = 'rgba(205, 133, 63, 0.5)';
            strokeWidth = 2;
          }

          if (tool === 'detail') {
            strokeWidth = 1;
            fillColor = 'rgba(100, 50, 20, 0.6)';
          }
        }

        path.strokeColor = new paper.Color(strokeColor);
        path.fillColor = new paper.Color(fillColor);
        path.strokeWidth = strokeWidth;
        path.name = pathId;

        path.add(event.point);
      };

      pTool.onMouseDrag = (event: paper.ToolEvent) => {
        if (tool === 'eraser') return;
        if (currentPathRef.current) {
          currentPathRef.current.add(event.point);
        }
      };

      pTool.onMouseUp = () => {
        if (tool === 'eraser') return;
        if (currentPathRef.current) {
          currentPathRef.current.closed = true;
          currentPathRef.current.simplify(10);
        }
        currentPathRef.current = null;
      };
    }, [tool, layer]);

    useEffect(() => {
      return () => {
        if (toolRef.current) {
          toolRef.current.remove();
          toolRef.current = null;
        }
        if (paperProjectRef.current) {
          paperProjectRef.current.clear();
          paperProjectRef.current.remove();
          paperProjectRef.current = null;
        }
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="w-full h-[600px] cursor-crosshair touch-none"
        style={{ backgroundColor: '#fdfbf7' }}
        data-paper-resize="true"
      />
    );
  }
);

TerracottaCanvas.displayName = 'TerracottaCanvas';

export default TerracottaCanvas;
