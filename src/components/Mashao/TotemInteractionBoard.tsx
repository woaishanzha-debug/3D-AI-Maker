// 文件路径：src/components/Mashao/TotemInteractionBoard.tsx
"use client";

import { useState, useEffect } from 'react';
import { ElementType, TotemResult, calculateTotemScore } from '@/lib/totem-rules';
import { dispatchTotemEvent, EVENTS } from '@/lib/event-bus';
import { Sparkles, Trash2, Zap, ShieldCheck, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportSvgTo3mf } from '@/lib/svgTo3mfConverter';
import Mashao3DViewer from './Mashao3DViewer';

const ALL_ELEMENTS: ElementType[] = ['金', '木', '水', '火', '土', '风', '雷', '云'];
const MAX_SLOTS = 5;

export default function TotemInteractionBoard() {
  const [placedElements, setPlacedElements] = useState<ElementType[]>([]);
  const [result, setResult] = useState<TotemResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTool, setActiveTool] = useState<'drag' | 'draw'>('drag');
  const [shapeId, setShapeId] = useState<'double_gourd' | 'single_dipper'>('double_gourd');
  const [previewSvg, setPreviewSvg] = useState<string | null>(null);

  // 监听形状切换并派发事件
  useEffect(() => {
    const event = new CustomEvent(EVENTS.SHAPE_CHANGED, { detail: { shapeId } });
    window.dispatchEvent(event);
  }, [shapeId]);

  // 监听工具切换并派发事件
  useEffect(() => {
    const event = new CustomEvent(EVENTS.TOOL_CHANGED, { detail: { mode: activeTool } });
    window.dispatchEvent(event);
  }, [activeTool]);

  useEffect(() => {
    const handleSvgExported = (e: Event) => {
        const customEvent = e as CustomEvent<{ svgString: string, action: 'preview' | 'export' }>;
        const { svgString, action } = customEvent.detail;
        
        if (action === 'preview') {
            setPreviewSvg(svgString);
        } else if (action === 'export') {
            // 直接执行 3MF 导出
            exportSvgTo3mf(svgString, {
                baseLayerId: 'Mashao_Base',
                baseDepth: 2,
                itemDepth: 4,
                filename: 'mashao-totem.3mf',
                groupName: 'Mashao_Project'
            })
                .then(() => {
                    window.dispatchEvent(new CustomEvent(EVENTS.EXPORT_3MF_SUCCESS));
                })
                .catch(err => {
                    console.error("3MF Export Failed:", err);
                    alert("3MF 文件构建失败");
                });
        }
    };

    window.addEventListener(EVENTS.SVG_EXPORTED, handleSvgExported);
    return () => window.removeEventListener(EVENTS.SVG_EXPORTED, handleSvgExported);
  }, []);

  const handleAddElement = (element: ElementType) => {
    if (placedElements.length >= MAX_SLOTS) {
      alert(`马勺空间有限，最多只能承载 ${MAX_SLOTS} 种图腾之力！`);
      return;
    }
    setPlacedElements(prev => [...prev, element]);
    setResult(null);
    
    // 核心修改：立刻通知画布在中心生成这个图腾，供用户拖拽
    const event = new CustomEvent(EVENTS.TOTEM_ADD, { detail: { element } });
    window.dispatchEvent(event);
  };

  const handleRemoveElement = (index: number) => {
    setPlacedElements(prev => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleCalculate = () => {
    if (placedElements.length === 0) return;
    
    setIsCalculating(true);
    
    // Simulate a bit of "calculation" for dramatic effect
    setTimeout(() => {
        const finalResult = calculateTotemScore(placedElements);
        setResult(finalResult);
        setIsCalculating(false);
    }, 800);
  };

  const handlePreview3D = () => {
    // 异步请求画布当前的 SVG 数据
    window.dispatchEvent(new CustomEvent(EVENTS.REQUEST_SVG, { detail: { action: 'preview' } }));
  };

  const handleExport3MF = () => {
    // 异步请求画布当前的 SVG 数据进行导出
    window.dispatchEvent(new CustomEvent(EVENTS.REQUEST_SVG, { detail: { action: 'export' } }));
  };

  const rankColors = {
    'R': 'text-slate-400 border-slate-400 bg-slate-400/10',
    'SR': 'text-blue-400 border-blue-400 bg-blue-400/10',
    'SSR': 'text-amber-400 border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.3)]',
    'SP': 'text-red-500 border-red-500 bg-red-500/10 shadow-[0_0_25px_rgba(239,68,68,0.5)] animate-pulse',
  };

  return (
    <div className="w-full bg-[#0a0a0b]/80 backdrop-blur-3xl p-8 rounded-[40px] border border-white/10 shadow-3xl text-white">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center border border-red-500/30">
            <Sparkles className="w-6 h-6 text-red-500" />
        </div>
        <div>
            <h3 className="text-xl font-black uppercase tracking-widest text-white">精神图腾注入</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Spirit Totem Injection System</p>
        </div>
      </div>
      
      {/* 控制栏区 */}
      <div className="mb-6 space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">1. 选择底板形状：</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setShapeId('double_gourd')} 
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${shapeId === 'double_gourd' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'bg-white/5 text-white/40 border border-white/5'}`}
            >
              双肚葫芦
            </button>
            <button 
              onClick={() => setShapeId('single_dipper')} 
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${shapeId === 'single_dipper' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'bg-white/5 text-white/40 border border-white/5'}`}
            >
              单肚瓢形
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">2. 鼠标模式：</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTool('drag')} 
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${activeTool === 'drag' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-white/5 text-white/40 border border-white/5'}`}
            >
              ✋ 挪动图腾
            </button>
            <button 
              onClick={() => setActiveTool('draw')} 
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${activeTool === 'draw' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-white/5 text-white/40 border border-white/5'}`}
            >
              🖌️ 实体画笔
            </button>
          </div>
        </div>
      </div>
      
      {/* 元素选择区 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">选择自然图腾</span>
            <span className="text-[10px] font-black text-red-500/60">{placedElements.length} / {MAX_SLOTS}</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {ALL_ELEMENTS.map(el => (
            <button 
              key={`btn-${el}`}
              onClick={() => handleAddElement(el)}
              disabled={placedElements.length >= MAX_SLOTS}
              className="group relative h-14 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500/40 hover:bg-red-500/10 transition-all active:scale-95 disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:border-white/5"
            >
              <span className="text-lg font-black text-white/80 group-hover:text-red-500 transition-colors uppercase">{el}</span>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
            </button>
          ))}
        </div>
      </div>

      {/* 已放置的元素槽位 */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-red-500/5 rounded-3xl -m-1" />
        <div className="relative min-h-[80px] p-4 bg-black/40 rounded-3xl border border-white/5 flex flex-wrap gap-3 items-center justify-center">
            <AnimatePresence>
                {placedElements.length === 0 ? (
                    <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/20 text-[10px] uppercase font-black tracking-widest"
                    >
                        等待注入原初之力...
                    </motion.span>
                ) : (
                    placedElements.map((el, idx) => (
                        <motion.button 
                            key={`slot-${idx}-${el}`}
                            initial={{ scale: 0, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.1 }}
                            onClick={() => handleRemoveElement(idx)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-600 text-white font-black shadow-lg shadow-red-900/20 group relative overflow-hidden"
                        >
                            <span className="relative z-10">{el}</span>
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity" />
                            <Trash2 className="absolute z-20 opacity-0 group-hover:opacity-100 w-3 h-3 transition-opacity" />
                        </motion.button>
                    ))
                )}
            </AnimatePresence>
        </div>
      </div>

      {/* 触发器 */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={handleCalculate}
          disabled={placedElements.length === 0 || isCalculating}
          className="group relative w-full h-16 bg-red-600 hover:bg-red-500 disabled:bg-white/5 disabled:text-white/20 text-white font-black rounded-2xl shadow-xl shadow-red-900/40 transition-all active:scale-[0.98] overflow-hidden"
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
              {isCalculating ? (
                  <Zap className="w-5 h-5 animate-spin" />
              ) : (
                  <>
                      <Zap className="w-5 h-5" />
                      <span className="uppercase tracking-[0.2em] text-sm italic">生成图腾判定</span>
                  </>
              )}
          </div>
          {!isCalculating && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
          )}
        </button>

        {result && (
          <div className="mt-4 flex flex-col gap-3">
             {/* 3D 预览按钮 - 保留以便学生查看效果 */}
            <button 
              onClick={handlePreview3D}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-5 h-5 text-blue-400" />
              👁️ 开启 3D 实体预览
            </button>
            {/* 这是一个仅触发 3MF 下载的专属按钮 */}
            <button 
              onClick={handleExport3MF}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              导出实物打印文件 (.3MF)
            </button>
          </div>
        )}
      </div>

      {/* 结算反馈面板 */}
      <AnimatePresence>
        {result && !isCalculating && (
            <motion.div 
                initial={{ opacity: 0, height: 0, y: 20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-10 pt-10 border-t border-white/10"
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">最终灵力评等</p>
                        <h4 className="text-xl font-black text-white italic">SPIRIT RANK</h4>
                    </div>
                    <div className={`text-4xl font-black italic border-b-4 px-4 py-1 rounded-sm ${rankColors[result.rank as keyof typeof rankColors]}`}>
                        {result.rank}
                    </div>
                </div>

                <div className="relative mb-8 p-6 bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <ShieldCheck className="w-16 h-16" />
                    </div>
                    <div className="relative z-10 flex items-baseline gap-2">
                        <span className="text-5xl font-black tracking-tighter text-white tabular-nums">{result.score}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">灵力点数</span>
                    </div>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {result.logs.map((log, idx) => (
                    <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`text-[9px] font-bold p-3 rounded-xl border ${log.includes('✅') ? 'bg-green-500/5 border-green-500/20 text-green-400' : log.includes('❌') ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10 text-white/60'}`}
                    >
                        {log}
                    </motion.div>
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 3D 预览弹窗 */}
      {previewSvg && (
        <Mashao3DViewer 
          svgString={previewSvg} 
          onClose={() => setPreviewSvg(null)} 
        />
      )}
    </div>
  );
}
