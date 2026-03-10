'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize, X } from 'lucide-react';
import Image from 'next/image';

interface Slide {
    index: number;
    title: string;
    content: string[];
    images: string[];
}

interface PresentationData {
    title: string;
    slides: Slide[];
}

export const PresentationViewer = ({ slug, dataFile = 'data.json' }: { slug: string, dataFile?: string }) => {
    const [data, setData] = useState<PresentationData | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const viewerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`/presentations/${slug}/${dataFile}`)
            .then(res => res.json())
            .then(setData)
            .catch(err => console.error("Error loading presentation:", err));
    }, [slug, dataFile]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    if (!data) return <div className="flex items-center justify-center p-20 text-white italic">载入课件中...</div>;

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            viewerRef.current?.requestFullscreen().catch((err: any) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const nextSlide = () => {
        if (currentSlide < data.slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    const slide = data.slides[currentSlide];

    return (
        <div
            ref={viewerRef}
            className={`relative flex flex-col bg-slate-900 overflow-hidden ${isFullscreen ? 'w-screen h-screen' : 'w-full aspect-video rounded-2xl shadow-2xl border border-white/5'}`}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0 flex flex-col p-12 md:p-16 text-white"
                >
                    {/* 背景元素 */}
                    <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-600/10 blur-[100px] pointer-events-none" />

                    {/* 标题 */}
                    <h2 className="text-3xl md:text-5xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 leading-tight">
                        {slide.title}
                    </h2>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 overflow-hidden">
                        {/* 文字内容 */}
                        <div className="space-y-6 overflow-y-auto pr-4 scrollbar-hide">
                            {slide.content.map((p, i) => (
                                <motion.p
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                    className="text-lg md:text-xl text-slate-300 leading-relaxed font-light"
                                >
                                    {p}
                                </motion.p>
                            ))}
                        </div>

                        {/* 图片展示 */}
                        <div className="relative flex items-center justify-center bg-white/5 rounded-3xl overflow-hidden border border-white/10 group">
                            {slide.images.length > 0 ? (
                                <div className="relative w-full h-full p-4">
                                    {slide.images.map((img, i) => (
                                        <div key={i} className="relative w-full h-full">
                                            <Image
                                                src={img}
                                                alt="slide asset"
                                                fill
                                                className="object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-white/10 text-9xl font-black">{currentSlide + 1}</div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* 控制器 */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 text-xs font-mono text-white/60 tracking-widest uppercase">
                    Slide <span className="text-blue-400 font-black">{currentSlide + 1}</span> / {data.slides.length}
                </div>

                <div className="flex items-center gap-4 p-1.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 pointer-events-auto">
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className="p-3 hover:bg-white/10 rounded-full disabled:opacity-20 transition-all text-white"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={nextSlide}
                        disabled={currentSlide === data.slides.length - 1}
                        className="p-3 hover:bg-white/10 rounded-full disabled:opacity-20 transition-all text-white"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="w-[1px] h-6 bg-white/10 mx-1" />

                    <button
                        onClick={toggleFullscreen}
                        className="p-3 hover:bg-white/10 rounded-full transition-all text-white"
                    >
                        {isFullscreen ? <X className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* 顶栏信息 */}
            <div className="absolute top-6 left-8 right-8 flex justify-between items-center pointer-events-none opacity-40">
                <span className="text-[10px] text-white font-black tracking-[0.3em] uppercase">{data.title}</span>
                <span className="text-[10px] text-white font-black tracking-[0.3em] uppercase">3D AI Maker Presentation</span>
            </div>
        </div>
    );
};
