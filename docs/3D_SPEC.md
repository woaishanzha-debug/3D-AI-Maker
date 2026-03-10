# 3D Logic Specification

This document records the 3D rendering conventions and logic used in the `3d-ai-maker.tech` project.

## Core Libraries
- **Three.js**: Version `0.183.2`.
- **Canvas Management**: Managed through React `useRef` to prevent re-renders.
- **OrbitControls**: Standard for user interaction.

## Coordinate System
- **Unit**: 1 unit = 1mm (matching 3D printing industry standards).
- **Axis Layout**:
    - **X-Y Plane**: The base plate of the model.
    - **Z-Axis**: Height/Thickness of the model (positive Z is "up" from the bed).
    - **Origin (0,0,0)**: Typically at the center of the base plate's bottom face.
- **Camera Orientation**:
    - Default Position: `(0, -120, 150)` (Looking down from an angle).

## Rendering Performance & Cleanup
- Use `useMemo` for heavy geometry generation if possible.
- **CRITICAL**: Always call `renderer.dispose()` and `scene.remove(mesh)` in the React `useEffect` cleanup function to prevent WebGL context leaks.
- Use `logarithmicDepthBuffer` for cleaner rendering of thin, overlapping layers.

## Geometry and Export
- **STL Export**: Custom binary STL generator for high efficiency (see `QRCodeTool.tsx`).
- **Buffers**: Prefer `BufferGeometry` for custom-built meshes.
