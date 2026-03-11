'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { STLExporter } from 'three-stdlib';
import { Download, Undo2, MousePointer2 } from 'lucide-react';

// 初始控制点 (x: 半径, y: 高度)
const INITIAL_POINTS = [
    { x: 40, y: 0 },
    { x: 60, y: 30 },
    { x: 80, y: 80 },
    { x: 50, y: 140 },
    { x: 30, y: 170 },
    { x: 40, y: 190 },
    { x: 45, y: 200 }
];

const PotteryLathe = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [points, setPoints] = useState(INITIAL_POINTS);
    const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
    const dragStateRef = useRef<{ startX: number; startY: number; startPointX: number; startPointY: number; } | null>(null);
    
    // Three.js refs
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const meshRef = useRef<THREE.Mesh | null>(null);

    // Initialize Three.js
    useEffect(() => {
        if (!containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color('#0f172a'); // slate-900

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 150, 400);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        rendererRef.current = renderer;
        containerRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.target.set(0, 100, 0);

        // 照明设置 - 模拟瓷器的光泽
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(200, 300, 200);
        scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.8);
        fillLight.position.set(-200, 100, -200);
        scene.add(fillLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
        backLight.position.set(0, 200, -300);
        scene.add(backLight);

        // 网格辅助线
        const gridHelper = new THREE.GridHelper(300, 30, 0x334155, 0x1e293b);
        scene.add(gridHelper);

        // 材质 - 青花瓷白胎质感
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xf8fafc,
            metalness: 0.1,
            roughness: 0.15,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
        meshRef.current = mesh;
        scene.add(mesh);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (containerRef.current && rendererRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
            }
            renderer.dispose();
            material.dispose();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update Geometry when points change
    useEffect(() => {
        if (!meshRef.current) return;

        // Create a spline from points
        const vectorPoints = points.map(p => new THREE.Vector2(p.x, p.y));
        const spline = new THREE.SplineCurve(vectorPoints);
        const smoothPoints = spline.getPoints(50); // 50 segments vertically
        
        // 封闭上下开口形成实体（以便3D打印软件作为Solid识别）
        smoothPoints.unshift(new THREE.Vector2(0, points[0].y));
        smoothPoints.push(new THREE.Vector2(0, points[points.length-1].y));

        const geometry = new THREE.LatheGeometry(smoothPoints, 64); // 64 radial segments
        geometry.computeVertexNormals();

        if (meshRef.current.geometry) meshRef.current.geometry.dispose();
        meshRef.current.geometry = geometry;
    }, [points]);

    const handleSvgPointerDown = (e: React.PointerEvent<SVGCircleElement>, idx: number) => {
        e.stopPropagation();
        e.preventDefault();
        
        const svg = e.currentTarget.ownerSVGElement;
        if (!svg) return;
        
        // 使用原生 SVG 矩阵将屏幕坐标转换为 viewBox 内的精确坐标
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        
        const svgP = pt.matrixTransform(ctm.inverse());
        
        dragStateRef.current = {
            startX: svgP.x,
            startY: svgP.y,
            startPointX: points[idx].x,
            startPointY: points[idx].y
        };
        
        e.currentTarget.setPointerCapture(e.pointerId);
        setDraggingIdx(idx);
    };

    const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
        if (draggingIdx === null || !dragStateRef.current) return;
        
        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        
        const svgP = pt.matrixTransform(ctm.inverse());
        const startX = dragStateRef.current.startX;
        const startY = dragStateRef.current.startY;
        const startPointX = dragStateRef.current.startPointX;
        const startPointY = dragStateRef.current.startPointY;
        
        const deltaX = svgP.x - startX;
        const deltaY = -(svgP.y - startY); // SVG 的 Y 轴朝下，物理现实朝上

        setPoints(prev => prev.map((p, i) => {
            if (i === draggingIdx) {
                const newX = startPointX + deltaX;
                let newY = p.y;
                
                // 允许除底座(i=0)以外的点上下移动，并限制在上下相邻点之间，防止模型交叉打结
                if (i > 0) {
                    const rawY = startPointY + deltaY;
                    const minY = prev[i - 1].y + 5;
                    const maxY = i < prev.length - 1 ? prev[i + 1].y - 5 : 250;
                    newY = Math.max(minY, Math.min(rawY, maxY));
                }

                return { ...p, x: Math.max(10, Math.min(newX, 140)), y: newY };
            }
            return p;
        }));
    };

    const handleSvgPointerUp = (e: React.PointerEvent<SVGSVGElement | SVGCircleElement>) => {
        setDraggingIdx(null);
        dragStateRef.current = null;
        if ('releasePointerCapture' in e.currentTarget && e.pointerId) {
            try {
                e.currentTarget.releasePointerCapture(e.pointerId);
            } catch (err) {}
        }
    };

    const exportSTL = () => {
        if (!sceneRef.current || !meshRef.current) return;
        
        // 单独把 Mesh 放入新 Scene 导出，避免导出网格等杂物
        const exportScene = new THREE.Scene();
        exportScene.add(meshRef.current.clone());

        const exporter = new STLExporter();
        const stlString = exporter.parse(exportScene);
        
        const blob = new Blob([stlString], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'porcelain_vase.stl';
        link.click();
        URL.revokeObjectURL(url);
    };

    // Calculate SVG Path for the curve preview
    const svgHeight = 250;
    const pathD = `M ${points[0].x} ${svgHeight - points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${svgHeight - p.y}`).join(' ');

    const polygonD = `M 0 ${svgHeight} L ${points[0].x} ${svgHeight} ` + points.slice(1).map(p => `L ${p.x} ${svgHeight - p.y}`).join(' ') + ` L 0 ${svgHeight - points[points.length-1].y} Z`;

    return (
        <div className="w-full h-[600px] flex flex-col md:flex-row gap-6 bg-slate-800/50 p-6 rounded-[40px] border border-white/5 shadow-2xl relative">
            {/* Left Box: 2D Editor */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div className="bg-slate-900 rounded-3xl p-6 flex-1 border border-white/10 relative overflow-hidden flex flex-col shadow-inner shadow-black/50">
                    <div className="flex items-center gap-2 mb-4 text-sm font-black italic tracking-widest text-slate-300">
                        <MousePointer2 className="w-4 h-4 text-blue-500" />
                        二维轮廓设计 / PROFILE
                    </div>
                    
                    <div className="flex-1 relative w-full flex items-center justify-center bg-slate-950 rounded-2xl border border-white/5 select-none">
                        <svg 
                            viewBox="0 0 150 250" 
                            className="w-full h-full max-h-[450px] touch-none"
                            onPointerMove={handleSvgPointerMove}
                            onPointerUp={handleSvgPointerUp}
                            onPointerLeave={handleSvgPointerUp}
                        >
                            {/* Grid lines */}
                            <line x1="0" y1="0" x2="0" y2="250" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                            <line x1="50" y1="0" x2="50" y2="250" stroke="#1e293b" strokeWidth="1" />
                            <line x1="100" y1="0" x2="100" y2="250" stroke="#1e293b" strokeWidth="1" />
                            
                            {/* Fill for half profile */}
                            <path 
                                d={polygonD}
                                fill="url(#blue-gradient)" 
                                opacity="0.3" 
                            />

                            {/* Curve profile */}
                            <path 
                                d={pathD} 
                                fill="none" 
                                stroke="#3b82f6" 
                                strokeWidth="3" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                            />

                            {/* Control Points */}
                            {points.map((p, idx) => (
                                <g key={idx} transform={`translate(${p.x}, ${svgHeight - p.y})`}>
                                    <circle 
                                        r={draggingIdx === idx ? "12" : "8"}
                                        fill={draggingIdx === idx ? "#60a5fa" : "#fff"}
                                        stroke="#2563eb"
                                        strokeWidth="3"
                                        className="cursor-move transition-all duration-200"
                                        onPointerDown={(e) => {
                                            e.stopPropagation();
                                            handleSvgPointerDown(e, idx);
                                        }}
                                        onPointerEnter={(e) => {
                                            if (draggingIdx === null) {
                                                e.currentTarget.setAttribute("r", "10");
                                            }
                                        }}
                                        onPointerLeave={(e) => {
                                            if (draggingIdx !== idx) {
                                                e.currentTarget.setAttribute("r", "8");
                                            }
                                        }}
                                    />
                                    {/* 辅助线 */}
                                    <line x1={-p.x} y1="0" x2="0" y2="0" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" className="pointer-events-none" />
                                </g>
                            ))}
                            
                            <defs>
                                <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#1e3a8a" />
                                    <stop offset="100%" stopColor="#3b82f6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <button 
                        onClick={() => setPoints(INITIAL_POINTS)}
                        className="mt-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-white/5"
                    >
                        <Undo2 className="w-4 h-4" /> 恢复标准器型
                    </button>
                </div>
            </div>

            {/* Right Box: 3D Preview */}
            <div className="w-full md:w-2/3 relative rounded-3xl overflow-hidden border border-white/10 shadow-inner group bg-slate-900 flex items-center justify-center">
                <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-move" />
                
                {/* Overlay actions */}
                <div className="absolute top-6 right-6 flex gap-2">
                    <button 
                        onClick={exportSTL}
                        className="px-6 py-3 bg-white text-blue-600 rounded-2xl font-black text-sm flex items-center gap-2 shadow-2xl transition-all hover:scale-105 active:scale-95"
                    >
                        <Download className="w-5 h-5" /> 烧制并导出 STL
                    </button>
                </div>
                
                <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-mono text-white/50 border border-white/10 tracking-widest uppercase pointer-events-none">
                    3D PREVIEW | 左键旋转 | 右键平移 | 滚轮缩放
                </div>
            </div>
        </div>
    );
};

export default PotteryLathe;
