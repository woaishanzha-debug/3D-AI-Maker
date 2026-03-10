'use client';

import { motion } from 'framer-motion';

export default function PhysicalManifestationAnimation() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            <svg viewBox="0 0 100 100" className="w-full h-full transform scale-125">
                {/* 3D Grid Platform - Expanded */}
                <motion.path
                    d="M10,75 L50,95 L90,75 L50,55 Z"
                    fill="#fff"
                    stroke="#fed7aa"
                    strokeWidth="0.5"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                />

                {/* Moving Extruder */}
                <motion.g
                    animate={{
                        x: [0, 25, -25, 0],
                        y: [0, -5, 5, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                    <path d="M47,5 L53,5 L50,15 Z" fill="#ea580c" />
                    <motion.line
                        x1="50" y1="15" x2="50" y2="75"
                        stroke="#f97316"
                        strokeWidth="0.8"
                        strokeDasharray="2 2"
                        animate={{ strokeDashoffset: [0, -10] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                </motion.g>

                {/* Building Layers */}
                {[0, 1, 2, 3, 4].map((i) => (
                    <motion.path
                        key={i}
                        d={`M${20 + i * 4},${75 - i * 6} L${50},${85 - i * 6} L${80 - i * 4},${75 - i * 6} L${50},${65 - i * 6} Z`}
                        fill="#ffedd5"
                        stroke="#fb923c"
                        strokeWidth="0.5"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.6, duration: 1 }}
                    />
                ))}
            </svg>

            {/* Center Icon - Large and Floating */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="text-orange-600 drop-shadow-2xl"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                </motion.div>
            </div>
        </div>
    );
}
