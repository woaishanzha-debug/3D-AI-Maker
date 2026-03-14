"use client";

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

interface Mashao3DViewerProps {
  svgString: string;
  baseDepth?: number;
  totemDepth?: number;
  onClose: () => void;
}

export default function Mashao3DViewer({ 
  svgString, 
  baseDepth = 2, 
  totemDepth = 4,
  onClose
}: Mashao3DViewerProps) {
  
  // 使用 useMemo 缓存 3D 几何体计算结果，避免 React 重绘导致重复计算卡顿
  const meshes = useMemo(() => {
    if (!svgString) return [];
    const loader = new SVGLoader();
    const svgData = loader.parse(svgString);
    const generatedMeshes: { geometry: THREE.ExtrudeGeometry, material: THREE.MeshStandardMaterial, key: string, z: number }[] = [];

    svgData.paths.forEach((path, index) => {
      const fillColor = path.userData?.style?.fill;
      const color = fillColor ? new THREE.Color().setStyle(fillColor) : new THREE.Color(0xffffff);
      
      // 赋予 3D 材质参数，增加高光和些许金属感，让它看起来像涂装过的木头或 PLA 塑料
      const material = new THREE.MeshStandardMaterial({ 
        color, 
        roughness: 0.4, 
        metalness: 0.1 
      });
      
      const shapes = SVGLoader.createShapes(path);

      shapes.forEach((shape, shapeIndex) => {
        // 假设图层底部的 index 0 为底板
        const isBasePlate = index === 0;
        const depth = isBasePlate ? baseDepth : totemDepth;
        
        const geometry = new THREE.ExtrudeGeometry(shape, { 
          depth, 
          bevelEnabled: true,
          bevelThickness: 0.5,
          bevelSize: 0.5,
          bevelSegments: 2
        });
        
        geometry.scale(1, -1, 1); // 翻转 Y 轴以修正 SVG 到 3D 的坐标差异
        
        const meshInfo = { geometry, material, key: `mesh-${index}-${shapeIndex}`, z: 0 };
        if (!isBasePlate) {
            meshInfo.z = baseDepth;
        }
        generatedMeshes.push(meshInfo);
      });
    });
    return generatedMeshes;
  }, [svgString, baseDepth, totemDepth]);

  if (!svgString) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-11/12 max-w-4xl h-[70vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col">
        {/* 头部控制栏 */}
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <h3 className="text-white font-bold tracking-widest text-lg drop-shadow-md">实体全彩 3D 预览</h3>
          <button 
            onClick={onClose}
            className="pointer-events-auto px-4 py-2 bg-red-600/90 hover:bg-red-500 text-white rounded-full font-bold backdrop-blur transition-all"
          >
            关闭预览
          </button>
        </div>

        {/* 核心 3D 渲染画布 */}
        <div className="flex-1 w-full h-full cursor-move">
          <Canvas camera={{ position: [0, 0, 400], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[100, 200, 100]} intensity={1.5} castShadow />
            {/* 使用预设的环境光贴图(city)，让模型表面产生真实的物理反射 */}
            <Environment preset="city" />
            
            <Center>
              <group rotation={[0, 0, 0]}>
                {meshes.map(({ geometry, material, key, z }) => (
                  <mesh key={key} geometry={geometry} material={material} position={[0, 0, z]} castShadow receiveShadow />
                ))}
              </group>
            </Center>
            
            {/* 轨道控制器：支持鼠标拖拽旋转、滚轮缩放、右键平移。开启自动缓慢旋转 */}
            <OrbitControls makeDefault autoRotate autoRotateSpeed={2} enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>

        <div className="bg-slate-950/50 p-4 border-t border-white/5 flex justify-center gap-6">
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">鼠标左键：旋转视角</p>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">鼠标中键/滚轮：缩放</p>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">鼠标右键：平移</p>
        </div>
      </div>
    </div>
  );
}
