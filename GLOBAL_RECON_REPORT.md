# GLOBAL_RECON_REPORT

## 1. Current Architecture Bottlenecks

Based on the exploration of `src/app`, `src/components`, and `src/lib`, several architectural bottlenecks exist:

*   **Tight Coupling of Tools to Specific Lessons:** Utilities like `svgTo3mfConverter.ts` and `event-bus.ts` are heavily coupled to the 'Mashao' lesson. They contain hardcoded values (e.g., `Mashao_Base`, `Mashao_Project`, specific depths, and totem-related events) making them difficult to reuse for other courses or lessons.
*   **State Management Fragmentation:** State management is fragmented. While NextAuth handles authentication, the interaction between complex components (like the canvas and interaction boards in the Mashao lesson) relies on a custom global event bus (`src/lib/event-bus.ts`) using `window.dispatchEvent`. This approach is brittle, difficult to debug, and doesn't scale well for complex, multi-component interactions across different pages.
*   **Lack of Unified Global State:** There is no centralized global state management (like Zustand, Redux, or a comprehensive React Context setup) for managing application-wide data such as user preferences, current project state, or shared UI states (e.g., notifications, modals beyond simple boolean toggles).
*   **Component Monoliths:** Components like `MashaoCanvas` and `TotemInteractionBoard` contain complex logic mixed with UI rendering. For instance, `MashaoCanvas` handles complex Paper.js logic, event listening, and UI rendering in a single large file.

## 2. Extractable Shared Utilities

The following components and utilities should be refactored into generic platform modules:

*   **`src/lib/svgTo3mfConverter.ts`**:
    *   **Current State:** Hardcoded with 'Mashao' specific names and logic (e.g., distinguishing between 'Mashao_Base' and totems for depth calculations).
    *   **Refactoring Plan:** Make it a generic `exportSvgTo3mf` utility. Accept a configuration object instead of specific base/totem depths. The config could define layer names, their respective depths, and base z-positions.
*   **`src/lib/event-bus.ts`**:
    *   **Current State:** Defines events and payloads specific to 'Mashao' and 'Totem' (e.g., `TOTEM_INJECTED`, `ShapeId`).
    *   **Refactoring Plan:** Create a generic event bus or, preferably, transition to a state management library (like Zustand) for inter-component communication. If an event bus is kept, namespace events by tool/lesson rather than hardcoding specific lesson events in a global file.
*   **Canvas Integration (`MashaoCanvas.tsx`)**:
    *   **Current State:** Tightly integrates Paper.js drawing logic with specific Mashao shapes and rules.
    *   **Refactoring Plan:** Extract the core Paper.js setup, drawing tools (brush, symmetry), and SVG export functionality into a generic `CanvasEditor` component or a custom hook (e.g., `usePaperCanvas`). The specific shapes (double gourd, dipper) and boundary logic should be passed as configurations or plugins.
*   **3D Viewer (`Mashao3DViewer.tsx` - assumed based on usage)**:
    *   **Current State:** Likely tailored for viewing the Mashao output.
    *   **Refactoring Plan:** Generalize into a `Platform3DViewer` that accepts generic 3D objects or 3MF/STL files for rendering, decoupling it from the specific 'Mashao' context.

## 3. Recommendations for Unified Student Dashboard and Project State Persistence

To scale the L1-L3 PBL education platform, the following recommendations should be implemented:

*   **Unified Project State Management:**
    *   Introduce a robust state management solution like Zustand or Redux Toolkit.
    *   Create a global `projectStore` to manage the state of the student's current workspace. This store should handle the current tool being used, unsaved changes, and metadata about the project.
*   **Project State Persistence:**
    *   Implement auto-saving functionality. The `projectStore` should periodically sync its state to the backend database via an API route.
    *   Update the database schema (if not already present) to store generic project JSON data associated with a user and a specific course/lesson. This allows users to resume their work across sessions.
*   **Unified Student Dashboard (`src/app/dashboard/page.tsx`):**
    *   The current dashboard is functional but can be enhanced to show "Recent Projects" regardless of the course series.
    *   Aggregate project data from different lessons (L1, L2, L3) into a unified view. Allow students to click on a past project to load its state back into the respective tool editor.
    *   Standardize the data structure for projects so the dashboard can consistently display thumbnails, creation dates, and tool types.
*   **Standardized API Routes for Tools:**
    *   Create generic API routes (e.g., `/api/projects/[id]`) for CRUD operations on student projects, abstracting away the specific tool being used. The payload should include the `toolId` and the serialized `projectData`.
