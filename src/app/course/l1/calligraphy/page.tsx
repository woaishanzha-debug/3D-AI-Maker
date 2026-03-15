'use client';

import React from 'react';
import InteractionBoard from '@/components/Calligraphy/InteractionBoard';
import Canvas from '@/components/Calligraphy/Canvas';

export default function CalligraphyPage() {
    return (
        <div className="flex h-screen w-screen bg-[#020617] text-white overflow-hidden p-4 gap-4">
            <div className="flex-1 h-full">
                <InteractionBoard />
            </div>
            <div className="flex-1 h-full">
                <Canvas />
            </div>
        </div>
    );
}
