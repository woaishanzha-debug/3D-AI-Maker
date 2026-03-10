'use client';

import { motion } from 'framer-motion';

export default function AILogicAnimation() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Background Connection Lines */}
                <motion.path
                    d="M10,50 L50,10 M50,10 L90,50 M90,50 L50,90 M50,90 L10,50 M10,50 L90,50 M50,10 L50,90"
                    stroke="#e2e8f0"
                    strokeWidth="0.5"
                    fill="none"
                />

                {/* Central Pulse Ring */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="25"
                    stroke="#3b82f6"
                    strokeWidth="0.3"
                    fill="none"
                    animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                />

                {/* Data Nodes */}
                {[
                    { cx: 50, cy: 10 }, { cx: 90, cy: 50 },
                    { cx: 50, cy: 90 }, { cx: 10, cy: 50 },
                    { cx: 50, cy: 50 }
                ].map((node, i) => (
                    <motion.circle
                        key={i}
                        cx={node.cx}
                        cy={node.cy}
                        r="3.5"
                        fill={i === 4 ? "#2563eb" : "#3b82f6"}
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                    />
                ))}

                {/* Floating Elements */}
                <motion.text x="15" y="25" fontSize="6" fill="#3b82f6" opacity="0.4" fontFamily="monospace">{`{AI}`}</motion.text>
                <motion.text x="70" y="80" fontSize="6" fill="#3b82f6" opacity="0.4" fontFamily="monospace">{`exec()`}</motion.text>
            </svg>

            {/* Center Icon - Floating and Clean */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="text-blue-600 drop-shadow-2xl"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="4 17 10 11 4 5"></polyline>
                        <line x1="12" y1="19" x2="20" y2="19"></line>
                    </svg>
                </motion.div>
            </div>
        </div>
    );
}
