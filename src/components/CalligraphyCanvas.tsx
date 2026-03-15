'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PenTool, Trash2, Download } from 'lucide-react';

export const CalligraphyCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);

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

                    tool.onMouseDown = (event: { point: { x: number, y: number } }) => {
                        path = new p.Path({
                            segments: [event.point],
                            strokeColor: 'black',
                            strokeWidth: 12,
                            strokeCap: 'round',
                            strokeJoin: 'round',
                        });
                    };

                    tool.onMouseDrag = (event: { point: { x: number, y: number } }) => {
                        path.add(event.point);
                    };

                    tool.onMouseUp = () => {
                        path.simplify(10);

                        // Path Tracking Console Log (Validation requirement)
                        const pathData = path.pathData;
                        console.log('Calligraphy Path Generated:', pathData);
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
    }, []);

    const clearCanvas = () => {
        if (paperRef.current?.project) {
            paperRef.current.project.activeLayer.removeChildren();
            paperRef.current.view.update();
        }
    };

    return (
        <div className="relative w-full h-full bg-[#f4f1ea] rounded-[40px] overflow-hidden border border-[#d4c3a3] shadow-2xl flex flex-col items-center justify-center group">

            {/* Mi-style Grid (米字格) Background */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
                <div className="relative w-[400px] h-[400px] border-4 border-[#b22222]">
                    <div className="absolute top-1/2 left-0 right-0 h-0 border-t-2 border-dashed border-[#b22222]" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-0 border-l-2 border-dashed border-[#b22222]" />

                    {/* Diagonals */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <line x1="0" y1="0" x2="100" y2="100" stroke="#b22222" strokeWidth="1.5" strokeDasharray="4 4" />
                        <line x1="100" y1="0" x2="0" y2="100" stroke="#b22222" strokeWidth="1.5" strokeDasharray="4 4" />
                    </svg>
                </div>
            </div>

            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
                <div className="flex items-center gap-3 px-6 py-2.5 bg-[#b22222]/10 backdrop-blur-xl rounded-full border border-[#b22222]/20 shadow-xl">
                    <PenTool className="w-4 h-4 text-[#b22222]" />
                    <span className="text-[11px] text-[#8b0000] font-black uppercase tracking-[0.2em]">
                        米字格书法笔触追踪 (控制台查看 pathData)
                    </span>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                className="w-full h-full touch-none cursor-crosshair relative z-10 mix-blend-multiply"
            />

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/80 backdrop-blur-2xl p-4 rounded-[32px] border border-[#d4c3a3] shadow-xl z-20">
                <button
                    onClick={clearCanvas}
                    className="p-3.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-2xl transition-all"
                >
                    <Trash2 className="w-5 h-5" />
                </button>

                <button
                    className="flex items-center gap-3 px-8 py-3.5 bg-[#b22222] hover:bg-[#8b0000] text-white rounded-2xl font-black text-[11px] tracking-widest uppercase shadow-lg shadow-red-900/20 transition-all active:scale-95"
                >
                    <Download className="w-5 h-5" /> 导出笔触数据
                </button>
            </div>

            {!isInitialized && (
                <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm flex shadow-2xl items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-[#b22222]/20 border-t-[#b22222] rounded-full animate-spin" />
                    </div>
                </div>
            )}
        </div>
    );
};