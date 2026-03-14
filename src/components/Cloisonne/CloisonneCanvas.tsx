'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

export interface CloisonneCanvasRef {
    setTool: (toolName: '制胎' | '掐丝' | '点蓝' | '烧蓝') => void;
    clearCanvas: () => void;
    getLineSvg: () => string | null;
    getBaseSvg: () => string | null;
}

interface CloisonneCanvasProps {
    onReady?: () => void;
}

const CloisonneCanvas = forwardRef<CloisonneCanvasRef, CloisonneCanvasProps>((props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const paperRef = useRef<any>(null);
    const [currentTool, setCurrentTool] = useState<'制胎' | '掐丝' | '点蓝' | '烧蓝'>('掐丝');
    const toolRef = useRef<'制胎' | '掐丝' | '点蓝' | '烧蓝'>('掐丝');
    const [selectedColor, setSelectedColor] = useState<string>('#3b82f6'); // default enamel color
    const selectedColorRef = useRef<string>('#3b82f6');

    // Layers
    const baseLayerRef = useRef<any>(null);
    const wireLayerRef = useRef<any>(null);
    const fillLayerRef = useRef<any>(null);

    const activePathRef = useRef<any>(null);

    // Keep tool state in sync for closures
    useEffect(() => {
        toolRef.current = currentTool;
    }, [currentTool]);

    useEffect(() => {
        selectedColorRef.current = selectedColor;
    }, [selectedColor]);

    useEffect(() => {
        if (!canvasRef.current) return;

        let isMounted = true;

        const initPaper = async () => {
            const paperModule = await import('paper/dist/paper-core');
            const paper = paperModule.default || paperModule;
            if (!isMounted) return;

            paper.setup(canvasRef.current!);
            paperRef.current = paper;

            // Initialize layers
            baseLayerRef.current = new paper.Layer({ name: 'Cloisonne_Base' });
            fillLayerRef.current = new paper.Layer({ name: 'Cloisonne_Fill' });
            wireLayerRef.current = new paper.Layer({ name: 'Cloisonne_Wire' });

            // Set up interactions
            const tool = new paper.Tool();
            tool.minDistance = 2;

            tool.onMouseDown = (event: any) => {
                if (toolRef.current === '制胎') {
                    // Create base shape
                    baseLayerRef.current.activate();
                    if (baseLayerRef.current.children.length > 0) {
                        baseLayerRef.current.removeChildren();
                    }
                    // For simplicity, make a circular or rounded rect pendant
                    const baseShape = new paper.Path.Circle({
                        center: event.point,
                        radius: 150,
                        fillColor: '#f8fafc', // very light gray base
                        strokeColor: '#cbd5e1',
                        strokeWidth: 2,
                    });
                    baseLayerRef.current.addChild(baseShape);

                } else if (toolRef.current === '掐丝') {
                    wireLayerRef.current.activate();
                    activePathRef.current = new paper.Path({
                        strokeColor: '#D4AF37', // Gold wire
                        strokeWidth: 3,
                        strokeCap: 'round',
                        strokeJoin: 'round',
                    });
                    activePathRef.current.add(event.point);

                } else if (toolRef.current === '点蓝') {
                    fillLayerRef.current.activate();
                    if (wireLayerRef.current.children.length === 0) return;

                    // A robust topological fill using Paper.js path intersections and faces
                    // We can use a trick: export the wires to a hidden canvas, perform a pixel-based flood fill,
                    // and use the resulting bounding box or pixels. But to keep it strictly vector:
                    // 1. Create a large path that covers the canvas.
                    // 2. Instead of standard subtract, we expand the strokes of wires.
                    // Paper.js doesn't have a native stroke expansion, but we can approximate it:

                    // For this educational implementation, a common workaround for "点蓝"
                    // is to collect all closed paths or detect if the point is inside an area enclosed by wires.
                    // Because real boolean stroke-to-path expansion requires a library (like paperjs-offset),
                    // we will instead draw a raster of the wire layer, flood fill its pixels,
                    // and place the filled pixels as an image in the fill layer.

                    const raster = wireLayerRef.current.rasterize(72, false);
                    raster.visible = false;
                    const imgData = raster.getImageData(new paper.Rectangle(0, 0, raster.width, raster.height));

                    const point = event.point;
                    const x = Math.floor(point.x - raster.bounds.x);
                    const y = Math.floor(point.y - raster.bounds.y);

                    if (x >= 0 && x < imgData.width && y >= 0 && y < imgData.height) {
                        // Pixel flood fill
                        const targetColor = [0, 0, 0, 0]; // wire layer has transparent background
                        const fillColorRgb = new paper.Color(selectedColorRef.current);
                        const fillR = Math.round(fillColorRgb.red * 255);
                        const fillG = Math.round(fillColorRgb.green * 255);
                        const fillB = Math.round(fillColorRgb.blue * 255);
                        const fillA = 255;

                        const pixelPos = (y * imgData.width + x) * 4;
                        const startR = imgData.data[pixelPos];
                        const startG = imgData.data[pixelPos + 1];
                        const startB = imgData.data[pixelPos + 2];
                        const startA = imgData.data[pixelPos + 3];

                        // If clicking on wire, do nothing
                        if (startA > 10) {
                            raster.remove();
                            return;
                        }

                        // Basic flood fill
                        const pixelsToCheck = [x, y];
                        const checked = new Uint8Array(imgData.width * imgData.height);

                        // Create a new imageData just for the filled area
                        const filledImgData = new ImageData(imgData.width, imgData.height);

                        while (pixelsToCheck.length > 0) {
                            const cy = pixelsToCheck.pop()!;
                            const cx = pixelsToCheck.pop()!;
                            const idx = cy * imgData.width + cx;

                            if (checked[idx]) continue;
                            checked[idx] = 1;

                            const pIdx = idx * 4;
                            if (imgData.data[pIdx + 3] > 10) continue; // hit a wire boundary

                            // Fill pixel
                            filledImgData.data[pIdx] = fillR;
                            filledImgData.data[pIdx + 1] = fillG;
                            filledImgData.data[pIdx + 2] = fillB;
                            filledImgData.data[pIdx + 3] = fillA;

                            if (cx > 0) pixelsToCheck.push(cx - 1, cy);
                            if (cx < imgData.width - 1) pixelsToCheck.push(cx + 1, cy);
                            if (cy > 0) pixelsToCheck.push(cx, cy - 1);
                            if (cy < imgData.height - 1) pixelsToCheck.push(cx, cy + 1);
                        }

                        // Create raster for the fill
                        const fillRaster = new paper.Raster(filledImgData);
                        fillRaster.position = raster.position;
                        fillLayerRef.current.addChild(fillRaster);
                    }
                    raster.remove();

                } else if (toolRef.current === '烧蓝') {
                    // Undo or clear last action. Let's make it clear all or undo the last wire/fill depending on click?
                    // Actually, prompt says: '烧蓝' (Undo/Clear).
                    // We'll expose a clearCanvas method instead.
                }
            };

            tool.onMouseDrag = (event: any) => {
                if (toolRef.current === '掐丝' && activePathRef.current) {
                    activePathRef.current.add(event.point);
                }
            };

            tool.onMouseUp = (event: any) => {
                if (toolRef.current === '掐丝' && activePathRef.current) {
                    if (activePathRef.current.segments.length > 1) {
                        activePathRef.current.simplify(10);
                    }
                    activePathRef.current = null;
                }
            };

            if (props.onReady) {
                props.onReady();
            }
        };

        initPaper();

        return () => {
            isMounted = false;
            if (paperRef.current) {
                paperRef.current.project.clear();
                paperRef.current.project.remove();
            }
        };
    }, []);

    useImperativeHandle(ref, () => ({
        setTool: (toolName) => {
            setCurrentTool(toolName);
        },
        clearCanvas: () => {
            if (wireLayerRef.current) wireLayerRef.current.removeChildren();
            if (fillLayerRef.current) fillLayerRef.current.removeChildren();
            if (baseLayerRef.current) baseLayerRef.current.removeChildren();
        },
        getLineSvg: () => {
            if (!paperRef.current || !wireLayerRef.current) return null;
            // Only export wire layer by hiding others
            const oldFillVisible = fillLayerRef.current.visible;
            const oldBaseVisible = baseLayerRef.current.visible;
            fillLayerRef.current.visible = false;
            baseLayerRef.current.visible = false;

            const svg = paperRef.current.project.exportSVG({ asString: true });

            fillLayerRef.current.visible = oldFillVisible;
            baseLayerRef.current.visible = oldBaseVisible;
            return svg;
        },
        getBaseSvg: () => {
            if (!paperRef.current || !baseLayerRef.current) return null;
            // Only export base layer by hiding others
            const oldFillVisible = fillLayerRef.current.visible;
            const oldWireVisible = wireLayerRef.current.visible;
            fillLayerRef.current.visible = false;
            wireLayerRef.current.visible = false;

            const svg = paperRef.current.project.exportSVG({ asString: true });

            fillLayerRef.current.visible = oldFillVisible;
            wireLayerRef.current.visible = oldWireVisible;
            return svg;
        }
    }));

    return (
        <div className="relative w-full h-full bg-slate-900 rounded-3xl overflow-hidden shadow-inner border border-white/10">
            {/* Provide a color picker overlay for '点蓝' */}
            {currentTool === '点蓝' && (
                <div className="absolute top-4 left-4 flex gap-2 z-10 p-2 bg-black/50 backdrop-blur-md rounded-xl border border-white/20">
                    {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff'].map(c => (
                        <button
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                            style={{ backgroundColor: c, borderColor: selectedColor === c ? 'white' : 'transparent' }}
                        />
                    ))}
                </div>
            )}

            {/* Prompt for 制胎 */}
            {currentTool === '制胎' && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold border border-blue-500/30 backdrop-blur-sm pointer-events-none">
                    点击画板任意位置生成底胎
                </div>
            )}

            <canvas ref={canvasRef} className="w-full h-full cursor-crosshair touch-none" />
        </div>
    );
});

CloisonneCanvas.displayName = 'CloisonneCanvas';

export default CloisonneCanvas;
