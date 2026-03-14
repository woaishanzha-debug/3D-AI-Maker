import React from 'react';
import dynamic from 'next/dynamic';

const InteractionBoard = dynamic(() => import('@/components/SongBrocade/InteractionBoard'), {
    ssr: false,
    loading: () => <div className="flex-1 flex items-center justify-center text-slate-500 font-bold tracking-widest animate-pulse">LOADING CRAFT LAB...</div>
});

export default function TestPage() {
    return (
        <div className="min-h-screen bg-[#020617] p-8">
            <div className="h-[800px] bg-slate-900 rounded-3xl overflow-hidden flex flex-col relative">
                <InteractionBoard />
            </div>
        </div>
    );
}
