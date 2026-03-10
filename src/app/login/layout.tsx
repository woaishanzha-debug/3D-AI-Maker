import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '机构通行认证 | 3D AI Maker',
    description: '请输入机构授权的激活码/账号登入全栈系统。',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return children;
}
