'use client';

import { useState } from 'react';
import CodeTree from './CodeTree';
import { PlusCircle, Shield, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

interface AdminDashboardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    organizations: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendingWorks: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    courseSeries: any[];
    initialTab?: 'auth' | 'works';
    actions: {
        createOrgAndCodes: (formData: FormData) => Promise<void>;
        addTeacherToOrg: (formData: FormData) => Promise<void>;
        toggleCodeStatus: (id: string, status: string, name?: string) => Promise<void>;
        deleteOrganization: (id: string) => Promise<void>;
        deleteCode: (id: string) => Promise<void>;
        allocateCourseToOrg: (formData: FormData) => Promise<void>;
    };
}

export default function AdminDashboard({ organizations, pendingWorks, courseSeries, initialTab = 'auth', actions }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<'auth' | 'works'>(initialTab);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* 顶部导航 */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <Shield className="w-8 h-8 text-blue-600" />
                            <h1 className="text-xl font-black tracking-tight text-slate-900 italic uppercase">Super Admin Panel</h1>
                        </div>
                        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                            <button
                                onClick={() => setActiveTab('auth')}
                                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'auth' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                机构授权分发
                            </button>
                            <button
                                onClick={() => setActiveTab('works')}
                                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'works' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                作品审核 ({pendingWorks.length})
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {activeTab === 'auth' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* 左侧：分发面板 */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden p-8 sticky top-30">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">生成机构授权</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Parent Account Distribution</p>
                                </div>

                                <form action={async (formData) => {
                                    await actions.createOrgAndCodes(formData);
                                    (document.getElementById('authForm') as HTMLFormElement)?.reset();
                                }} id="authForm" className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">机构名称 (内部备注)</label>
                                        <input name="orgName" type="text" placeholder="例如: 某教育局 / 某合作学校" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">登录用户名前缀 (限英数)</label>
                                        <input name="loginUsername" type="text" placeholder="例如: EDU_SCHOOL_01" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black uppercase focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">登录初始密码</label>
                                        <input name="initialPassword" type="text" placeholder="设置初始登录私钥" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">分发老师数</label>
                                            <input name="count" type="number" defaultValue="1" min="1" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-500/10 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">学生数 (每老师)</label>
                                            <input name="studentQuota" type="number" defaultValue="20" min="0" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-500/10 outline-none" />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3 uppercase text-xs tracking-widest">
                                        <PlusCircle className="w-5 h-5" /> 确认授权并分发
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* 右侧：树形图谱 */}
                        <div className="lg:col-span-8 flex flex-col">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                    <h3 className="text-xl font-black text-slate-900 uppercase italic">父子账号授权图谱</h3>
                                </div>
                            </div>
                            <CodeTree
                                organizations={organizations}
                                courseSeries={courseSeries}
                                onToggle={actions.toggleCodeStatus}
                                onDelete={actions.deleteCode}
                                onDeleteOrg={actions.deleteOrganization}
                                onAddTeacher={actions.addTeacherToOrg}
                                onAllocateCourse={actions.allocateCourseToOrg}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingWorks.map((work) => (
                            <div key={work.id} className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden flex flex-col group">
                                <div className="aspect-video relative overflow-hidden bg-slate-100">
                                    {work.coverImageUrl ? (
                                        <Image src={work.coverImageUrl} alt={work.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">NO PREVIEW</div>
                                    )}
                                </div>
                                <div className="p-8 space-y-4 flex-1">
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900 line-clamp-1">{work.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Author: {work.author?.name || 'Unknown'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <form action={async () => { /* action to approve */ }}>
                                            <button className="flex-1 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> 批准发布
                                            </button>
                                        </form>
                                        <form action={async () => { /* action to reject */ }}>
                                            <button className="flex-1 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                                <XCircle className="w-4 h-4" /> 驳回作品
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {pendingWorks.length === 0 && (
                            <div className="col-span-full py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                <Shield className="w-16 h-16 mb-4 opacity-10" />
                                <span className="font-black uppercase tracking-widest text-xs italic">暂无待审核作品议程</span>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
