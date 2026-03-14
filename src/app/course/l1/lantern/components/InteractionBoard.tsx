import React from 'react';
import { Layers, Brush, Stamp, Eraser, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ShapeOption = '4-sided' | '6-sided';
export type LanternTool = '定型' | '扎骨' | '贴花' | '清灰' | '出灯';

interface InteractionBoardProps {
  currentTool: LanternTool;
  setCurrentTool: (tool: LanternTool) => void;
  shapeOption: ShapeOption;
  setShapeOption: (option: ShapeOption) => void;
  onExport: () => void;
  onClear: () => void;
}

export const InteractionBoard: React.FC<InteractionBoardProps> = ({
  currentTool,
  setCurrentTool,
  shapeOption,
  setShapeOption,
  onExport,
  onClear
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 glass-panel rounded-xl h-full shadow-lg border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <Layers className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">制作工具</h3>
      </div>

      <div className="space-y-4 flex-1">
        {/* 定型 (Shape Selection) */}
        <div className="space-y-2">
          <Button
            variant={currentTool === '定型' ? 'default' : 'outline'}
            className="w-full justify-start text-left"
            onClick={() => setCurrentTool('定型')}
          >
            <Layers className="w-4 h-4 mr-2" />
            定型 (Shape)
          </Button>

          {currentTool === '定型' && (
            <div className="flex gap-2 pl-4">
              <Button
                variant={shapeOption === '4-sided' ? 'secondary' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setShapeOption('4-sided')}
              >
                四面灯 (4-sided)
              </Button>
              <Button
                variant={shapeOption === '6-sided' ? 'secondary' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setShapeOption('6-sided')}
              >
                六面灯 (6-sided)
              </Button>
            </div>
          )}
        </div>

        {/* 扎骨 (Lattice Brush) */}
        <Button
          variant={currentTool === '扎骨' ? 'default' : 'outline'}
          className="w-full justify-start text-left"
          onClick={() => setCurrentTool('扎骨')}
        >
          <Brush className="w-4 h-4 mr-2" />
          扎骨 (Lattice)
        </Button>

        {/* 贴花 (Stamp) */}
        <Button
          variant={currentTool === '贴花' ? 'default' : 'outline'}
          className="w-full justify-start text-left"
          onClick={() => setCurrentTool('贴花')}
        >
          <Stamp className="w-4 h-4 mr-2" />
          贴花 (Stamp)
        </Button>
      </div>

      <div className="pt-4 border-t border-border mt-auto space-y-2">
        {/* 清灰 (Clear) */}
        <Button
          variant="destructive"
          className="w-full justify-start text-left"
          onClick={() => {
            setCurrentTool('清灰');
            onClear();
          }}
        >
          <Eraser className="w-4 h-4 mr-2" />
          清灰 (Clear)
        </Button>

        {/* 出灯 (Export) */}
        <Button
          variant="default"
          className="w-full justify-start text-left bg-green-600 hover:bg-green-700"
          onClick={() => {
            setCurrentTool('出灯');
            onExport();
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          出灯 (Export 3MF)
        </Button>
      </div>
    </div>
  );
};
