import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '非遗3D造物课程 | 3D AI Maker',
    description: 'L1级 - 结合传统文化的现代3D打印课程'
};

export default function L1CourseLayout({ children }: { children: React.ReactNode }) {
    return children;
}
