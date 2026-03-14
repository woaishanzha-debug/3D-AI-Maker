"use client";

import React, { useRef, useState, useEffect } from 'react';
// @ts-expect-error paper is missing types
import paper from 'paper/dist/paper-core';
import { EVENTS } from '@/lib/event-bus';

export function LianpuCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paperProjectRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brushToolRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentPathRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mirrorPathRef = useRef<any>(null);

    const [activeTool, setActiveTool] = useState<'draw' | 'stamp'>('draw');
    const activeToolRef = useRef(activeTool);
    const [, setShowGuides] = useState(true);

    useEffect(() => {
        activeToolRef.current = activeTool;
    }, [activeTool]);

    // Initialise Paper.js and Cleanup Logic
    useEffect(() => {
        if (!canvasRef.current) return;

        // Robust cleanup: remove any existing project to prevent ghost canvases
        if (paperProjectRef.current) {
            paperProjectRef.current.remove();
        }

        // Setup Paper.js
        paper.setup(canvasRef.current);
        paperProjectRef.current = paper.project;

        // Initialize layers
        const bgLayer = new paper.Layer();
        bgLayer.name = 'Lianpu_Base';

        const guidesLayer = new paper.Layer();
        guidesLayer.name = 'Lianpu_Guides';

        const drawingLayer = new paper.Layer();
        drawingLayer.name = 'Lianpu_Drawing';

        // Draw Base Outline (simplified mask shape)
        bgLayer.activate();
        const center = paper.view.center;
        const maskWidth = 200;
        const maskHeight = 280;

        const maskPath = new paper.Path.Ellipse({
            center: center,
            size: [maskWidth, maskHeight],
            fillColor: '#FDF6E3',
            strokeColor: '#333333',
            strokeWidth: 4
        });

        // Make the mask more "face" like
        maskPath.segments[2].point.y += 40; // bottom chin

        // Draw Guide Lines (立轴)
        guidesLayer.activate();
        const vGuide = new paper.Path.Line(
            new paper.Point(center.x, center.y - maskHeight / 2 - 20),
            new paper.Point(center.x, center.y + maskHeight / 2 + 20)
        );
        vGuide.strokeColor = new paper.Color(1, 0, 0, 0.3);
        vGuide.dashArray = [5, 5];

        const hGuide = new paper.Path.Line(
            new paper.Point(center.x - maskWidth / 2 - 20, center.y - 30),
            new paper.Point(center.x + maskWidth / 2 + 20, center.y - 30)
        );
        hGuide.strokeColor = new paper.Color(1, 0, 0, 0.3);
        hGuide.dashArray = [5, 5];

        // Setup drawing tool
        drawingLayer.activate();
        const brushTool = new paper.Tool();
        brushTool.minDistance = 2;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        brushTool.onMouseDown = (event: any) => {
            if (activeToolRef.current !== 'draw') return;

            drawingLayer.activate();

            // Primary path
            currentPathRef.current = new paper.Path({
                segments: [event.point],
                strokeColor: '#E63946', // Red color for '勾骨'
                strokeWidth: 6,
                strokeCap: 'round',
                strokeJoin: 'round'
            });

            // Mirrored path
            mirrorPathRef.current = new paper.Path({
                segments: [getMirroredPoint(event.point, center.x)],
                strokeColor: '#E63946',
                strokeWidth: 6,
                strokeCap: 'round',
                strokeJoin: 'round'
            });
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        brushTool.onMouseDrag = (event: any) => {
            if (activeToolRef.current !== 'draw' || !currentPathRef.current || !mirrorPathRef.current) return;

            currentPathRef.current.add(event.point);
            mirrorPathRef.current.add(getMirroredPoint(event.point, center.x));
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        brushTool.onMouseUp = (event: any) => {
            if (activeToolRef.current !== 'draw' || !currentPathRef.current || !mirrorPathRef.current) return;

            currentPathRef.current.add(event.point);
            mirrorPathRef.current.add(getMirroredPoint(event.point, center.x));

            // Apply path.simplify() for smooth strokes
            currentPathRef.current.simplify(10);
            mirrorPathRef.current.simplify(10);

            currentPathRef.current = null;
            mirrorPathRef.current = null;
        };

        brushToolRef.current = brushTool;

        if (activeToolRef.current === 'draw') {
            brushToolRef.current.activate();
        }

        const handleResize = () => {
            if (canvasRef.current && paper.view) {
                const rect = canvasRef.current.parentElement?.getBoundingClientRect();
                if (rect) {
                    paper.view.viewSize = new paper.Size(rect.width, rect.height);
                    // Center the mask
                    const newCenter = paper.view.center;
                    const delta = newCenter.subtract(center);
                    bgLayer.position = bgLayer.position.add(delta);
                    guidesLayer.position = guidesLayer.position.add(delta);
                    drawingLayer.position = drawingLayer.position.add(delta);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        // Cleanup function for React Strict Mode
        return () => {
            window.removeEventListener('resize', handleResize);
            if (brushToolRef.current) {
                brushToolRef.current.remove();
                brushToolRef.current = null;
            }
            if (paperProjectRef.current) {
                paperProjectRef.current.clear(); // Clear all items
                paperProjectRef.current.remove(); // Destroy instance
                paperProjectRef.current = null;
            }
        };
    }, []); // Run once on mount

    // Helper function for mirroring
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getMirroredPoint = (point: any, centerX: number) => {
        const dx = point.x - centerX;
        return new paper.Point(centerX - dx, point.y);
    };

    // Handle tool change event
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleToolChange = (e: any) => {
            const newTool = e.detail?.tool;
            if (newTool) {
                setActiveTool(newTool);
                if (newTool === 'draw' && brushToolRef.current) {
                    brushToolRef.current.activate();
                } else if (paperProjectRef.current) {
                    // Deactivate brush by activating a dummy or default tool if stamp
                    // In real app, we might activate a stamp tool
                    // @ts-expect-error paper.tool can be null to deactivate
                    paper.tool = null;
                }
            }
        };
        window.addEventListener(EVENTS.TOOL_CHANGED, handleToolChange);
        return () => window.removeEventListener(EVENTS.TOOL_CHANGED, handleToolChange);
    }, []);

    // Handle toggle guides
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleToggleGuides = (e: any) => {
            const show = e.detail?.show;
            setShowGuides(show);
            if (paperProjectRef.current) {
                const guidesLayer = paperProjectRef.current.layers['Lianpu_Guides'];
                if (guidesLayer) {
                    guidesLayer.visible = show;
                }
            }
        };
        window.addEventListener('qinlianpu:toggle_guides', handleToggleGuides);
        return () => window.removeEventListener('qinlianpu:toggle_guides', handleToggleGuides);
    }, []);

    // Handle clear canvas
    useEffect(() => {
        const handleClearCanvas = () => {
            if (paperProjectRef.current) {
                const drawingLayer = paperProjectRef.current.layers['Lianpu_Drawing'];
                if (drawingLayer) {
                    drawingLayer.removeChildren();
                }
            }
        };
        window.addEventListener(EVENTS.CLEAR_CANVAS, handleClearCanvas);
        return () => window.removeEventListener(EVENTS.CLEAR_CANVAS, handleClearCanvas);
    }, []);

    // Handle export SVG
    useEffect(() => {
        const handleRequestSvg = () => {
            if (!paperProjectRef.current) return;

            // Temporarily hide guides for export
            const guidesLayer = paperProjectRef.current.layers['Lianpu_Guides'];
            const wasVisible = guidesLayer ? guidesLayer.visible : false;
            if (guidesLayer) guidesLayer.visible = false;

            // Export the SVG string
            const svgString = paperProjectRef.current.exportSVG({ asString: true });

            // Restore guides
            if (guidesLayer) guidesLayer.visible = wasVisible;

            // Dispatch result back
            window.dispatchEvent(new CustomEvent(EVENTS.SVG_EXPORTED, { detail: { svg: svgString } }));
        };

        window.addEventListener(EVENTS.REQUEST_SVG, handleRequestSvg);
        return () => window.removeEventListener(EVENTS.REQUEST_SVG, handleRequestSvg);
    }, []);

    return (
        <div className="w-full h-full min-h-[600px] bg-slate-900 rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl">
            <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair touch-none"
                style={{ background: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)' }}
            />
        </div>
    );
}
