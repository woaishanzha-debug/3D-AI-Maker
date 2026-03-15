'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import paper from 'paper/dist/paper-core';
import { FoldCount } from './InteractionBoard';

export interface PaperCuttingCanvasProps {
  folds: FoldCount;
  isUnfolded: boolean;
}

export interface PaperCuttingCanvasRef {
  getUnfoldedSvg: () => string | null;
  clearCanvas: () => void;
}

const PaperCuttingCanvas = forwardRef<PaperCuttingCanvasRef, PaperCuttingCanvasProps>(
  ({ folds, isUnfolded }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wedgePathRef = useRef<paper.PathItem | null>(null);
    const scissorToolRef = useRef<paper.Tool | null>(null);
    const currentCutPathRef = useRef<paper.Path | null>(null);
    const unfoldedGroupRef = useRef<paper.Group | null>(null);

    // Store original wedge in memory for unfolding without losing data
    const baseWedgeGroupRef = useRef<paper.Group | null>(null);

    const WEDGE_RADIUS = 300;
    const CENTER = new paper.Point(400, 400);

    const initializeWedge = () => {
      if (!paper.project) return;
      paper.project.activeLayer.removeChildren();

      // Create a full circle and a sector to intersect
      const angle = 360 / (folds * 2); // E.g. 8 folds -> 16 wedges -> 22.5 degrees

      const circle = new paper.Path.Circle(CENTER, WEDGE_RADIUS);
      const centerLine1 = new paper.Path.Line(CENTER, CENTER.add(new paper.Point({ length: WEDGE_RADIUS * 2, angle: 0 })));
      const centerLine2 = new paper.Path.Line(CENTER, CENTER.add(new paper.Point({ length: WEDGE_RADIUS * 2, angle: -angle })));

      const sectorPath = new paper.Path();
      sectorPath.add(CENTER);

      const startPoint = CENTER.add(new paper.Point({ length: WEDGE_RADIUS * 2, angle: 0 }));
      const middlePoint = CENTER.add(new paper.Point({ length: WEDGE_RADIUS * 2, angle: -angle / 2 }));
      const endPoint = CENTER.add(new paper.Point({ length: WEDGE_RADIUS * 2, angle: -angle }));

      sectorPath.add(startPoint);
      sectorPath.arcTo(middlePoint, endPoint);
      sectorPath.add(CENTER);
      sectorPath.closePath();

      const wedge = circle.intersect(sectorPath) as paper.PathItem;
      wedge.fillColor = new paper.Color('#D32F2F'); // Traditional Chinese Red
      wedge.strokeColor = new paper.Color('#B71C1C');
      wedge.strokeWidth = 2;
      wedge.name = 'PaperCut_Base';

      circle.remove();
      sectorPath.remove();
      centerLine1.remove();
      centerLine2.remove();

      wedgePathRef.current = wedge;

      // Make a group to hold the wedge for easier manipulation later
      const wedgeGroup = new paper.Group([wedge]);
      baseWedgeGroupRef.current = wedgeGroup;

      // Setup scissor tool
      setupTool();
    };

    const setupTool = () => {
      if (scissorToolRef.current) {
        scissorToolRef.current.remove();
      }

      const tool = new paper.Tool();
      scissorToolRef.current = tool;

      tool.onMouseDown = (event: paper.ToolEvent) => {
        if (isUnfolded) return; // Disable cutting while unfolded
        currentCutPathRef.current = new paper.Path();
        currentCutPathRef.current.strokeColor = new paper.Color('black');
        currentCutPathRef.current.strokeWidth = 2;
        currentCutPathRef.current.dashArray = [4, 4];
        currentCutPathRef.current.add(event.point);
      };

      tool.onMouseDrag = (event: paper.ToolEvent) => {
        if (isUnfolded || !currentCutPathRef.current) return;
        currentCutPathRef.current.add(event.point);
      };

      tool.onMouseUp = (event: paper.ToolEvent) => {
        if (isUnfolded || !currentCutPathRef.current || !wedgePathRef.current) return;
        currentCutPathRef.current.closePath();
        currentCutPathRef.current.simplify(10); // Smooth the drawn path

        if (currentCutPathRef.current.segments.length > 2) {
           try {
              // Boolean subtraction
              const newWedge = wedgePathRef.current.subtract(currentCutPathRef.current) as paper.PathItem;
              if (newWedge) {
                 newWedge.fillColor = new paper.Color('#D32F2F');
                 newWedge.strokeColor = new paper.Color('#B71C1C');
                 newWedge.strokeWidth = 2;
                 newWedge.name = 'PaperCut_Base'; // Re-assign ID for 3MF

                 wedgePathRef.current.remove();
                 wedgePathRef.current = newWedge;

                 if (baseWedgeGroupRef.current) {
                     baseWedgeGroupRef.current.removeChildren();
                     baseWedgeGroupRef.current.addChild(newWedge);
                 }
              }
           } catch (e) {
               console.error("Boolean subtraction failed:", e);
           }
        }

        currentCutPathRef.current.remove();
        currentCutPathRef.current = null;
      };

      tool.activate();
    };

    const renderUnfolded = () => {
      if (!paper.project || !wedgePathRef.current) return;

      if (unfoldedGroupRef.current) {
        unfoldedGroupRef.current.remove();
        unfoldedGroupRef.current = null;
      }

      const wedgesCount = folds * 2;
      const angleStep = 360 / wedgesCount;
      const group = new paper.Group();

      // The original wedge is at angle 0 to -angleStep
      // We need to create a reflective symmetric pattern
      for (let i = 0; i < wedgesCount; i++) {
        const clonedWedge = wedgePathRef.current.clone() as paper.PathItem;
        clonedWedge.name = 'PaperCut_Base'; // Apply base layer name

        // If it's an odd index, reflect it horizontally over the top edge of the base wedge
        if (i % 2 !== 0) {
           clonedWedge.scale(1, -1, CENTER); // Mirror vertically
        }

        // Rotate into position
        // Every pair (0,1), (2,3) forms one folded section.
        // We rotate the pair by (i // 2) * (angleStep * 2)
        const pairIndex = Math.floor(i / 2);
        clonedWedge.rotate(pairIndex * (angleStep * 2), CENTER);

        group.addChild(clonedWedge);
      }

      // Hide the original interactive wedge group
      if (baseWedgeGroupRef.current) {
          baseWedgeGroupRef.current.visible = false;
      }

      // Try to unite all wedges into a single path for a clean SVG
      try {
          // Scale significantly to remove subpixel gaps before uniting
          // This ensures full overlap even under production precision limits
          group.children.forEach(child => {
              child.scale(1.02, CENTER);
          });

          const first = group.children[0] as paper.PathItem;
          let unioned = first.clone({ insert: false }) as paper.PathItem;

          for (let i = 1; i < group.children.length; i++) {
              const current = group.children[i] as paper.PathItem;
              const nextUnioned = unioned.unite(current, { insert: false }) as paper.PathItem;
              unioned.remove(); // Kill intermediate
              unioned = nextUnioned;
          }

          unioned.name = 'PaperCut_Base';
          unioned.fillColor = new paper.Color('#D32F2F');
          unioned.strokeWidth = 0; 
          
          // Re-scale down exactly to counteract the initial 1.02 expansion
          unioned.scale(1 / 1.02, CENTER);

          group.removeChildren();
          group.addChild(unioned);
      } catch (e) {
          console.warn("Union failed during unfolding. Export might have overlapping layers.", e);
      }

      unfoldedGroupRef.current = group;
    };

    const restoreFolded = () => {
      if (unfoldedGroupRef.current) {
        unfoldedGroupRef.current.remove();
        unfoldedGroupRef.current = null;
      }
      if (baseWedgeGroupRef.current) {
         baseWedgeGroupRef.current.visible = true;
      }
    };

    useEffect(() => {
      if (!canvasRef.current) return;

      // Force a clean slate for Paper.js
      if (paper.project) {
        paper.project.clear();
        paper.project.remove();
      }

      // EXPLICIT REF RESET: Prevent ghosting and deadlock by clearing stale references
      wedgePathRef.current = null;
      currentCutPathRef.current = null;
      unfoldedGroupRef.current = null;
      baseWedgeGroupRef.current = null;

      paper.setup(canvasRef.current);
      initializeWedge();

      return () => {
        if (paper.project) {
          paper.project.clear();
          paper.project.remove();
        }
      };
    }, [folds]);

    useEffect(() => {
      if (isUnfolded) {
        renderUnfolded();
      } else {
        restoreFolded();
      }
    }, [isUnfolded]);

    useImperativeHandle(ref, () => ({
      getUnfoldedSvg: () => {
        if (!paper.project) return null;

        const tempGroup: paper.Group | null = null;
        let wasFolded = false;

        // If currently folded, we need to temporarily unfold to generate the SVG
        if (!isUnfolded) {
             wasFolded = true;
             renderUnfolded();
        }

        // Export SVG string
        const svgString = paper.project.exportSVG({ asString: true }) as string;

        // Restore state if we temporarily modified it
        if (wasFolded) {
             restoreFolded();
        }

        return svgString;
      },
      clearCanvas: () => {
         initializeWedge();
      }
    }));

    return (
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        className="w-[800px] h-[800px] bg-white cursor-crosshair border border-gray-100 shadow-md"
        style={{ touchAction: 'none' }}
      />
    );
  }
);

PaperCuttingCanvas.displayName = 'PaperCuttingCanvas';
export default PaperCuttingCanvas;
