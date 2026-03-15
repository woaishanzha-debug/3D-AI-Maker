'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { Box, Layers, MousePointer2, CheckCircle2 } from 'lucide-react';
import { useDrag } from '@use-gesture/react';

// Shared state for snapping logic
const snapState = {
    headSnapped: false,
    baseSnapped: false,
    torsoBox: new THREE.Box3(),
};

type PartProps = {
    type: 'head' | 'torso' | 'base';
    initialPosition: [number, number, number];
    size: [number, number, number];
    color: string;
    onSnapChange?: (snapped: boolean) => void;
};

const DraggablePart: React.FC<PartProps> = ({ type, initialPosition, size, color, onSnapChange }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [pos, setPos] = useState<[number, number, number]>(initialPosition);
    const [hovered, setHovered] = useState(false);
    useCursor(hovered, 'grabbing', 'grab');

    const snapTarget = useRef<THREE.Vector3 | null>(null);

    // Initial setup of targets relative to Torso (0,0,0) with size [1.2, 1.6, 1.0]
    // Torso bounds y: [-0.8, 0.8]
    // Head size: [0.8, 1.0, 0.8]. Half height = 0.5. So head center y should snap to 0.8 + 0.5 = 1.3
    // Base size: [1.6, 0.4, 1.2]. Half height = 0.2. So base center y should snap to -0.8 - 0.2 = -1.0
    useEffect(() => {
        if (type === 'head') snapTarget.current = new THREE.Vector3(0, 1.3, 0);
        if (type === 'base') snapTarget.current = new THREE.Vector3(0, -1.0, 0);
    }, [type]);

    const bind = useDrag(({ active, movement: [x, y], timeStamp }) => {
        if (type === 'torso') return; // Torso is anchor

        if (active) {
            // Very simplified 2D drag in screen space mapped to 3D.
            // The proper way is a plane intersection, but for a simple interaction demo, scaling works.
            const scale = 0.01;
            setPos([initialPosition[0] + x * scale, initialPosition[1] - y * scale, initialPosition[2]]);
            if (onSnapChange) onSnapChange(false);
        } else {
            // Drag ended. Check 3D AABB Bounding Box collision/snapping
            if (meshRef.current && snapTarget.current) {
                // Ensure the matrix is up to date
                meshRef.current.updateMatrixWorld();

                // Get the current AABB of the part
                const currentBox = new THREE.Box3().setFromObject(meshRef.current);
                const currentCenter = new THREE.Vector3();
                currentBox.getCenter(currentCenter);

                // Target AABB check via distance threshold
                const dist = currentCenter.distanceTo(snapTarget.current);

                if (dist < 0.6) {
                    // Snapped!
                    setPos([snapTarget.current.x, snapTarget.current.y, snapTarget.current.z]);
                    if (onSnapChange) onSnapChange(true);
                } else {
                    // Reset to initial to try again, or just leave it where dropped.
                    // Leaving it where dropped is fine.
                }
            }
        }
    });

    useEffect(() => {
        if (type === 'torso' && meshRef.current) {
            meshRef.current.updateMatrixWorld();
            snapState.torsoBox.setFromObject(meshRef.current);
        }
    }, [type]);

    return (
        <mesh
            ref={meshRef}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...(type !== 'torso' ? (bind() as any) : {})}
            position={pos}
            onPointerOver={() => type !== 'torso' && setHovered(true)}
            onPointerOut={() => type !== 'torso' && setHovered(false)}
        >
            <boxGeometry args={size} />
            <meshStandardMaterial
                color={color}
                roughness={0.7}
                metalness={0.2}
                emissive={hovered ? new THREE.Color('#3b82f6') : new THREE.Color('#000000')}
                emissiveIntensity={hovered ? 0.2 : 0}
            />
            {/* Edges for better visibility */}
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
                <lineBasicMaterial color={hovered ? "#ffffff" : "#ea580c"} linewidth={2} />
            </lineSegments>
        </mesh>
    );
};


export const ModularAssemblyCanvas: React.FC = () => {
    const [status, setStatus] = useState<string>('拖拽 3D 部件，利用 AABB 碰撞盒进行组装');
    const [isComplete, setIsComplete] = useState(false);

    const handleSnapChange = (type: 'head' | 'base', snapped: boolean) => {
        if (type === 'head') snapState.headSnapped = snapped;
        if (type === 'base') snapState.baseSnapped = snapped;

        if (snapState.headSnapped && snapState.baseSnapped) {
            setStatus('3D AABB 组装完成！兵马俑结构稳定');
            setIsComplete(true);
        } else if (snapState.headSnapped || snapState.baseSnapped) {
            setStatus('部分 3D 连接点已吸附，请继续');
            setIsComplete(false);
        } else {
            setStatus('拖拽 3D 部件，利用 AABB 碰撞盒进行组装');
            setIsComplete(false);
        }
    };

    return (
        <div className="relative w-full h-full bg-[#0a1128] rounded-[40px] overflow-hidden border border-blue-500/30 shadow-2xl flex flex-col items-center justify-center group touch-none">

            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
                <div className={`flex items-center gap-3 px-6 py-2.5 backdrop-blur-xl rounded-full border shadow-xl transition-colors ${isComplete ? 'bg-green-500/20 border-green-500/40' : 'bg-black/40 border-blue-500/20'}`}>
                    {isComplete ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <MousePointer2 className="w-4 h-4 text-blue-400" />}
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isComplete ? 'text-green-300' : 'text-blue-200'}`}>
                        {status}
                    </span>
                </div>
            </div>

            {/* 3D Canvas Area */}
            <div className="absolute inset-0 z-10 cursor-move">
                <Canvas camera={{ position: [4, 2, 6], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

                    <DraggablePart
                        type="head"
                        initialPosition={[-2, 2, 0]}
                        size={[0.8, 1.0, 0.8]}
                        color="#f97316" // orange-500
                        onSnapChange={(s) => handleSnapChange('head', s)}
                    />

                    <DraggablePart
                        type="torso"
                        initialPosition={[0, 0, 0]}
                        size={[1.2, 1.6, 1.0]}
                        color="#ea580c" // orange-600
                    />

                    <DraggablePart
                        type="base"
                        initialPosition={[2, -2, 0]}
                        size={[1.6, 0.4, 1.2]}
                        color="#c2410c" // orange-700
                        onSnapChange={(s) => handleSnapChange('base', s)}
                    />

                    <Grid renderOrder={-1} position={[0, -2, 0]} infiniteGrid fadeDistance={20} fadeStrength={5} cellColor="#3b82f6" sectionColor="#1e3a8a" />
                    <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} enablePan={false} />
                    <Environment preset="city" />
                </Canvas>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-2xl p-4 rounded-[32px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20">
                <div className="flex items-center gap-3 px-8 py-3.5 bg-blue-600/20 text-blue-300 rounded-2xl font-black text-[11px] tracking-widest uppercase border border-blue-500/20 shadow-lg">
                    <Layers className="w-5 h-5" /> 旋转视角与拖拽部件
                </div>
            </div>
        </div>
    );
};