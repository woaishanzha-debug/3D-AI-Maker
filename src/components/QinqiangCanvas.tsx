'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Palette, Trash2, Download, CheckCircle, SplitSquareHorizontal } from 'lucide-react';

export const QinqiangCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [status, setStatus] = useState<string>('请在左侧绘制对称脸谱');
    const [activeColor, setActiveColor] = useState<string>('#e11d48'); // Red (loyalty/courage)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paperRef = useRef<any>(null);
    const pathsRef = useRef<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        active: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mirror: any;
    }>({ active: null, mirror: null });

    // Store latest color in a ref for the Paper.js closure
    const colorRef = useRef(activeColor);
    useEffect(() => {
        colorRef.current = activeColor;
    }, [activeColor]);

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
                        const currentColor = colorRef.current;

                        // Active Path
                        const newPath = new p.Path({
                            strokeColor: currentColor,
                            strokeWidth: 8,
                            strokeCap: 'round',
                            strokeJoin: 'round',
                        });
                        newPath.add(event.point);
                        pathsRef.current.active = newPath;

                        // Mirror Path (Facial symmetry mapping)
                        const viewCenter = p.view.center.x;
                        const mirrorX = 2 * viewCenter - event.point.x;
                        const newMirrorPath = new p.Path({
                            strokeColor: currentColor,
                            strokeWidth: 8,
                            strokeCap: 'round',
                            strokeJoin: 'round',
                        });
                        newMirrorPath.add(new p.Point(mirrorX, event.point.y));
                        pathsRef.current.mirror = newMirrorPath;

                        setStatus('正在映射对称区域...');
                    };

                    tool.onMouseDrag = (event: { point: { x: number, y: number } }) => {
                        if (pathsRef.current.active) {
                            pathsRef.current.active.add(event.point);
                        }
                        if (pathsRef.current.mirror) {
                            const viewCenter = p.view.center.x;
                            const mirrorX = 2 * viewCenter - event.point.x;
                            pathsRef.current.mirror.add(new p.Point(mirrorX, event.point.y));
                        }
                    };

                    tool.onMouseUp = () => {
                        if (pathsRef.current.active) {
                            pathsRef.current.active.simplify(10);
                        }
                        if (pathsRef.current.mirror) {
                            pathsRef.current.mirror.simplify(10);
                        }
                        pathsRef.current = { active: null, mirror: null };
                        p.view.update();
                        setStatus('对称映射完成，可切换颜色继续');
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
            setStatus('请在左侧绘制对称脸谱');
        }
    };

    const colors = [
        { c: '#e11d48', n: '忠勇红' },
        { c: '#000000', n: '刚直黑' },
        { c: '#3b82f6', n: '桀骜蓝' },
        { c: '#f59e0b', n: '猛烈黄' },
        { c: '#ffffff', n: '奸诈白' }
    ];

    return (
        <div className="relative w-full h-full bg-[#1e293b] rounded-[40px] overflow-hidden border border-slate-600 shadow-2xl flex flex-col items-center justify-center group">

            {/* Symmetry Axis Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-red-500/30 border-l border-red-400/20 pointer-events-none z-10 flex flex-col items-center justify-center mix-blend-screen">
                <div className="px-3 py-1 bg-red-900/40 backdrop-blur-md rounded-lg border border-red-500/30 text-[10px] text-red-400 font-black uppercase tracking-[0.4em] rotate-90 whitespace-nowrap mb-20">
                    Symmetry Axis
                </div>
            </div>

            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
                <div className="flex items-center gap-3 px-6 py-2.5 bg-slate-800/80 backdrop-blur-xl rounded-full border border-slate-600 shadow-xl">
                    <SplitSquareHorizontal className="w-4 h-4 text-blue-400" />
                    <span className="text-[11px] text-blue-200 font-black uppercase tracking-[0.2em]">
                        {status}
                    </span>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                className="w-full h-full touch-none cursor-crosshair relative z-10"
            />

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 backdrop-blur-2xl p-4 rounded-[32px] border border-white/10 shadow-xl z-20">

                {/* Distinct Color Zone Palette */}
                <div className="flex items-center gap-2 px-4 border-r border-slate-700">
                    {colors.map((color) => (
                        <button
                            key={color.c}
                            onClick={() => setActiveColor(color.c)}
                            title={color.n}
                            className={`w-8 h-8 rounded-full border-2 transition-transform ${activeColor === color.c ? 'scale-125 border-blue-400 z-10' : 'border-transparent hover:scale-110'}`}
                            style={{ backgroundColor: color.c }}
                        />
                    ))}
                </div>

                <button
                    onClick={clearCanvas}
                    className="p-3.5 bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 rounded-2xl transition-all"
                >
                    <Trash2 className="w-5 h-5" />
                </button>

                <button
                    className="flex items-center gap-3 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[11px] tracking-widest uppercase shadow-lg shadow-blue-900/40 transition-all active:scale-95"
                >
                    <Download className="w-5 h-5" /> 导出脸谱数据
                </button>
            </div>

            {!isInitialized && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex shadow-2xl items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                </div>
            )}
        </div>
    );
};