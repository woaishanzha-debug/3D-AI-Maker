import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import paper from 'paper';

export interface SancaiCanvasRef {
  addComponent: (type: string) => void;
  setColor: (color: string) => void;
  applyGlazeFlow: () => void;
  exportToSvg: () => string;
}

interface Props {
  width?: number;
  height?: number;
}

export const SancaiCanvas = forwardRef<SancaiCanvasRef, Props>(({ width = 800, height = 600 }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toolRef = useRef<paper.Tool | null>(null);
  const currentColorRef = useRef<string>('#f0f0f0');
  const interactionModeRef = useRef<'move' | 'color'>('move');

  const partsRef = useRef<paper.PathItem[]>([]);
  const dripsRef = useRef<paper.Path[]>([]);

  useImperativeHandle(ref, () => ({
    addComponent: (type) => {
      if (!paper.project) return;

      let path: paper.PathItem;
      const center = paper.project.view.center;

      // Traditional '立胎' components
      if (type.includes('Head')) {
        path = new paper.Path.Circle({
          center: [center.x, center.y - 120],
          radius: 35,
          fillColor: '#f0e6d2',
          strokeColor: '#8b5a2b',
          strokeWidth: 2
        });
      } else if (type.includes('Body')) {
        path = new paper.Path.Rectangle({
          center: [center.x, center.y],
          size: [120, 150],
          radius: 15,
          fillColor: '#f0e6d2',
          strokeColor: '#8b5a2b',
          strokeWidth: 2
        });
      } else if (type.includes('Base')) {
        path = new paper.Path.Rectangle({
          center: [center.x, center.y + 110],
          size: [160, 30],
          radius: 5,
          fillColor: '#f0e6d2',
          strokeColor: '#8b5a2b',
          strokeWidth: 2
        });
      } else {
        path = new paper.Path.Circle({
          center: center,
          radius: 50,
          fillColor: '#f0e6d2',
          strokeColor: '#8b5a2b',
          strokeWidth: 2
        });
      }

      path.data = { isComponent: true, componentType: type };
      partsRef.current.push(path);
      path.bringToFront();
    },
    setColor: (color) => {
      if (color === '#f0f0f0' || color === 'move') {
         interactionModeRef.current = 'move';
         currentColorRef.current = '#f0f0f0';
      } else {
         interactionModeRef.current = 'color';
         currentColorRef.current = color;
      }
    },
    applyGlazeFlow: () => {
      // '施釉' (Flow simulation)
      if (!paper.project) return;

      // 清除之前的流釉效果，重新施釉
      dripsRef.current.forEach(drip => drip.remove());
      dripsRef.current = [];

      partsRef.current.forEach(part => {
        if (part.fillColor && part.fillColor.toCSS(true) !== '#f0e6d2') {
           const bounds = part.bounds;
           const dripCount = Math.floor(Math.random() * 6) + 3; // 3 to 8 drips per part

           for (let i = 0; i < dripCount; i++) {
             const startX = bounds.left + 10 + Math.random() * (bounds.width - 20);
             const startY = bounds.top + bounds.height * 0.3 + Math.random() * (bounds.height * 0.5);
             const length = Math.random() * 80 + 40;

             const drip = new paper.Path({
               segments: [
                 [startX, startY],
                 [startX + (Math.random() * 10 - 5), startY + length * 0.5],
                 [startX + (Math.random() * 6 - 3), startY + length]
               ],
               strokeColor: part.fillColor,
               strokeWidth: Math.random() * 10 + 5,
               strokeCap: 'round',
               strokeJoin: 'round',
               opacity: 0.8
             });

             drip.smooth({ type: 'continuous' });
             drip.blendMode = 'multiply';
             dripsRef.current.push(drip);
           }
        }
      });

      paper.view.update();
    },
    exportToSvg: () => {
      if (!paper.project) return '';

      let basePath: paper.PathItem | null = null;

      if (partsRef.current.length > 0) {
          // Clone the first part and scale slightly to fix precision gaps
          const firstPart = partsRef.current[0].clone() as paper.PathItem;
          firstPart.scale(1.02, firstPart.bounds.center);
          basePath = firstPart;

          for (let i = 1; i < partsRef.current.length; i++) {
              const partClone = partsRef.current[i].clone() as paper.PathItem;
              partClone.scale(1.02, partClone.bounds.center);

              const temp = basePath.unite(partClone) as paper.PathItem;

              // Ghost cleanup
              basePath.remove();
              partClone.remove();

              basePath = temp;
          }

          basePath.scale(1 / 1.02, basePath.bounds.center);

          basePath.name = 'Sancai_Base';
          basePath.fillColor = new paper.Color('#ffffff'); // White base layer for 3MF
          basePath.strokeColor = null;
          basePath.sendToBack();
      }


      // Wrap all colored items in a texture group
      const textureGroup = new paper.Group({ name: 'Sancai_Glaze_Texture' });
      partsRef.current.forEach(part => textureGroup.addChild(part));
      dripsRef.current.forEach(drip => textureGroup.addChild(drip));

      const svgString = paper.project.exportSVG({ asString: true }) as string;

      // Unwrap them after export
      partsRef.current.forEach(part => paper.project.activeLayer.addChild(part));
      dripsRef.current.forEach(drip => paper.project.activeLayer.addChild(drip));
      textureGroup.remove();


      if (basePath) {
          basePath.remove();
      }

      return svgString;
    }
  }));

  useEffect(() => {
    if (!canvasRef.current) return;

    paper.setup(canvasRef.current);
    const tool = new paper.Tool();
    toolRef.current = tool;

    let draggedItem: paper.Item | null = null;

    tool.onMouseDown = (event: paper.ToolEvent) => {
      const hitResult = paper.project.hitTest(event.point, {
        fill: true,
        stroke: true,
        segments: true,
        tolerance: 5
      });

      if (hitResult && hitResult.item) {
        let item = hitResult.item;

        if (item.data && item.data.isComponent) {
            if (interactionModeRef.current === 'color') {
                // 点蓝
                item.fillColor = new paper.Color(currentColorRef.current);
                // 增加混合模式增强釉面感
                item.blendMode = 'normal';
                item.opacity = 0.95;
            } else {
                // 立胎
                draggedItem = item;
                draggedItem.bringToFront();
            }
        }
      }
    };

    tool.onMouseDrag = (event: paper.ToolEvent) => {
      if (draggedItem && interactionModeRef.current === 'move') {
        draggedItem.position = draggedItem.position.add(event.delta);
      }
    };

    tool.onMouseUp = (event: paper.ToolEvent) => {
      if (draggedItem && interactionModeRef.current === 'move') {
          // Snap logic
          let snapped = false;

          partsRef.current.forEach(part => {
              if (!snapped && part !== draggedItem && part.bounds.intersects(draggedItem!.bounds)) {
                  const partCenter = part.bounds.center;
                  const dragCenter = draggedItem!.bounds.center;

                  if (Math.abs(partCenter.x - dragCenter.x) < 40) {
                      draggedItem!.position.x = partCenter.x;
                  }

                  if (Math.abs(part.bounds.top - draggedItem!.bounds.bottom) < 30) {
                      draggedItem!.position.y = part.bounds.top - draggedItem!.bounds.height / 2 + 5;
                      snapped = true;
                  } else if (Math.abs(part.bounds.bottom - draggedItem!.bounds.top) < 30) {
                      draggedItem!.position.y = part.bounds.bottom + draggedItem!.bounds.height / 2 - 5;
                      snapped = true;
                  }
              }
          });
          draggedItem = null;
      }
    };

    return () => {
      if (toolRef.current) {
        toolRef.current.remove();
        toolRef.current = null;
      }
      if (paper.project) {
        paper.project.clear();
        paper.project.remove();
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-[#faf5ed] rounded-3xl overflow-hidden relative shadow-inner border border-[#e5d9c5]">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full cursor-crosshair relative z-10"
      />
      <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] pointer-events-none mix-blend-multiply"></div>
    </div>
  );
});

SancaiCanvas.displayName = 'SancaiCanvas';
