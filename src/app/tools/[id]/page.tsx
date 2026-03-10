'use client';

import { useParams } from 'next/navigation';
import { ChevronLeft, Wrench } from 'lucide-react';
import Link from 'next/link';
import LithophaneTool from '@/components/tools/LithophaneTool';
import QRCodeTool from '@/components/tools/QRCodeTool';


export default function ToolDetailPage() {
    const params = useParams();
    const toolId = params.id as string;

    // 工具映射表（后续可扩展）
    const renderTool = () => {
        switch (toolId) {
            case 's1':
            case 'lithophane-generator':
                return <LithophaneTool />;
            case 's2':
            case '3d-qrcode':
                return <QRCodeTool />;
            default:
                return (
                    <div className="glass-panel p-12 text-center space-y-4">
                        <Wrench className="w-16 h-16 text-white/10 mx-auto" />
                        <h2 className="text-2xl font-bold">工具正在建设中</h2>
                        <p className="text-white/40 max-w-md mx-auto">
                            这个神奇的 3D 生成工具已被列入计划，我们的工程师正在加班加点将其从 GitHub 实验室搬迁至此。
                        </p>
                        <Link
                            href="/tools"
                            className="inline-block px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/80 transition-colors"
                        >
                            返回集市
                        </Link>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 py-32 relative z-20">
                {/* 顶部面包屑/返回 */}
                <div className="mb-8">
                    <Link
                        href="/tools"
                        className="flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        返回工具集市
                    </Link>
                </div>

                {/* 动态工具内容 */}
                {renderTool()}
            </div>
        </div>
    );
}

