'use client';

import * as React from 'react';
import { useRef, useState } from 'react';
import { exportSvgTo3mf } from '@/lib/svgTo3mfConverter';
import { jsPDF } from 'jspdf';
import { Download, Grid, Layers, RefreshCw, Image as ImageIcon } from 'lucide-react';
import SongBrocadeCanvas, { SongBrocadeCanvasRef, TilingType, GeometryType } from './SongBrocadeCanvas';

export default function InteractionBoard() {
  const canvasRef = useRef<SongBrocadeCanvasRef>(null);

  const [showGrid, setShowGrid] = useState(true);
  const [tilingType, setTilingType] = useState<TilingType>('团花');
  const [geometry, setGeometry] = useState<GeometryType>('circle');
  const [isTiled, setIsTiled] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport3MF = async () => {
    if (!canvasRef.current) return;
    try {
      setIsExporting(true);
      const svgString = canvasRef.current.getExportSvg();
      if (!svgString) {
        alert("画布为空，无法导出");
        return;
      }

      await exportSvgTo3mf(svgString, {
        baseLayerId: 'Song_Grid_Base',
        baseDepth: 0.8,
        itemDepth: 1.8
      });
    } catch (error) {
      console.error("Export failed:", error);
      alert("导出失败，请检查控制台");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    if (!canvasRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = canvasRef.current.getExportDataUrl();
      if (!dataUrl) {
        alert("画布为空，无法导出");
        return;
      }

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();

      // Calculate aspect ratio
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfRatio = width / height;
      const imgRatio = imgProps.width / imgProps.height;

      let renderWidth = width;
      let renderHeight = height;

      if (imgRatio > pdfRatio) {
          renderHeight = width / imgRatio;
      } else {
          renderWidth = height * imgRatio;
      }

      const x = (width - renderWidth) / 2;
      const y = (height - renderHeight) / 2;

      pdf.text("Song Brocade Co-weaving Template", 10, 10);
      pdf.addImage(dataUrl, 'PNG', x, y, renderWidth, renderHeight);
      pdf.save("song-brocade-template.pdf");

    } catch (error) {
      console.error("Export failed:", error);
      alert("导出失败，请检查控制台");
    } finally {
      setIsExporting(false);
    }
  };

  const clearCanvas = () => {
    setIsTiled(false);
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-[#0a0a0a] text-slate-200 mt-16 overflow-hidden">
      {/* Tools Panel */}
      <div className="w-80 border-r border-slate-800 bg-[#111] p-6 flex flex-col gap-8 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-white mb-1">宋锦织造</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-6">Song Brocade Engine</p>

          <div className="space-y-6">
            {/* 理经 (Toggle Grid Lines) */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
              <div className="flex items-center gap-2 mb-3">
                <Grid className="w-4 h-4 text-blue-400" />
                <h3 className="font-medium text-sm text-slate-300">理经 (Grid Lines)</h3>
              </div>
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                  showGrid
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {showGrid ? '隐藏经纬线' : '显示经纬线'}
              </button>
            </div>

            {/* 团花/四达晕 (Tiling Type & Geometry) */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-purple-400" />
                <h3 className="font-medium text-sm text-slate-300">纹样选择 (Pattern)</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">平铺逻辑 (Tiling)</label>
                  <select
                    value={tilingType}
                    onChange={(e) => {
                      setTilingType(e.target.value as TilingType);
                      setIsTiled(false); // Reset on change
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-purple-500/50"
                  >
                    <option value="团花">团花 (Tuanhua - Medallion)</option>
                    <option value="四达晕">四达晕 (Sidayun - Four-way Radiating)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">基础几何 (Base Geometry)</label>
                  <select
                    value={geometry}
                    onChange={(e) => {
                      setGeometry(e.target.value as GeometryType);
                      setIsTiled(false); // Reset on change
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-purple-500/50"
                  >
                    <option value="circle">圆 (Circle)</option>
                    <option value="square">方 (Square)</option>
                    <option value="diamond">菱形 (Diamond)</option>
                    <option value="polygon">八角 (Octagon)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 翻花 (Symmetry/Tiling Action) */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className={`w-4 h-4 ${isTiled ? 'text-amber-400 animate-spin-slow' : 'text-amber-500/50'}`} />
                <h3 className="font-medium text-sm text-slate-300">翻花 (Symmetry Action)</h3>
              </div>
              <button
                onClick={() => setIsTiled(!isTiled)}
                className={`w-full py-3 rounded-lg text-sm font-bold tracking-widest transition-all ${
                  isTiled
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {isTiled ? '还原结构 (Undo Tile)' : '执行翻花 (Execute Tile)'}
              </button>
            </div>

            {/* 出锦 (Export) */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 mt-auto">
              <div className="flex items-center gap-2 mb-3">
                <Download className="w-4 h-4 text-emerald-400" />
                <h3 className="font-medium text-sm text-slate-300">出锦 (Export)</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExport3MF}
                  disabled={isExporting}
                  className="flex flex-col items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 py-2 rounded-lg text-xs font-medium text-slate-300 transition-colors border border-slate-700"
                >
                  <Layers className="w-4 h-4" />
                  <span>3MF Relief</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex flex-col items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 py-2 rounded-lg text-xs font-medium text-slate-300 transition-colors border border-slate-700"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Hi-Res PDF</span>
                </button>
              </div>
            </div>

            <button
              onClick={clearCanvas}
              className="w-full py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
            >
              清空画布 (Clear)
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-[#1a1a1a] relative flex items-center justify-center p-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}>
        </div>

        <div className="relative w-full h-full max-w-4xl max-h-4xl bg-white shadow-2xl shadow-black/50 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
          <SongBrocadeCanvas
            ref={canvasRef}
            showGrid={showGrid}
            tilingType={tilingType}
            geometry={geometry}
            isTiled={isTiled}
          />
        </div>
      </div>
    </div>
  );
}
