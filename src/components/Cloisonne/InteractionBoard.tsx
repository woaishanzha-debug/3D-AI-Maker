'use client';

import React, { useRef, useState } from 'react';
import CloisonneCanvas, { CloisonneCanvasRef } from './CloisonneCanvas';
import { exportSvgTo3mf } from '@/lib/svgTo3mfConverter';
import { Download, Eraser, PaintBucket, PenTool, Hexagon } from 'lucide-react';

export default function InteractionBoard() {
    const canvasRef = useRef<CloisonneCanvasRef>(null);
    const [activeTool, setActiveTool] = useState<'制胎' | '掐丝' | '点蓝' | '烧蓝'>('掐丝');
    const [isExporting, setIsExporting] = useState(false);

    const handleToolSelect = (toolName: '制胎' | '掐丝' | '点蓝' | '烧蓝') => {
        if (toolName === '烧蓝') {
            // Also trigger clear if that's the desired behavior of "烧蓝" for UI flow
            const confirmClear = window.confirm("确定要烧蓝（清空画布）吗？");
            if (confirmClear && canvasRef.current) {
                canvasRef.current.clearCanvas();
            }
            // Keep the previously active tool
            return;
        }

        setActiveTool(toolName);
        if (canvasRef.current) {
            canvasRef.current.setTool(toolName);
        }
    };

    const handleExport = async () => {
        if (!canvasRef.current) return;
        setIsExporting(true);

        try {
            // 1. Export SVG/PDF of just the '掐丝' lines for printing
            const lineSvg = canvasRef.current.getLineSvg();
            if (lineSvg) {
                // Download raw SVG for physical tracing
                const blob = new Blob([lineSvg], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'cloisonne_filigree_stencil.svg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            // 2. Export Generic base object via exportSvgTo3mf
            const baseSvg = canvasRef.current.getBaseSvg();
            if (baseSvg) {
                await exportSvgTo3mf(baseSvg, {
                    baseLayerId: 'Cloisonne_Base',
                    baseDepth: 1.0,
                    itemDepth: 1.0, // Item depth shouldn't matter as we are only sending the base layer
                    filename: 'cloisonne_base.3mf',
                    groupName: 'Cloisonne_Project'
                });
            } else {
                alert('请先使用【制胎】工具创建底座，然后再出炉！');
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('出炉失败，请重试。');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 h-full gap-4 max-w-6xl mx-auto w-full relative">
            <div className="flex justify-between items-center bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/20 relative z-10">
                <div className="flex gap-2 items-center">
                    <ToolButton
                        icon={<Hexagon size={18} />}
                        label="制胎"
                        isActive={activeTool === '制胎'}
                        onClick={() => handleToolSelect('制胎')}
                        desc="Object Contour Selection"
                    />
                    <ToolButton
                        icon={<PenTool size={18} />}
                        label="掐丝"
                        isActive={activeTool === '掐丝'}
                        onClick={() => handleToolSelect('掐丝')}
                        desc="Vector Filigree Brush"
                    />
                    <ToolButton
                        icon={<PaintBucket size={18} />}
                        label="点蓝"
                        isActive={activeTool === '点蓝'}
                        onClick={() => handleToolSelect('点蓝')}
                        desc="Flood Fill Tool"
                    />
                    <div className="w-[1px] h-8 bg-white/20 mx-2" />
                    <ToolButton
                        icon={<Eraser size={18} />}
                        label="烧蓝"
                        isActive={activeTool === '烧蓝'}
                        onClick={() => handleToolSelect('烧蓝')}
                        desc="Undo/Clear"
                    />
                </div>

                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    <Download size={18} />
                    {isExporting ? '出炉中...' : '出炉 (Export)'}
                </button>
            </div>

            <div className="flex-1 w-full h-[600px] rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl relative">
                <CloisonneCanvas ref={canvasRef} />
            </div>
        </div>
    );
}

function ToolButton({ icon, label, isActive, onClick, desc }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, desc: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[80px] group relative ${isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5 border border-transparent'}`}
        >
            <div className="flex items-center gap-1.5 mb-1">
                {icon}
                <span className="font-bold text-sm tracking-widest">{label}</span>
            </div>
            {/* Tooltip on hover */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1.5 bg-black/80 backdrop-blur text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {desc}
            </div>
        </button>
    );
}
