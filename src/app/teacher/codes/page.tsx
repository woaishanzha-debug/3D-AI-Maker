import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { generateInvitationCode } from "@/actions/auth";
import {
    Ticket,
    UserPlus,
    Copy,
    Trash2,
    Plus,
    GraduationCap,
    History,
    Activity,
    CheckCircle2
} from "lucide-react";

interface CustomSession {
    user: {
        id: string;
        role: string;
    }
}

export default async function TeacherCodesPage() {
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session || (session.user?.role !== "TEACHER" && session.user?.role !== "ORG_ADMIN" && session.user?.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const teacherId = session.user.id;

    const teacherData = await prisma.user.findUnique({
        where: { id: teacherId },
        include: {
            organization: true,
            teacherLicenses: {
                include: {
                    course: true
                }
            },
            createdCodes: {
                include: {
                    course: true
                },
                orderBy: {
                    createdAt: 'desc'
                } as any // eslint-disable-line @typescript-eslint/no-explicit-any
            }
        }
    });

    if (!teacherData) {
        return <div className="p-20 text-center">用户数据不存在。</div>;
    }

    return (
        <div className="min-h-screen bg-[#f1f5f9] pt-32 pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-6 space-y-10">

                {/* Top Profile Header */}
                <div className="bg-slate-900 text-white p-12 rounded-[50px] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden border border-slate-800">
                    <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                        <GraduationCap className="w-80 h-80 -mr-20 -mt-20" />
                    </div>

                    <div className="z-10 space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-3xl font-black italic shadow-2xl">
                                {teacherData.name?.[0] || teacherData.username?.[0]}
                            </div>
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tighter uppercase">{teacherData.name || teacherData.username} · 管理台</h1>
                                <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest">{teacherData.organization?.name} 认证讲师</p>
                            </div>
                        </div>
                    </div>

                    <div className="z-10 flex flex-wrap gap-4">
                        <div className="bg-white/5 border border-white/10 px-8 py-5 rounded-3xl backdrop-blur-md">
                            <div className="text-[10px] font-black uppercase text-slate-500 mb-1">已授课程数</div>
                            <div className="text-2xl font-black tabular-nums">{teacherData.teacherLicenses.length}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-8 py-5 rounded-3xl backdrop-blur-md">
                            <div className="text-[10px] font-black uppercase text-slate-500 mb-1">活跃激活码</div>
                            <div className="text-2xl font-black tabular-nums">{teacherData.createdCodes.length}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left: Course Licenses and Generation Form */}
                    <div className="lg:col-span-4 space-y-10">

                        <section className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <Activity className="w-6 h-6 text-indigo-500" />
                                <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900">课程席位状态</h2>
                            </div>
                            <div className="space-y-6">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {teacherData.teacherLicenses.map((license: any) => (
                                    <div key={license.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-black text-slate-900 uppercase leading-tight max-w-[150px]">{license.course.name}</span>
                                            <span className="text-[9px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase">已获席位: {license.allocatedSeats}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase">
                                                <span className="text-slate-400">使用进度</span>
                                                <span className="text-slate-900">{license.usedSeats} / {license.allocatedSeats}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${(license.usedSeats / license.allocatedSeats) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-indigo-600 p-10 rounded-[40px] shadow-2xl text-white">
                            <div className="flex items-center gap-3 mb-8">
                                <UserPlus className="w-6 h-6 text-indigo-200" />
                                <h2 className="text-xl font-black italic uppercase tracking-tight">生成学生激活码</h2>
                            </div>
                            <form action={async (formData) => {
                                'use server';
                                const courseId = formData.get('courseId') as string;
                                const maxUses = parseInt(formData.get('maxUses') as string);
                                const session = await getServerSession(authOptions) as CustomSession | null;
                                if (!session) return;

                                try {
                                    await generateInvitationCode(session.user.id, courseId, maxUses);
                                } catch (e: any) {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    console.error((e as any).message);
                                }
                            }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-indigo-200 ml-2">选择对应课程</label>
                                    <select name="courseId" className="w-full bg-white/10 border-2 border-white/10 rounded-2xl px-6 py-4 font-black uppercase focus:border-white transition-all outline-none appearance-none cursor-pointer">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {teacherData.teacherLicenses.map((tl: any) => (
                                            <option key={tl.courseId} value={tl.courseId} className="text-slate-900">{tl.course.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-indigo-200 ml-2">该码可激活人数 (名额)</label>
                                    <input name="maxUses" type="number" defaultValue="1" className="w-full bg-white/10 border-2 border-white/10 rounded-2xl px-6 py-4 font-black focus:border-white transition-all outline-none" />
                                </div>
                                <button type="submit" className="w-full py-5 bg-white text-indigo-600 font-black rounded-2xl shadow-xl hover:bg-indigo-50 active:scale-95 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-3">
                                    <Plus className="w-5 h-5" /> 立即铸造激活码
                                </button>
                            </form>
                        </section>

                    </div>

                    {/* Right: Codes List */}
                    <div className="lg:col-span-8">
                        <section className="bg-white p-12 rounded-[50px] border border-slate-200 shadow-sm min-h-[600px]">
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-4">
                                    <History className="w-8 h-8 text-slate-300" />
                                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">激活码签发记录</h2>
                                </div>
                                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border border-emerald-100">
                                    <CheckCircle2 className="w-4 h-4" /> 实时加密存储
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {teacherData.createdCodes.length > 0 ? teacherData.createdCodes.map((code: any) => (
                                    <div key={code.id} className="p-8 rounded-[32px] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden">
                                        <div className="grid grid-cols-12 items-center gap-6">
                                            <div className="col-span-4 space-y-1">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{code.course.name}</div>
                                                <div className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums flex items-center gap-3">
                                                    {code.code}
                                                    <button title="复制邀请码" className="text-slate-200 hover:text-indigo-500 transition-all">
                                                        <Copy className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="col-span-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                                        <span className="text-slate-400 italic">激活统计</span>
                                                        <span className="text-indigo-600">{code.usedCount} <span className="text-slate-300">/ {code.maxUses}</span></span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full"
                                                            style={{ width: `${(code.usedCount / code.maxUses) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-4 flex justify-end items-center gap-6">
                                                <div className="text-[9px] font-black text-slate-300 text-right italic uppercase">
                                                    签发于<br />{new Date(code.createdAt).toLocaleString()}
                                                </div>
                                                <button className="p-3 bg-white text-rose-100 hover:text-rose-500 hover:shadow-lg border border-slate-100 rounded-2xl transition-all active:scale-90">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-32 flex flex-col items-center justify-center gap-8 opacity-20 italic">
                                        <Ticket className="w-24 h-24" />
                                        <span className="text-sm font-black uppercase tracking-widest">暂无签发记录，请通过左侧面板生成。</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                </div>
            </div>
        </div>
    );
}
