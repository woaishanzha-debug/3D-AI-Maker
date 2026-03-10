'use client';

import React from 'react';
import { X, ShieldCheck, MessageSquare, Clock } from 'lucide-react';

interface BusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BusinessModal({ isOpen, onClose }: BusinessModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] overflow-y-auto font-sans">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500"
                onClick={onClose}
            />

            {/* Centering Container */}
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                <div className="relative w-full max-w-sm bg-white p-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col gap-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[48px] border-2 border-slate-100">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 rounded-[24px] bg-blue-100 flex items-center justify-center mx-auto shadow-sm">
                            <ShieldCheck className="w-8 h-8 text-blue-600" />
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-2xl font-black italic tracking-tighter text-slate-900">
                                商务授权通道
                            </h2>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                扫描下方二维码联系官方课程顾问<br />
                                开启机构授权、批量账号及云端管理权限
                            </p>
                        </div>

                        <div className="relative group max-w-[220px] mx-auto py-2">
                            <div className="absolute -inset-4 bg-blue-100/50 rounded-[3rem] blur opacity-40 group-hover:opacity-60 transition duration-1000"></div>
                            <div className="relative bg-white p-4 rounded-3xl shadow-xl border border-slate-100 overflow-hidden aspect-square flex items-center justify-center">
                                <img
                                    src="/contact-qr.JPG"
                                    alt="官方授权二维码"
                                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "https://placehold.co/400x400/FFFFFF/000000/png?text=QR+Code+Missing";
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
                                <MessageSquare className="w-4 h-4 text-blue-500 mx-auto" />
                                <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">合作咨询</div>
                                <div className="text-xs font-black text-slate-900">专人对接</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
                                <Clock className="w-4 h-4 text-orange-500 mx-auto" />
                                <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">响应速度</div>
                                <div className="text-xs font-black text-slate-900">即时响应</div>
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-300 text-center font-black uppercase tracking-[0.2em] italic">
                        SCAN TO CONNECT WITH NEXUS
                    </p>
                </div>
            </div>
        </div>
    );
}

