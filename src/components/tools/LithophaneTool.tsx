'use client';

import React from 'react';
import { Lightbulb, Info, ExternalLink, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function LithophaneTool() {
    return (
        <div className="space-y-8">
            {/* 课堂话术区 */}
            <div className="glass-panel-deep p-6 relative overflow-hidden border-l-4 border-primary">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-primary mb-1">老师寄语</h3>
                        <p className="text-foreground/80 leading-relaxed italic text-sm">
                            “一张普通的照片里藏着立体世界。我们要利用‘厚薄透光’的秘密，把你的照片变成一盏灯，让光线穿过它，回忆才会显现。”
                        </p>
                    </div>
                </div>
            </div>

            {/* 云端工具嵌入区 */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        <span>已连接至 Lithophane 工业级高性能生成引擎</span>
                    </div>
                    <a
                        href="https://3dp.rocks/lithophane/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                        在原站打开 <ExternalLink className="w-3 h-3" />
                    </a>
                </div>

                <div className="glass-panel overflow-hidden relative rounded-2xl border border-white/10 shadow-2xl bg-black" style={{ height: '800px' }}>
                    <iframe
                        src="https://3dp.rocks/lithophane/"
                        className="w-full h-full border-none"
                        title="Lithophane Generator"
                        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads"
                    />
                </div>
                <p className="text-center text-[10px] text-foreground/30">
                    提示：该工具由开源社区提供动力，支持多种形状映射（平滑面、圆柱面、球体等）。上传照片后即可在 3D 视图中实时调整。
                </p>
            </div>

            {/* 原理科普区 */}
            <div className="glass-panel p-8 bg-gradient-to-br from-white/[0.02] to-transparent">
                <div className="flex items-center gap-3 mb-8 text-xl font-bold">
                    <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                        <Info className="w-6 h-6 text-secondary" />
                    </div>
                    <span>原理科普：为什么能看到图像？</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                        <Image
                            src="/illustrations/lithophane_principle.png"
                            alt="Lithophane Principle"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h4 className="font-bold text-secondary flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                                亮度控制厚度
                            </h4>
                            <p className="text-sm text-white/50 leading-relaxed">
                                计算机读取照片像素：**越暗**的地方映射为**更厚**的 3D 实体；**越亮**的地方映射为**更薄**的实体。
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-primary flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                背光成像
                            </h4>
                            <p className="text-sm text-white/50 leading-relaxed">
                                当你对着灯光观察打印件时，光线穿透薄层产生高光，被厚层阻挡产生阴影，神奇地还原出照片细节。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
