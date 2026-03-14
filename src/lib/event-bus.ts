// 文件路径：src/lib/event-bus.ts

/**
 * ============================================================================
 * TRANSITION PLAN TO 16-COURSE GENERIC STATE MANAGEMENT
 * ============================================================================
 *
 * 1. Current State:
 *    The event bus currently has specific events for the Mashao lesson (e.g.
 *    TOTEM_ADD, SHAPE_CHANGED) which are tightly coupled to the
 *    TotemInteractionBoard and MashaoCanvas components.
 *
 * 2. Target Architecture (For 16 Courses):
 *    - Phase out lesson-specific string constants like TOTEM_INJECTED.
 *    - Introduce a generic pub/sub system where events are scoped by course ID.
 *    - Use a generic action payload (e.g., `CourseActionPayload<T>`) rather
 *      than hardcoded typings like `TotemInjectedPayload` (which relies on
 *      `totem-rules.ts`).
 *    - Migrate cross-component communication to standardized generic actions:
 *        - `CANVAS_ACTION`: For course-agnostic operations (clear, save, undo).
 *        - `COMPONENT_MOUNT`: For initialization syncing.
 *        - `STATE_UPDATE`: For passing generic JSON configurations across the UI.
 *
 * 3. Migration Steps:
 *    - Step A: Adopt generic generic UI/Canvas events instead of lesson events.
 *    - Step B: Wrap event details in a `GenericCoursePayload` interface.
 *    - Step C: Update components (MashaoCanvas, etc.) to listen to standard
 *              events and filter based on course context or type.
 *    - Step D: Deprecate `dispatchTotemEvent` entirely.
 * ============================================================================
 */

import { ElementType, TotemResult } from './totem-rules';

// 定义事件名称常量 (Gradually moving to Generic equivalents)
export const EVENTS = {
  // Legacy Mashao Events (To be deprecated)
  TOTEM_INJECTED: 'totem:injected',
  TOTEM_ADD: 'totem:add',
  SHAPE_CHANGED: 'shape:changed',
  TOOL_CHANGED: 'tool:changed',

  // Generic Canvas/UI Events
  CLEAR_CANVAS: 'canvas:clear',
  REQUEST_SVG: 'canvas:request_svg',
  SVG_EXPORTED: 'canvas:svg_exported',
  EXPORT_3MF_SUCCESS: 'export:3mf_success',
} as const;

export type ShapeId = 'double_gourd' | 'single_dipper';
export type ToolMode = 'drag' | 'draw';

// Generic Payload Definition for future transitions
export interface GenericCoursePayload<T = unknown> {
  courseId: string;
  action: string;
  data: T;
}

// Legacy Data Structure (Kept for backwards compatibility with Mashao)
export interface TotemInjectedPayload {
  shapeId?: string;
  elements: ElementType[];
  result: TotemResult;
}

// Legacy Trigger (To be deprecated)
export const dispatchTotemEvent = (payload: TotemInjectedPayload) => {
  const event = new CustomEvent(EVENTS.TOTEM_INJECTED, { detail: payload });
  window.dispatchEvent(event);
};
