# Shadow Puppetry (Piying) Lesson Synchronization Sync

## 1. Current Working Features
- **Lesson Page (`src/app/course/l1/shadow-play/page.tsx`)**: Provides a 4-step wizard structure:
  - Phase 01: Intro (Cultural Tracing)
  - Phase 02: Interactive Courseware via `PresentationViewer` (Reads from `public/presentations/shadow-play/refined.json`).
  - Phase 03: Lab environment featuring the `SvgPuncher` component.
  - Phase 04: Success/Completion screen.
- **`SvgPuncher` Component (`src/components/SvgPuncher.tsx`)**: A fully functional Paper.js-based vector manipulation tool. Supports:
  - Uploading a source image component.
  - Interactive geometric shadow engine (Select, Cut, Joint, Hole, Erase).
  - Basic SVG direct download.

## 2. Unfinished/Broken Modules
- **3MF Export Integration**: `SvgPuncher.tsx` is currently completely isolated from the generic `exportSvgTo3mf` logic (`src/lib/svgTo3mfConverter.ts`). It only natively exports `.svg` using `paper.project.exportSVG()`.
- **Event Bus & State Management Missing**: There is no overarching event coordination between `SvgPuncher` and the global `event-bus.ts`. Specifically, there's no event dispatch when the user successfully finishes editing or triggers a 3MF export, which means the lesson cannot automatically detect success.
- **Z-Axis Separation for Puppetry**: The current `exportSvgTo3mf` utility (`src/lib/svgTo3mfConverter.ts`) is hardcoded with `Mashao_Base` and `Totem_${index}` logic. This generic utility might have to be extended or conditionally handled so that Shadow Puppetry components (which need precise joint layer separation for 3D printing) are correctly rendered into 3MF format, rather than being treated as Mashao masks.

## 3. Proposed Next Steps
- **Refactor `SvgPuncher.tsx`**: Replace the current `<button>` handling `DOWNLOAD (SVG)` with an async handler that calls `exportSvgTo3mf(svgString, baseDepth, totemDepth, 'shadow-puppet.3mf')`. Add `isProcessing` state for UI feedback during 3MF generation.
- **Update `svgTo3mfConverter.ts`**: Make the converter more generic. Adjust the hardcoded `Mashao_Base` checks so it can gracefully handle Shadow Puppet layers, specifically separating moving joints.
- **Event Bus Hookup**: Add a new dispatch in `SvgPuncher` that triggers `EVENTS.EXPORT_3MF_SUCCESS` (from `src/lib/event-bus.ts`) when the 3MF is built.
- **Auto-Advance in `page.tsx`**: Have the main lesson page listen to `EVENTS.EXPORT_3MF_SUCCESS`. Once triggered, the page should automatically set `step` to `3` (Mission Complete), removing the need for the manual "完成并进入下一环节" (Finish and go to next step) button.
