import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const titleMap: Record<string, string> = {
        'sketch-to-3d': '草图转3D工具',
        'lithophane-generator': '浮雕板生成器',
        'parametric-box': '参数化卡扣盒'
    };

    const toolName = titleMap[params.id] || '创意小工具';

    return {
        title: `${toolName} | 3D AI Maker`,
        description: `执行并交互式生成 ${toolName} 3D模型`,
    };
}

export default function ToolLayout({ children }: { children: React.ReactNode }) {
    return children;
}
