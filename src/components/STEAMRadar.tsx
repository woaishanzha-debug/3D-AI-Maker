'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
    { subject: 'S (科学探索)', A: 85, fullMark: 100 },
    { subject: 'T (技术应用)', A: 98, fullMark: 100 },
    { subject: 'E (工程实践)', A: 95, fullMark: 100 },
    { subject: 'A (艺术审美)', A: 88, fullMark: 100 },
    { subject: 'M (数学几何)', A: 92, fullMark: 100 },
];

export default function STEAMRadar() {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-full h-72 bg-white/5 animate-pulse rounded-3xl" />;

    return (
        <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="rgba(0,0,0,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 12, fontWeight: 600 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: '#000' }}
                        itemStyle={{ color: '#38bdf8' }}
                    />
                    <Radar name="核心能力提升" dataKey="A" stroke="#38bdf8" strokeWidth={2} fill="#38bdf8" fillOpacity={0.4} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
