'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Download, BoxSelect, Sparkles, Paintbrush, ShieldAlert } from 'lucide-react';
import { EVENTS, TotemInjectedPayload } from '@/lib/event-bus';
import { totemSymbols } from '@/constants/totem-symbols';

interface MashaoCanvasProps {
    onExportSVG?: (svg: string) => void;
}

export const MashaoCanvas: React.FC<MashaoCanvasProps> = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [symmetryMode, setSymmetryMode] = useState(true);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [brushColor, setBrushColor] = useState('#FF0000'); // Default to Red for Mashao

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paperRef = useRef<any>(null);
    const pathsRef = useRef<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        active: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mirror: any;
    }>({ active: null, mirror: null });
    const symmetryRef = useRef(symmetryMode);
    const colorRef = useRef(brushColor);

    useEffect(() => {
        symmetryRef.current = symmetryMode;
    }, [symmetryMode]);

    useEffect(() => {
        colorRef.current = brushColor;
    }, [brushColor]);

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

                    // ==========================================
                    // 1. 图层显式管理 (解决图腾注入不显示的幽灵图层问题)
                    // ==========================================
                    const baseLayer = new p.Layer({ name: 'BaseLayer' });
                    const totemLayer = new p.Layer({ name: 'TotemLayer' });
                    const drawLayer = new p.Layer({ name: 'DrawLayer' });

                    const centerX = p.view.center.x;
                    const centerY = p.view.center.y;

                    // 全局引用当前底板，用于后续的越界切割判定
                    let globalBaseShape: any = null;

                    // ==========================================
                    // 2. 纯正非遗轮廓 (精确 SVG 路径算法)
                    // ==========================================
                    const drawBaseShape = (shapeMode: string) => {
                      baseLayer.activate();
                      baseLayer.removeChildren();

                      // 使用精确的贝塞尔 SVG 数据，彻底解决花生/鸡蛋畸形问题
                      const doubleGourdSVG = 'M 0,-140 C 60,-140 80,-70 45,-20 C 100,10 130,110 0,160 C -130,110 -100,10 -45,-20 C -80,-70 -60,-140 0,-140 Z';
                      const dipperSVG = 'M 0,-140 C 50,-140 70,-90 80,-30 C 100,60 80,150 0,160 C -80,150 -100,60 -80,-30 C -70,-90 -50,-140 0,-140 Z';

                      globalBaseShape = new p.CompoundPath(shapeMode === 'double_gourd' ? doubleGourdSVG : dipperSVG);
                      globalBaseShape.position = new p.Point(centerX, centerY);
                      
                      // 放大 1.8 倍适配画布 (增强视觉张力)
                      globalBaseShape.scale(1.8);
                      
                      globalBaseShape.fillColor = new p.Color('#ffffff');
                      globalBaseShape.strokeColor = new p.Color('#aa0000');
                      globalBaseShape.strokeWidth = 3;
                      globalBaseShape.name = 'Mashao_Base';
                      p.view.update();
                    };

                    drawBaseShape('double_gourd'); 

                    // ==========================================
                    // 3. 拖拽工具流 (物理结界：严禁图腾拖出马勺)
                    // ==========================================
                    const dragTool = new p.Tool();
                    let draggedItem: any = null;
                    
                    dragTool.onMouseDown = (event: any) => {
                      const hitResult = p.project.hitTest(event.point, { fill: true, tolerance: 5 });
                      // 允许拾取图腾，但绝对禁止拖拽底板
                      if (hitResult && hitResult.item.name !== 'Mashao_Base') {
                        draggedItem = hitResult.item;
                        draggedItem.bringToFront();
                      }
                    };
                    dragTool.onMouseDrag = (event: any) => {
                      if (draggedItem && globalBaseShape) {
                        const newPos = draggedItem.position.add(event.delta);
                        // 核心结界判定：只有新位置在底板内部，才允许挪动
                        if (globalBaseShape.contains(newPos)) {
                          draggedItem.position = newPos;
                          if (symmetryRef.current && (draggedItem as any)._mirrorItem) {
                            const mirrorItem = (draggedItem as any)._mirrorItem;
                            const mX = 2 * centerX - draggedItem.position.x;
                            mirrorItem.position = new p.Point(mX, draggedItem.position.y);
                          }
                        }
                      }
                    };
                    dragTool.onMouseUp = () => { draggedItem = null; };

                    // ==========================================
                    // 4. 实体画笔流 (显式双轨追踪 + 完美防出界裁切)
                    // ==========================================
                    const drawTool = new p.Tool();
                    const symmetryAxisX = centerX; 

                    // 显式追踪左右两支画笔的当前实体
                    let leftBrushPath: any = null;
                    let rightBrushPath: any = null;

                    const getSafeColor = () => {
                      const hex = colorRef.current || '#FF0000';
                      return new p.Color(hex);
                    };

                    drawTool.onMouseDown = (event: any) => {
                      drawLayer.activate();
                      setIsDrawing(true);
                      const safeColor = getSafeColor();
                      const brushRadius = 8; 

                      // 1. 生成左侧（原始）触点
                      leftBrushPath = new p.Path.Circle({
                        center: event.point,
                        radius: brushRadius,
                        fillColor: safeColor
                      });

                      // 2. 生成右侧（镜像）触点
                      const mirroredPoint = new p.Point(2 * symmetryAxisX - event.point.x, event.point.y);
                      rightBrushPath = new p.Path.Circle({
                        center: mirroredPoint,
                        radius: brushRadius,
                        fillColor: safeColor
                      });
                    };
                    
                    drawTool.onMouseDrag = (event: any) => {
                      if (!leftBrushPath || !rightBrushPath) return;
                      const safeColor = getSafeColor();
                      const brushRadius = 8;

                      // === 处理左支画笔生长 ===
                      const stepLeft = new p.Path.Circle({ center: event.point, radius: brushRadius });
                      const unitedLeft = leftBrushPath.unite(stepLeft) as any;
                      leftBrushPath.remove();
                      stepLeft.remove();
                      leftBrushPath = unitedLeft;
                      leftBrushPath.fillColor = safeColor; 

                      // === 处理右支镜像画笔同步生长 ===
                      const mirroredPoint = new p.Point(2 * symmetryAxisX - event.point.x, event.point.y);
                      const stepRight = new p.Path.Circle({ center: mirroredPoint, radius: brushRadius });
                      const unitedRight = rightBrushPath.unite(stepRight) as any;
                      rightBrushPath.remove();
                      stepRight.remove();
                      rightBrushPath = unitedRight;
                      rightBrushPath.fillColor = safeColor;
                    };
                    
                    drawTool.onMouseUp = () => {
                      setIsDrawing(false);
                      if (globalBaseShape) {
                        const safeColor = getSafeColor();

                        // 单独对左侧画笔进行越界裁切
                        if (leftBrushPath) {
                          const trimmedLeft = leftBrushPath.intersect(globalBaseShape) as any;
                          leftBrushPath.remove();
                          if (trimmedLeft) {
                             trimmedLeft.fillColor = safeColor;
                             trimmedLeft.simplify(4); 
                          }
                        }

                        // 单独对右侧画笔进行越界裁切
                        if (rightBrushPath) {
                          const trimmedRight = rightBrushPath.intersect(globalBaseShape) as any;
                          rightBrushPath.remove();
                          if (trimmedRight) {
                             trimmedRight.fillColor = safeColor;
                             trimmedRight.simplify(4); 
                          }
                        }
                      }
                      
                      // 清空追踪器，等待下一笔
                      leftBrushPath = null;
                      rightBrushPath = null;
                    };

                    dragTool.activate();

                    // ==========================================
                    // 5. 事件监听器 (解耦与安全查找)
                    // ==========================================
                    const handleTotemAdd = (e: Event) => {
                      if (!p.project) return;
                      const customEvent = e as CustomEvent<{ element: string }>;
                      const el = customEvent.detail.element;
                      
                      const tLayer = p.project.layers.find((l: any) => l.name === 'TotemLayer');
                      if (tLayer) tLayer.activate();

                      

                      const symbolData = totemSymbols[el] || totemSymbols['火'];
                      const vectorItem = new p.CompoundPath(symbolData.path);
                      vectorItem.fillColor = new p.Color(symbolData.color);
                      vectorItem.scale(4); 
                      
                      // 直接掉落在中心
                      vectorItem.position = new p.Point(centerX, centerY);

                      if (symmetryRef.current) {
                        const mX = 2 * centerX - centerX; // Still centerX but for consistency
                        const mirrorItem = vectorItem.clone();
                        mirrorItem.position = new p.Point(mX, centerY);
                        (vectorItem as any)._mirrorItem = mirrorItem;
                        (mirrorItem as any)._mirrorItem = vectorItem;
                      }

                      p.view.update();
                    };

                    const handleShapeChange = (e: Event) => {
                      const customEvent = e as CustomEvent<{ shapeId: string }>;
                      drawBaseShape(customEvent.detail.shapeId);
                    };

                    const handleToolChange = (e: Event) => {
                      const customEvent = e as CustomEvent<{ mode: string }>;
                      if (customEvent.detail.mode === 'drag') dragTool.activate();
                      else drawTool.activate();
                    };

                    const handleRequestSvg = (e: Event) => {
                        const customEvent = e as CustomEvent<{ action: 'preview' | 'export' }>;
                        const action = customEvent.detail?.action || 'preview';
                        
                        if (p.project) {
                            const svgString = p.project.exportSVG({ asString: true }) as string;
                            window.dispatchEvent(new CustomEvent(EVENTS.SVG_EXPORTED, { 
                                detail: { svgString, action } 
                            }));
                        }
                    };

                    window.addEventListener(EVENTS.TOTEM_ADD, handleTotemAdd);
                    window.addEventListener(EVENTS.SHAPE_CHANGED, handleShapeChange);
                    window.addEventListener(EVENTS.TOOL_CHANGED, handleToolChange);
                    window.addEventListener(EVENTS.REQUEST_SVG, handleRequestSvg);

                    setIsInitialized(true);

                    (window as any)._mashaoCleanup = () => {
                        window.removeEventListener(EVENTS.TOTEM_ADD, handleTotemAdd);
                        window.removeEventListener(EVENTS.SHAPE_CHANGED, handleShapeChange);
                        window.removeEventListener(EVENTS.TOOL_CHANGED, handleToolChange);
                        window.removeEventListener(EVENTS.REQUEST_SVG, handleRequestSvg);
                        p.project.clear();
                        dragTool.remove();
                        drawTool.remove();
                    };
                }
            } catch (err) {
                console.error('Drawing Engine Error:', err);
            }
        };

        initDrawingEngine();

        return () => {
            if ((window as any)._mashaoCleanup) {
                (window as any)._mashaoCleanup();
            }
        };
    }, []);


    const clearCanvas = () => {
        if (paperRef.current?.project) {
            const drawLayer = paperRef.current.project.layers.find((l: any) => l.name === 'DrawLayer');
            if (drawLayer) {
                drawLayer.removeChildren();
                paperRef.current.view.update();
            }
        }
    };


    const colors = [
        { name: '秦风红', value: '#FF0000' },
        { name: '正气黑', value: '#000000' },
        { name: '纯净白', value: '#FFFFFF' },
        { name: '华丽金', value: '#D4AF37' }
    ];

    return (
        <div className="relative w-full h-[600px] md:h-[700px] bg-[#F4EEDB] rounded-[40px] overflow-hidden border border-[#d2c9b3] group shadow-2xl">
            <div className="absolute inset-0 pointer-events-none opacity-[0.2]">
                <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#aa0000 1px, transparent 0)', backgroundSize: '30px 30px' }} />
            </div>

            {symmetryMode && (
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-red-800/20 border-l border-red-800/10 pointer-events-none z-10 flex items-center justify-center">
                    <div className="px-3 py-1 bg-red-800/10 backdrop-blur-md rounded-lg border border-red-800/20 text-[10px] text-red-800 font-black uppercase tracking-[0.4em] rotate-90 whitespace-nowrap">
                        SYMMETRY
                    </div>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="w-full h-full touch-none cursor-crosshair relative z-0"
                style={{ backgroundColor: '#F4EEDB' }}
            />

            {/* Top Toolbar: Colors */}
            <div className="absolute top-8 left-8 flex flex-col gap-3 z-20">
                {colors.map((c) => (
                    <button
                        key={c.value}
                        onClick={() => setBrushColor(c.value)}
                        className={`group flex items-center gap-3 p-2 rounded-2xl transition-all border ${brushColor === c.value ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                    >
                        <div className="w-8 h-8 rounded-xl shadow-inner border border-white/20" style={{ backgroundColor: c.value }} />
                        <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${brushColor === c.value ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100 text-white/40'}`}>
                            {c.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Bottom Toolbar: Actions */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-2xl p-4 rounded-[32px] border border-white/10 shadow-2xl z-20">
                <button
                    onClick={() => setSymmetryMode(!symmetryMode)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all ${symmetryMode ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-500'}`}
                >
                    <BoxSelect className="w-4 h-4" />
                    镜像：{symmetryMode ? '开启' : '关闭'}
                </button>

                <div className="w-[1px] h-8 bg-white/10 mx-1" />

                <button
                    onClick={clearCanvas}
                    className="p-3.5 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-2xl transition-all"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            <div className="absolute top-8 right-8 pointer-events-none z-20">
                <div className="flex items-center gap-3 px-6 py-2.5 bg-black/40 backdrop-blur-xl rounded-full border border-red-500/20 shadow-xl">
                    <Paintbrush className={`w-4 h-4 text-red-500 ${isDrawing ? 'animate-bounce' : ''}`} />
                    <span className="text-[11px] text-red-200 font-black uppercase tracking-[0.2em]">
                        {isDrawing ? '数字秦风构造中...' : '在马勺轮廓内绘制设计'}
                    </span>
                </div>
            </div>

            {!isInitialized && (
                <div className="absolute inset-0 bg-slate-950 flex items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-red-500/10 border-t-red-500 rounded-full animate-spin" />
                        <p className="text-red-500/60 font-black text-[10px] uppercase tracking-[0.5em]">臉譜核心系統導入中...</p>
                    </div>
                </div>
            )}
        </div>
    );
};