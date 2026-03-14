// 文件路径：src/lib/event-bus.ts
import { ElementType, TotemResult } from './totem-rules';

// 定义事件名称常量
export const EVENTS = {
  TOTEM_INJECTED: 'totem:injected',
  CLEAR_CANVAS: 'canvas:clear',
  REQUEST_SVG: 'canvas:request_svg',
  SVG_EXPORTED: 'canvas:svg_exported',
  SHAPE_CHANGED: 'shape:changed',   // 新增：切换底板形状
  TOOL_CHANGED: 'tool:changed',     // 新增：切换鼠标工具 (拖拽 vs 画笔)
  TOTEM_ADD: 'totem:add',           // 新增：实时掉落单个图腾
  EXPORT_3MF_SUCCESS: 'export:3mf_success', // 新增：3MF 导出成功
} as const;

export type ShapeId = 'double_gourd' | 'single_dipper';
export type ToolMode = 'drag' | 'draw';

// 定义传递的负载数据结构
export interface TotemInjectedPayload {
  shapeId?: string; // Keep for backward compatibility if needed, but the new logic uses SHAPE_CHANGED
  elements: ElementType[];
  result: TotemResult;
}

// 封装类型安全的触发器
export const dispatchTotemEvent = (payload: TotemInjectedPayload) => {
  const event = new CustomEvent(EVENTS.TOTEM_INJECTED, { detail: payload });
  window.dispatchEvent(event);
};
