import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '3D 打印教育课程 | 3D AI Maker',
    description: '10 节线上实操技术课。深入掌握 AI 驱动的 3D 建模工具，打通从创意草图到物理实体的数字化链路。'
};

export default function ToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
