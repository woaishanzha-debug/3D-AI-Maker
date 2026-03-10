'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Maximize2, Plus, X, Loader2, Sparkles, Trophy } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Project {
    id: string;
    authorId: string;
    title: string;
    description: string;
    coverImageUrl: string;
    school: string;
    teacher: string;
    status: string;
    likesCount: number;
    author: { name: string };
    createdAt: string;
}

export default function Gallery() {
    const { data: session } = useSession();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/posts');
            const data = await res.json();
            if (Array.isArray(data)) setProjects(data);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="bg-white min-h-screen pt-32 pb-24 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 pb-12 border-b border-slate-100">
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                            <Trophy className="w-3 h-3" /> Creative Nexus
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-slate-900">
                            学生作品 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">STUDENT WORKS</span>
                        </h1>
                        <p className="text-slate-600 font-medium text-lg leading-relaxed">
                            见证 AI 与 3D 打印驱动下的无限创意。每一份作品都代表着对未来数字造物的深度探索。<br />
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Moderated by Institutional Teachers</span>
                        </p>
                    </div>

                    {session && (
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 text-xs uppercase tracking-widest cursor-pointer"
                        >
                            <Plus className="w-5 h-5" /> 提交我的创作成果
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 text-blue-600">
                        <Loader2 className="w-12 h-12 animate-spin" />
                        <p className="text-xs font-black uppercase tracking-[0.3em]">Opening Showcase Space...</p>
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
                        {projects.filter(p => p.status === 'APPROVED' || p.authorId === (session?.user as { id?: string })?.id).map((item) => (
                            <div key={item.id} className="w-full relative overflow-hidden group cursor-pointer inline-block break-inside-avoid bg-slate-50 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-700">
                                <div className="relative w-full aspect-[4/5] overflow-hidden">
                                    <Image
                                        src={item.coverImageUrl || '/placeholder-project.png'}
                                        alt={item.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>

                                    {item.status === 'PENDING' && (
                                        <div className="absolute top-6 left-6 px-4 py-2 bg-yellow-400 text-slate-900 text-[10px] font-black rounded-full shadow-xl shadow-yellow-400/20 uppercase tracking-widest z-10">
                                            待老师核准
                                        </div>
                                    )}

                                    <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="inline-flex py-1 px-3 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white/90 uppercase tracking-widest w-fit mb-3">
                                            Project Entry
                                        </div>
                                        <h3 className="text-2xl font-black italic text-white mb-2 tracking-tight">{item.title}</h3>
                                        <div className="space-y-1">
                                            <p className="text-xs text-white/70 font-bold">{item.school}</p>
                                            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Guide: {item.teacher} • Author: {item.author.name}</p>
                                        </div>

                                        <div className="flex gap-4 pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 bg-white text-slate-900 rounded-xl hover:bg-blue-50 transition-all">
                                                <Heart className="w-3 h-3 text-red-500 fill-red-500" /> {item.likesCount}
                                            </button>
                                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                                                <Maximize2 className="w-3 h-3" /> View 3D Detail
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowUploadModal(false)}></div>
                    <div className="relative w-full max-w-xl bg-white p-10 md:p-12 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-y-auto max-h-[90vh] rounded-[48px] shadow-2xl border-2 border-slate-100">
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-900 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-16 h-16 rounded-[24px] bg-blue-50 flex items-center justify-center shadow-inner">
                                <Sparkles className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black italic tracking-tighter text-slate-900">提交作品审核</h2>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Submit your creation for teacher moderation</p>
                            </div>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setSubmitting(true);
                            const formData = new FormData(e.currentTarget);
                            const payload = {
                                title: formData.get('title'),
                                school: formData.get('school'),
                                teacher: formData.get('teacher'),
                                coverImageUrl: formData.get('coverImageUrl'),
                                description: formData.get('description'),
                            };

                            try {
                                const res = await fetch('/api/posts', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(payload)
                                });
                                if (res.ok) {
                                    setShowUploadModal(false);
                                    fetchPosts();
                                }
                            } catch (err) { console.error(err); }
                            finally { setSubmitting(false); }
                        }} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">项目名称 (Project ID)</label>
                                    <input name="title" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold text-slate-900 outline-none" placeholder="作品名称" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">所属机构 / 学校</label>
                                    <input name="school" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold text-slate-900 outline-none" placeholder="所属学校" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">指导教师</label>
                                    <input name="teacher" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold text-slate-900 outline-none" placeholder="教师姓名" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">封面 URL (Cover URL)</label>
                                    <input name="coverImageUrl" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold text-slate-900 outline-none" placeholder="图片链接" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">设计叙事 (Narration)</label>
                                <textarea name="description" className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold text-slate-900 outline-none resize-none" placeholder="描述你的创作灵感与技术点..." />
                            </div>

                            <button
                                disabled={submitting}
                                className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50 text-xs uppercase tracking-[0.2em] cursor-pointer mt-4"
                            >
                                {submitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : '提交系统存档与全网核准'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
