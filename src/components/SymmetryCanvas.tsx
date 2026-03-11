'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Download, BoxSelect, Sparkles } from 'lucide-react';

interface SymmetryCanvasProps {
    onExportSVG?: (svg: string) => void;
}

export const SymmetryCanvas: React.FC<SymmetryCanvasProps> = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [symmetryMode, setSymmetryMode] = useState(true);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Keep these as any for now because Paper.js types are complex via dynamic import, 
    // but we can at least remove the global disable and use local ignores if needed,
    // or better, use unknown/casting.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paperRef = useRef<any>(null);
    const pathsRef = useRef<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        active: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mirror: any;
    }>({ active: null, mirror: null });
    const symmetryRef = useRef(symmetryMode);

    useEffect(() => {
        symmetryRef.current = symmetryMode;
    }, [symmetryMode]);

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

                    tool.onMouseDown = (event: { point: { x: number, y: number } }) => {
                        setIsDrawing(true);
                        const newPath = new p.Path({
                            strokeColor: '#D4AF37',
                            strokeWidth: 4,
                            strokeCap: 'round',
                            strokeJoin: 'round',
                        });
                        newPath.add(event.point);
                        pathsRef.current.active = newPath;

                        if (symmetryRef.current) {
                            const viewCenter = p.view.center.x;
                            const mirrorX = 2 * viewCenter - event.point.x;
                            const newMirrorPath = new p.Path({
                                strokeColor: '#D4AF37',
                                strokeWidth: 4,
                                strokeCap: 'round',
                                strokeJoin: 'round',
                                opacity: 0.6
                            });
                            newMirrorPath.add(new p.Point(mirrorX, event.point.y));
                            pathsRef.current.mirror = newMirrorPath;
                        }
                    };

                    tool.onMouseDrag = (event: { point: { x: number, y: number } }) => {
                        if (pathsRef.current.active) {
                            pathsRef.current.active.add(event.point);
                        }

                        if (symmetryRef.current && pathsRef.current.mirror) {
                            const viewCenter = p.view.center.x;
                            const mirrorX = 2 * viewCenter - event.point.x;
                            pathsRef.current.mirror.add(new p.Point(mirrorX, event.point.y));
                        }
                    };

                    tool.onMouseUp = () => {
                        setIsDrawing(false);
                        if (pathsRef.current.active) {
                            pathsRef.current.active.simplify(10);
                        }
                        if (pathsRef.current.mirror) {
                            pathsRef.current.mirror.simplify(10);
                        }
                        pathsRef.current = { active: null, mirror: null };
                        p.view.update();
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
            // Cleanup paper project if needed
        };
    }, []);

    const clearCanvas = () => {
        if (paperRef.current?.project) {
            paperRef.current.project.activeLayer.removeChildren();
            paperRef.current.view.update();
        }
    };

    const exportSVG = () => {
        if (!paperRef.current?.project) return;
        const svgElement = paperRef.current.project.exportSVG() as SVGElement;
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cloisonne_design_${Date.now()}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="relative w-full h-full bg-[#0a1128] rounded-[40px] overflow-hidden border border-blue-500/30 group shadow-2xl">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#00F0FF 2px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            {symmetryMode && (
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-blue-500/40 border-l border-blue-400/20 pointer-events-none z-10 flex items-center justify-center">
                    <div className="px-3 py-1 bg-blue-600/30 backdrop-blur-md rounded-lg border border-blue-500/30 text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] rotate-90 whitespace-nowrap">
                        Symmetry Axis
                    </div>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="w-full h-full touch-none cursor-crosshair relative z-0"
            />

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-2xl p-4 rounded-[32px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20">
                <button
                    onClick={() => setSymmetryMode(!symmetryMode)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all ${symmetryMode ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'}`}
                >
                    <BoxSelect className="w-4 h-4" />
                    {symmetryMode ? '镜像：开启' : '镜像：关闭'}
                </button>

                <div className="w-[1px] h-8 bg-white/10 mx-1" />

                <button
                    onClick={clearCanvas}
                    className="p-3.5 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-2xl transition-all"
                >
                    <Trash2 className="w-5 h-5" />
                </button>

                <button
                    onClick={exportSVG}
                    className="flex items-center gap-3 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[11px] tracking-widest uppercase shadow-lg shadow-blue-900/40 transition-all active:scale-95"
                >
                    <Download className="w-5 h-5" /> 导出 SVG 底稿
                </button>
            </div>

            <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none z-20">
                <div className="flex items-center gap-3 px-6 py-2.5 bg-black/40 backdrop-blur-xl rounded-full border border-blue-500/20 shadow-xl">
                    <Sparkles className={`w-4 h-4 text-blue-400 ${isDrawing ? 'animate-spin' : ''}`} />
                    <span className="text-[11px] text-blue-200 font-black uppercase tracking-[0.2em]">
                        {isDrawing ? 'AI 正在同步笔触...' : '请在左侧区域勾勒线条'}
                    </span>
                </div>
            </div>

            {!isInitialized && (
                <div className="absolute inset-0 bg-slate-950 flex shadow-2xl items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-blue-500/60 font-black text-[10px] uppercase tracking-[0.5em]">System Loading...</p>
                    </div>
                </div>
            )}
        </div>
    );
};
