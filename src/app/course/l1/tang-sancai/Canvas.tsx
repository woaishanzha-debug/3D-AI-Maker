'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface TangSancaiProps {
    glazeIntensity: number;
    headType: number;
    bodyType: number;
}

const GlazeMaterial = ({ intensity }: { intensity: number }) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        intensity: { value: intensity },
        uColor1: { value: new THREE.Color('#d9772b') }, // Amber
        uColor2: { value: new THREE.Color('#4c8b36') }, // Green
        uColor3: { value: new THREE.Color('#e0ceb1') }, // Cream
    }), [intensity]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
            materialRef.current.uniforms.intensity.value = intensity;
        }
    });

    return (
        <shaderMaterial
            ref={materialRef}
            uniforms={uniforms}
            vertexShader={`
                varying vec2 vUv;
                varying vec3 vPosition;
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `}
            fragmentShader={`
                uniform float uTime;
                uniform float intensity;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform vec3 uColor3;

                varying vec2 vUv;
                varying vec3 vPosition;

                // Simple 3D noise
                float hash(vec3 p) {
                    p = fract(p * 0.3183099 + .1);
                    p *= 17.0;
                    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
                }

                float noise(vec3 x) {
                    vec3 i = floor(x);
                    vec3 f = fract(x);
                    f = f * f * (3.0 - 2.0 * f);

                    return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
                }

                void main() {
                    // Simulating glaze flow downwards (y axis)
                    vec3 pos = vPosition * 5.0;
                    pos.y += uTime * 0.5 * intensity;

                    float n1 = noise(pos + vec3(0.0, 0.0, uTime * 0.1));
                    float n2 = noise(pos * 2.0 + vec3(100.0, uTime * 0.2, 0.0));

                    // Distort UVs based on noise and intensity
                    vec2 distortedUv = vUv + vec2(n1, n2) * 0.1 * intensity;

                    // Blend colors based on distorted UVs y-coord and noise
                    float flow = smoothstep(0.2, 0.8, fract(distortedUv.y * 3.0 + n1 * intensity));

                    vec3 finalColor = mix(uColor1, uColor2, flow);
                    finalColor = mix(finalColor, uColor3, n2 * intensity);

                    // Add basic lighting variation
                    float light = noise(vPosition * 10.0) * 0.2 + 0.8;

                    gl_FragColor = vec4(finalColor * light, 1.0);
                }
            `}
        />
    );
};

export default function TangSancaiCanvas({ glazeIntensity, headType, bodyType }: TangSancaiProps) {
    return (
        <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <Environment preset="city" />

            <group position={[0, -1, 0]}>
                {/* Modular Base */}
                <mesh position={[0, 0.25, 0]}>
                    <cylinderGeometry args={[1.5, 1.8, 0.5, 32]} />
                    <meshStandardMaterial color="#444" roughness={0.8} />
                </mesh>

                {/* Modular Body */}
                <group position={[0, 0.5, 0]}>
                    {bodyType === 0 && (
                        <mesh position={[0, 1, 0]}>
                            <capsuleGeometry args={[0.8, 1.5, 4, 16]} />
                            <GlazeMaterial intensity={glazeIntensity} />
                        </mesh>
                    )}
                    {bodyType === 1 && (
                        <mesh position={[0, 1, 0]}>
                            <cylinderGeometry args={[0.6, 1.0, 2, 32]} />
                            <GlazeMaterial intensity={glazeIntensity} />
                        </mesh>
                    )}
                </group>

                {/* Modular Head */}
                <group position={[0, 0.5 + (bodyType === 0 ? 2.5 : 2.0), 0]}>
                    {headType === 0 && (
                        <mesh>
                            <sphereGeometry args={[0.6, 32, 32]} />
                            <GlazeMaterial intensity={glazeIntensity} />
                        </mesh>
                    )}
                    {headType === 1 && (
                        <mesh>
                            <coneGeometry args={[0.5, 1.2, 16]} />
                            <GlazeMaterial intensity={glazeIntensity} />
                        </mesh>
                    )}
                </group>
            </group>

            <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={10} blur={2} far={4} />
            <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} enableDamping />
        </Canvas>
    );
}
