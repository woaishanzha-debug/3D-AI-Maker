'use client';

import { motion } from 'framer-motion';

export default function SyntheticCreationAnimation() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            <svg viewBox="0 0 100 100" className="w-full h-full transform scale-150">
                {/* Circuit Traces */}
                <motion.path
                    d="M0,50 L30,50 L45,35 L55,35 L70,50 L100,50"
                    stroke="#f3e8ff"
                    strokeWidth="3"
                    fill="none"
                />
                <motion.path
                    d="M0,50 L30,50 L45,35 L55,35 L70,50 L100,50"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray="4 20"
                    animate={{ strokeDashoffset: [-100, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Energy Circles */}
                <motion.circle
                    cx="50" cy="50" r="45"
                    stroke="#d8b4fe"
                    strokeWidth="0.5"
                    strokeDasharray="5 5"
                    fill="none"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />

                {/* Hardware Nodes */}
                {[
                    { cx: 20, cy: 20 }, { cx: 80, cy: 20 },
                    { cx: 20, cy: 80 }, { cx: 80, cy: 80 }
                ].map((node, i) => (
                    <motion.rect
                        key={i}
                        x={node.cx - 4} y={node.cy - 4}
                        width="8" height="8"
                        rx="2"
                        fill="#9333ea"
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, 90, 180]
                        }}
                        transition={{ duration: 4, delay: i * 0.5, repeat: Infinity }}
                    />
                ))}
            </svg>

            {/* Center Icon - Floating and Clear */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotateY: [0, 360]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="text-purple-600 drop-shadow-2xl"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                </motion.div>
            </div>
        </div>
    );
}
