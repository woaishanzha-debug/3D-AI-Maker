'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Settings, Play, Info, Lightbulb, Box, Rotate3d, Download, Type, Link as LinkIcon, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import QRCode from 'qrcode';

interface QRCodeSettings {
    text: string;
    size: number;
    baseThickness: number;
    contentThickness: number;
    margin: number;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export default function QRCodeTool() {
    const [settings, setSettings] = useState<QRCodeSettings>({
        text: 'https://3-d-ai-maker.vercel.app',
        size: 80,
        baseThickness: 2.0,
        contentThickness: 1.5,
        margin: 2,
        errorCorrectionLevel: 'M',
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stlBuffer, setStlBuffer] = useState<ArrayBuffer | null>(null);
    const [error, setError] = useState<string | null>(null);

    const previewRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        controls: OrbitControls;
        mesh?: THREE.Mesh;
    } | null>(null);

    // Initialize Three.js scene
    useEffect(() => {
        if (!previewRef.current) return;

        const container = previewRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050505);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
        camera.position.set(0, -120, 150);

        const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(50, 50, 100);
        scene.add(dirLight);

        const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
        rimLight.position.set(-50, -50, 20);
        scene.add(rimLight);

        sceneRef.current = { scene, camera, renderer, controls };

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    const generateSTL = useCallback(async () => {
        if (!settings.text.trim()) {
            setError("请输入二维码内容");
            return;
        }
        setError(null);
        setIsGenerating(true);
        setProgress(10);

        try {
            // 1. Generate QR Code Matrix
            const qr = QRCode.create(settings.text, { errorCorrectionLevel: settings.errorCorrectionLevel });
            const modules = qr.modules;
            const count = modules.size;
            const data = modules.data;

            setProgress(30);

            // 2. Build Geometry
            const { size, baseThickness, contentThickness, margin } = settings;
            const cellSize = (size - 2 * margin) / count;
            const totalWidth = size;
            const totalHeight = size;
            const centerX = totalWidth / 2;
            const centerY = totalHeight / 2;

            const vertices: number[] = [];
            const indices: number[] = [];
            let vertexOffset = 0;

            const addBox = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
                // Front
                vertices.push(x1, y1, z2, x2, y1, z2, x2, y2, z2, x1, y2, z2);
                indices.push(vertexOffset, vertexOffset + 1, vertexOffset + 2, vertexOffset, vertexOffset + 2, vertexOffset + 3);
                vertexOffset += 4;
                // Back
                vertices.push(x1, y1, z1, x1, y2, z1, x2, y2, z1, x2, y1, z1);
                indices.push(vertexOffset, vertexOffset + 1, vertexOffset + 2, vertexOffset, vertexOffset + 2, vertexOffset + 3);
                vertexOffset += 4;
                // Top
                vertices.push(x1, y2, z1, x1, y2, z2, x2, y2, z2, x2, y2, z1);
                indices.push(vertexOffset, vertexOffset + 1, vertexOffset + 2, vertexOffset, vertexOffset + 2, vertexOffset + 3);
                vertexOffset += 4;
                // Bottom
                vertices.push(x1, y1, z1, x2, y1, z1, x2, y1, z2, x1, y1, z2);
                indices.push(vertexOffset, vertexOffset + 1, vertexOffset + 2, vertexOffset, vertexOffset + 2, vertexOffset + 3);
                vertexOffset += 4;
                // Right
                vertices.push(x2, y1, z1, x2, y2, z1, x2, y2, z2, x2, y1, z2);
                indices.push(vertexOffset, vertexOffset + 1, vertexOffset + 2, vertexOffset, vertexOffset + 2, vertexOffset + 3);
                vertexOffset += 4;
                // Left
                vertices.push(x1, y1, z1, x1, y1, z2, x1, y2, z2, x1, y2, z1);
                indices.push(vertexOffset, vertexOffset + 1, vertexOffset + 2, vertexOffset, vertexOffset + 2, vertexOffset + 3);
                vertexOffset += 4;
            };

            // Add Base Plate
            addBox(-centerX, -centerY, 0, centerX, centerY, baseThickness);

            setProgress(50);

            // Add QR Modules
            for (let r = 0; r < count; r++) {
                for (let c = 0; c < count; c++) {
                    if (data[r * count + c]) {
                        const x1 = margin + c * cellSize - centerX;
                        const y1 = margin + (count - 1 - r) * cellSize - centerY; // Invert Y for correct orientation
                        const x2 = x1 + cellSize;
                        const y2 = y1 + cellSize;
                        addBox(x1, y1, baseThickness, x2, y2, baseThickness + contentThickness);
                    }
                }
                if (r % 5 === 0) setProgress(50 + (r / count) * 30);
            }

            setProgress(85);

            // 3. Update Three.js Preview
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setIndex(indices);
            geometry.computeVertexNormals();

            if (sceneRef.current?.mesh) {
                sceneRef.current.scene.remove(sceneRef.current.mesh);
                sceneRef.current.mesh.geometry.dispose();
                (sceneRef.current.mesh.material as THREE.Material).dispose();
            }

            const material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.7,
                metalness: 0.2,
            });
            const mesh = new THREE.Mesh(geometry, material);
            sceneRef.current?.scene.add(mesh);
            if (sceneRef.current) sceneRef.current.mesh = mesh;

            // 4. Generate Binary STL
            const triangleCount = indices.length / 3;
            const buffer = new ArrayBuffer(84 + triangleCount * 50);
            const dataView = new DataView(buffer);

            // Header
            for (let i = 0; i < 80; i++) dataView.setUint8(i, 0);
            dataView.setUint32(80, triangleCount, true);

            let offset = 84;
            const writeVector = (x: number, y: number, z: number) => {
                dataView.setFloat32(offset, x, true); offset += 4;
                dataView.setFloat32(offset, y, true); offset += 4;
                dataView.setFloat32(offset, z, true); offset += 4;
            };

            for (let i = 0; i < indices.length; i += 3) {
                writeVector(0, 0, 0); // Normal
                for (let j = 0; j < 3; j++) {
                    const vIdx = indices[i + j];
                    writeVector(vertices[vIdx * 3], vertices[vIdx * 3 + 1], vertices[vIdx * 3 + 2]);
                }
                dataView.setUint16(offset, 0, true);
                offset += 2;
            }

            setStlBuffer(buffer);
            setProgress(100);
            setIsGenerating(false);
        } catch (err) {
            console.error("QR Generation failed", err);
            setError("生成失败: " + (err instanceof Error ? err.message : "未知错误"));
            setIsGenerating(false);
        }
    }, [settings]);

    const downloadSTL = async () => {
        if (!stlBuffer) return;

        try {
            // 记录使用日志并扣费
            const resp = await fetch('/api/tools/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toolType: '3d-qrcode', creditCost: 20 })
            });

            if (!resp.ok) {
                const data = await resp.json();
                setError(data.error || "下载失败");
                return;
            }

            const blob = new Blob([stlBuffer], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `3d_qrcode_${Date.now()}.stl`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
            setError("系统异常，请稍后再试");
        }
    };

    return (
        <div className="space-y-8">
            <div className="glass-panel-deep p-6 relative overflow-hidden border-l-4 border-primary">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-primary mb-1">老师寄语</h3>
                        <p className="text-foreground/80 leading-relaxed italic text-sm">
                            “扫一扫这个立体方块，就能打开你的个人主页！传统的二维码是印在纸上的，但我们将它升级为 3D 版。这是实体世界通往数字世界的‘传送门’。”
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="glass-panel p-6 space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/5 pb-4">
                            <Settings className="w-5 h-5 text-primary" /> 制作参数
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-3">1. 二维码内容</label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 text-white/30">
                                        {settings.text.startsWith('http') ? <LinkIcon size={18} /> : <Type size={18} />}
                                    </div>
                                    <textarea
                                        value={settings.text}
                                        onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                                        placeholder="输入网址、姓名或任何文字..."
                                        className="w-full h-24 bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm focus:border-primary/50 outline-none transition-all resize-none"
                                    />
                                </div>
                                {error && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                                        <AlertCircle size={14} />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex justify-between items-end">
                                    <label className="text-xs text-white/40 uppercase font-bold">边长尺寸 (mm)</label>
                                    <span className="text-primary font-mono text-sm">{settings.size}</span>
                                </div>
                                <input
                                    type="range" min="30" max="150" step="5"
                                    value={settings.size}
                                    onChange={(e) => setSettings({ ...settings, size: Number(e.target.value) })}
                                    className="w-full accent-primary"
                                />

                                <div className="flex justify-between items-end">
                                    <label className="text-xs text-white/40 uppercase font-bold">二维码高度 (mm)</label>
                                    <span className="text-primary font-mono text-sm">{settings.contentThickness}</span>
                                </div>
                                <input
                                    type="range" min="0.5" max="5.0" step="0.1"
                                    value={settings.contentThickness}
                                    onChange={(e) => setSettings({ ...settings, contentThickness: Number(e.target.value) })}
                                    className="w-full accent-primary"
                                />

                                <div className="flex justify-between items-end">
                                    <label className="text-xs text-white/40 uppercase font-bold">容错率 (ECC)</label>
                                    <span className="text-primary font-mono text-sm">{settings.errorCorrectionLevel}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['L', 'M', 'Q', 'H'] as const).map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setSettings({ ...settings, errorCorrectionLevel: level })}
                                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${settings.errorCorrectionLevel === level
                                                ? 'bg-primary/20 border-primary text-primary'
                                                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {isGenerating ? (
                            <div className="space-y-3">
                                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_#38bdf8]"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p className="text-center text-xs text-white/40">正在构建 3D 编码阵列... {Math.round(progress)}%</p>
                            </div>
                        ) : (
                            <button
                                onClick={generateSTL}
                                className="w-full py-4 rounded-xl bg-primary text-black font-bold hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all flex justify-center items-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-current" /> 实时预览
                            </button>
                        )}

                        {stlBuffer && !isGenerating && (
                            <button
                                onClick={downloadSTL}
                                className="w-full py-4 rounded-xl bg-white/5 border border-primary/30 text-primary font-bold hover:bg-primary/10 transition-all flex justify-center items-center gap-2"
                            >
                                <Download className="w-4 h-4" /> 导出 STL 文件
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-6">
                    <div className="glass-panel overflow-hidden relative min-h-[500px] flex flex-col">
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                            <Rotate3d className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">3D Real-time Preview</span>
                        </div>

                        <div ref={previewRef} className="flex-1 w-full bg-[#0a0a0a]" />

                        {!stlBuffer && !isGenerating && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
                                <Box className="w-16 h-16 text-white/5 mb-4 animate-pulse" />
                                <p className="text-white/20 text-sm font-medium">配置参数后点击“实时预览”</p>
                                <p className="text-white/10 text-[10px] mt-2 max-w-xs">提示：复杂的文本会导致二维码格子更细小</p>
                            </div>
                        )}
                    </div>

                    <div className="glass-panel p-8 bg-gradient-to-br from-white/[0.02] to-transparent">
                        <div className="flex items-center gap-3 mb-8 text-xl font-bold">
                            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                                <Info className="w-6 h-6 text-secondary" />
                            </div>
                            <span>原理科普：二维码如何 3D 化？</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-black/40">
                                <Image
                                    src="/illustrations/qrcode_principle.png"
                                    alt="QR Code 3D Principle"
                                    fill
                                    className="object-contain p-2"
                                />
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="font-bold text-secondary flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                                        从平面到浮雕
                                    </h4>
                                    <p className="text-sm text-white/50 leading-relaxed">
                                        二维码由黑白两种色块组成。我们将**黑色色块**拉伸为凸起的 3D 立方体，而**白色色块**保留在低位。
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-primary flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                        实体识别逻辑
                                    </h4>
                                    <p className="text-sm text-white/50 leading-relaxed">
                                        3D 打印出来的二维码通过表面的高低落差产生阴影对比。手机摄像头捕捉到这些阴影，就能像扫描平面二维码一样识别出信息。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
