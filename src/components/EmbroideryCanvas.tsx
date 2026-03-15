'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Palette, Trash2, Download } from 'lucide-react';

export const EmbroideryCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [density, setDensity] = useState<number>(5);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paperRef = useRef<any>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const initDrawingEngine = async () => {
            try {
                const paperDist = await import('paper/dist/paper-core');
                const paper = paperDist.default || paperDist;

                if (!paperRef.current && canvasRef.current) {
                    paper.setup(canvasRef.current);
                    paperRef.current = paper;

                    const p = paper;
                    const tool = new p.Tool();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    let path: any;

                    // Reduced point frequency to prevent main-thread blocking
                    // (Test the line density parameters in Paper.js to avoid main-thread blocking)
                    tool.minDistance = 10;

                    tool.onMouseDown = (event: { point: { x: number, y: number } }) => {
                        path = new p.Path({
                            strokeColor: '#e11d48',
                            strokeWidth: 2,
                            strokeCap: 'round',
                            strokeJoin: 'round',
                        });
                        path.add(event.point);
                    };

                    tool.onMouseDrag = (event: { point: { x: number, y: number }, delta: { x: number, y: number } }) => {
                        // Procedural line generation for thread rhythm based on density
                        const step = new p.Point(
                            event.delta.x + (Math.random() - 0.5) * density,
                            event.delta.y + (Math.random() - 0.5) * density
                        );

                        // We intentionally create a zig-zag embroidery rhythm
                        path.add(new p.Point(event.point.x + step.x, event.point.y + step.y));
                        path.add(event.point);
                    };

                    tool.onMouseUp = () => {
                        path.simplify(5); // Simplify heavily to keep performance smooth
                    };

                    tool.activate();
                    setIsInitialized(true);
                }
            } catch (err) {
                console.error('Drawing Engine Error:', err);
            }
        };

        initDrawingEngine();

        return () => {
            if (paperRef.current?.project) {
                paperRef.current.project.clear();
                paperRef.current.project.remove();
                paperRef.current = null;
            }
        };
    }, [density]); // Re-initialize if density changes, though we could just store it in a ref.

    const clearCanvas = () => {
        if (paperRef.current?.project) {
            paperRef.current.project.activeLayer.removeChildren();
            paperRef.current.view.update();
        }
    };

    return (
        <div className="relative w-full h-full bg-[#fdfbf7] rounded-[40px] overflow-hidden border border-rose-200 shadow-2xl flex flex-col items-center justify-center group">

            {/* Fabric texture overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '8px 8px' }} />

            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
                <div className="flex items-center gap-3 px-6 py-2.5 bg-rose-50 backdrop-blur-xl rounded-full border border-rose-200 shadow-xl">
                    <Palette className="w-4 h-4 text-rose-500" />
                    <span className="text-[11px] text-rose-700 font-black uppercase tracking-[0.2em]">
                        模拟刺绣针脚与线理
                    </span>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                className="w-full h-full touch-none cursor-crosshair relative z-10"
            />

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-2xl p-4 rounded-[32px] border border-rose-100 shadow-xl z-20">
                <div className="flex items-center gap-3 px-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">针脚密度</span>
                    <input
                        type="range"
                        min="2" max="20"
                        value={density}
                        onChange={(e) => setDensity(Number(e.target.value))}
                        className="w-24 accent-rose-500"
                    />
                </div>

                <div className="w-[1px] h-8 bg-slate-200 mx-1" />

                <button
                    onClick={clearCanvas}
                    className="p-3.5 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-2xl transition-all"
                >
                    <Trash2 className="w-5 h-5" />
                </button>

                <button
                    className="flex items-center gap-3 px-8 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-[11px] tracking-widest uppercase shadow-lg shadow-rose-900/20 transition-all active:scale-95"
                >
                    <Download className="w-5 h-5" /> 导出排线数据
                </button>
            </div>

            {!isInitialized && (
                <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm flex shadow-2xl items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                    </div>
                </div>
            )}
        </div>
    );
};