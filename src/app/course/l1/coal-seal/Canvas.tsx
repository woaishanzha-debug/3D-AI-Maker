'use client';

import React, { useEffect, useRef, useState } from 'react';
import paper from 'paper/dist/paper-core';

interface CoalSealCanvasProps {
    text: string;
}

export default function CoalSealCanvas({ text }: CoalSealCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<string>('Initializing...');
    const textRef = useRef(text);

    useEffect(() => {
        textRef.current = text;
    }, [text]);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize Paper.js
        paper.setup(canvasRef.current);
        const center = paper.view.center;

        const polyGroup = new paper.Group();

        const drawNet = async () => {
            if (!paper.project) return;
            polyGroup.removeChildren();

            const faceSize = 80;
            const faces = [];

            // Draw a basic cross net for a cube (simplification of polyhedron for coal seal)
            // Layout:
            //   [T]
            //[L][F][R][B]
            //   [D]
            const offsets = [
                { x: 0, y: -1, name: 'Top' },
                { x: -1, y: 0, name: 'Left' },
                { x: 0, y: 0, name: 'Front' },
                { x: 1, y: 0, name: 'Right' },
                { x: 2, y: 0, name: 'Back' },
                { x: 0, y: 1, name: 'Bottom' },
            ];

            setStatus('Drawing net...');
            for (const offset of offsets) {
                const centerPos = center.add(new paper.Point(offset.x * faceSize, offset.y * faceSize));
                const rect = new paper.Path.Rectangle({
                    center: centerPos,
                    size: [faceSize, faceSize],
                    strokeColor: '#3b82f6',
                    strokeWidth: 2,
                    fillColor: 'rgba(59, 130, 246, 0.1)',
                });

                faces.push(rect);

                // Add text to the 'Front' face as an example
                if (offset.name === 'Front' && textRef.current) {
                    setStatus('Generating text path...');
                    try {
                        const path = await textToPath(textRef.current, centerPos, faceSize);
                        if (path) {
                            // Subtraction logic to "engrave"
                            const engraved = rect.subtract(path);
                            engraved.strokeColor = new paper.Color('#3b82f6');
                            engraved.strokeWidth = 2;
                            engraved.fillColor = new paper.Color('rgba(59, 130, 246, 0.1)');
                            rect.remove();
                            path.remove();
                            polyGroup.addChild(engraved);
                        } else {
                            polyGroup.addChild(rect);
                        }
                    } catch (err) {
                        console.error('Error engraving text:', err);
                        polyGroup.addChild(rect);
                    }
                } else {
                    polyGroup.addChild(rect);
                }
            }

            setStatus('Render complete.');
        };

        const textToPath = async (t: string, pos: paper.Point, size: number) => {
            return new Promise<paper.PathItem | null>(async (resolve) => {
                let opentype: typeof import('opentype.js');
                try {
                    const ot = await import('opentype.js');
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    opentype = (ot as any).default || ot;
                } catch (e) {
                    console.error("Failed to load opentype.js", e);
                    return resolve(null);
                }

                opentype.load('/fonts/NotoSansSC-Black.ttf', (err: Error | null, font?: opentype.Font) => {
                    if (err || !font) {
                        console.error('Could not load font', err);
                        return resolve(null);
                    }

                    const fontSize = size * 0.6;

                    // Measure text to center it
                    const textWidth = font.getAdvanceWidth(t, fontSize);
                    // Center mathematically around `pos`
                    const x = pos.x - textWidth / 2;
                    // Approximate vertical centering (baseline adjustment)
                    const y = pos.y + fontSize * 0.35;

                    const path = font.getPath(t, x, y, fontSize);
                    const pathData = path.toPathData(2);

                    if (!pathData) return resolve(null);

                    // Create Paper.js Path from SVG data
                    const paperPath = new paper.CompoundPath(pathData);
                    paperPath.fillColor = new paper.Color('black');

                    resolve(paperPath);
                });
            });
        };

        drawNet();

        return () => {
            paper.project?.clear();
            paper.project?.remove();
        };
    }, [text]); // Re-run if text changes

    return (
        <div className="relative w-full h-full min-h-[500px] bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/80">
                {status}
            </div>
            <canvas ref={canvasRef} className="w-full h-full flex-1 touch-none"  />
        </div>
    );
}
