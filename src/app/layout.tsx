import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '3D AI Maker 普惠AI创客教育解决方案',
  description: '你的灵感，3D成型。结合领先AI与3D打印的创造者平台。',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 antialiased overflow-x-hidden`}>
        <Providers>
          <div className="relative z-10 flex min-h-screen flex-col">
            {/* 全局导航栏 - 已抽离为含权限管理的互动客户端组件 */}
            <Header />

            <main className="flex-1 pt-16">{children}</main>
          </div>

          {/* 全局装饰性背景光效 - 针对浅色主题优化 */}
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[120px] animate-blob"></div>
            <div className="absolute top-[10%] right-[-15%] w-[45%] h-[45%] rounded-full bg-purple-50/30 blur-[140px] animate-blob" style={{ animationDelay: '3s' }}></div>
            <div className="absolute bottom-[-20%] left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-50/40 blur-[160px] animate-blob" style={{ animationDelay: '6s' }}></div>

            {/* Grid Pattern overlay for tech feel */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03]"></div>
          </div>
        </Providers>
      </body>
    </html>
  )
}

