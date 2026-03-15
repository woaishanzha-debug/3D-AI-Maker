'use client';

import React from 'react';
import InteractionBoard from '@/components/Lantern/InteractionBoard';
import Canvas from '@/components/Lantern/Canvas';

export default function LanternPage() {
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
