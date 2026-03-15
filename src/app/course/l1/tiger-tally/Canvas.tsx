'use client';

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, a } from '@react-spring/three';

interface TigerTallyProps {
    mergeProgress: number; // 0 (separated) to 1 (merged)
    toothCount: number;
}

export default function TigerTallyCanvas({ mergeProgress, toothCount }: TigerTallyProps) {
    // Generate left and right half shapes
    const { leftGeo, rightGeo } = useMemo(() => {
        const length = 4;
        const width = 1.5;
        const depth = 0.5;
        const toothDepth = 0.4;

        // Base rectangular shapes
        const leftShape = new THREE.Shape();
        leftShape.moveTo(0, -width/2);
        leftShape.lineTo(length/2, -width/2);

        // Add teeth along the split (x = length/2)
        const segmentY = width / toothCount;
        for (let i = 0; i < toothCount; i++) {
            const yStart = -width/2 + i * segmentY;
            const yEnd = yStart + segmentY;
            const isOut = i % 2 === 0;
            const xOffset = length/2 + (isOut ? toothDepth : -toothDepth);

            leftShape.lineTo(xOffset, yStart);
            leftShape.lineTo(xOffset, yEnd);
        }

        leftShape.lineTo(length/2, width/2);
        leftShape.lineTo(0, width/2);
        leftShape.lineTo(0, -width/2);

        const rightShape = new THREE.Shape();
        rightShape.moveTo(length, -width/2);
        rightShape.lineTo(length/2, -width/2);

        // Add inverse teeth
        for (let i = 0; i < toothCount; i++) {
            const yStart = -width/2 + i * segmentY;
            const yEnd = yStart + segmentY;
            const isOut = i % 2 === 0;
            // The right shape teeth MUST invert the left shape precisely
            const xOffset = length/2 + (isOut ? toothDepth : -toothDepth);

            rightShape.lineTo(xOffset, yStart);
            rightShape.lineTo(xOffset, yEnd);
        }

        rightShape.lineTo(length/2, width/2);
        rightShape.lineTo(length, width/2);
        rightShape.lineTo(length, -width/2);

        const extrudeSettings = { depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
        const leftGeometry = new THREE.ExtrudeGeometry(leftShape, extrudeSettings);
        const rightGeometry = new THREE.ExtrudeGeometry(rightShape, extrudeSettings);

        // Center geometries
        leftGeometry.computeBoundingBox();
        rightGeometry.computeBoundingBox();

        leftGeometry.translate(-length/4, 0, -depth/2);
        rightGeometry.translate(-length*3/4, 0, -depth/2);

        return { leftGeo: leftGeometry, rightGeo: rightGeometry };
    }, [toothCount]);

    // Use react-spring to animate the merging
    const { positionLeft, positionRight } = useSpring({
        positionLeft: [-(1 - mergeProgress) * 2, 0, 0] as [number, number, number],
        positionRight: [(1 - mergeProgress) * 2, 0, 0] as [number, number, number],
        config: { mass: 1, tension: 170, friction: 26 }
    });

    const material = new THREE.MeshStandardMaterial({
        color: '#b87333', // Copper / Bronze
        roughness: 0.3,
        metalness: 0.8,
    });

    return (
        <Canvas camera={{ position: [0, 4, 6], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[5, 10, 5]} intensity={1.5} penumbra={1} castShadow />
            <Environment preset="studio" />

            <group>
                <a.mesh geometry={leftGeo} material={material} position={positionLeft as unknown as [number, number, number]} castShadow receiveShadow />
                <a.mesh geometry={rightGeo} material={material} position={positionRight as unknown as [number, number, number]} castShadow receiveShadow />
            </group>

            <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={10} blur={2} far={4} />
            <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} enableDamping />
        </Canvas>
    );
}
