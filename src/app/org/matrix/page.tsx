import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { assignCourseToTeacher } from "@/actions/auth";
import {
    Users,
    BookOpen,
    ShieldCheck,
    ArrowRight,
    Plus,
    Info,
    Layers,
    BarChart3
} from "lucide-react";

interface CustomSession {
    user: {
        id: string;
        role: string;
        orgId?: string;
    }
}

export default async function OrgMatrixPage() {
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session || (session.user?.role !== "ORG_ADMIN" && session.user?.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const orgId = session.user.orgId;
    if (!orgId) {
        return <div className="p-20 text-center">未关联机构，请联系管理员。</div>;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const organization = await (prisma.organization as any).findUnique({
        where: { id: orgId },
        include: {
            orgLicenses: {
                include: {
                    series: {
                        include: {
                            courses: true
                        }
                    }
                }
            },
            users: {
                where: { role: "TEACHER" }
            }
        }
    });

    if (!organization) {
        return <div className="p-20 text-center">机构不存在。</div>;
    }

    // Fetch all teacher licenses for this org
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teacherLicenses = await (prisma.teacherLicense as any).findMany({
        where: {
            teacher: { orgId: orgId }
        },
        include: {
            teacher: true,
            course: true
        }
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-32 pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-6 space-y-10">

                {/* Header Section */}
                <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">{organization.name} - 数字化授权中心</h1>
                        </div>
                        <p className="text-slate-500 font-medium">作为校长，您可以灵活调配机构名下的课程体系席位给特定的老师。</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                            <Users className="w-5 h-5 text-indigo-500" />
                            <div>
                                <div className="text-[10px] font-black uppercase text-slate-400">在册教师</div>
                                <div className="text-lg font-black text-slate-900">{organization.users.length} 名</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Left Column: Licenses & Action */}
                    <div className="lg:col-span-1 space-y-8">
                        <section className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3 uppercase italic">
                                <Layers className="w-5 h-5 text-indigo-500" /> 机构可用权限
                            </h3>
                            <div className="space-y-4">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {organization.orgLicenses.map((license: any) => (
                                    <div key={license.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-all">
                                        <div className="font-black text-slate-800 text-sm mb-2 uppercase">{license.series.name}</div>
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black text-slate-400 uppercase">席位使用情况</div>
                                                <div className="text-xl font-black text-indigo-600 tabular-nums">
                                                    {license.usedSeats} / <span className="text-slate-300">{license.totalSeats}</span>
                                                </div>
                                            </div>
                                            <div className="text-[9px] font-black text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">
                                                有效期至: {new Date(license.expiresAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${(license.usedSeats / license.totalSeats) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Quick Assign Form */}
                        <section className="bg-slate-900 p-8 rounded-[32px] shadow-2xl text-white">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-3 uppercase italic">
                                <Plus className="w-5 h-5 text-indigo-400" /> 快捷授权分拨
                            </h3>
                            <form action={async (formData) => {
                                'use server';
                                const teacherId = formData.get('teacherId') as string;
                                const courseId = formData.get('courseId') as string;
                                const seats = parseInt(formData.get('seats') as string);
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const session = await getServerSession(authOptions) as any;

                                try {
                                    await assignCourseToTeacher(session.user.orgId, teacherId, courseId, seats);
                                } catch (e: any) {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    console.error((e as any).message);
                                }
                            }} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">选择老师</label>
                                    <select name="teacherId" className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-4 font-black uppercase focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {organization.users.map((u: any) => (
                                            <option key={u.id} value={u.id}>{u.name || u.username}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">选择分发课程</label>
                                    <select name="courseId" className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-4 font-black uppercase focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {organization.orgLicenses.flatMap((l: any) => l.series.courses).map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">分发名额数量</label>
                                    <input name="seats" type="number" defaultValue="10" className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-4 font-black focus:border-indigo-500 transition-all outline-none" />
                                </div>
                                <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase text-sm tracking-widest mt-4">
                                    立即确认分拨 <ArrowRight className="w-5 h-5" />
                                </button>
                            </form>
                        </section>
                    </div>

                    {/* Right Column: Allocation Status */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-2xl font-black italic tracking-tight text-slate-900 border-l-8 border-indigo-600 pl-6 uppercase">教师名额矩阵</h2>
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation Matrix</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 italic">
                                            <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">授课老师</th>
                                            <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">授权课程名称</th>
                                            <th className="text-center py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">已获总席位</th>
                                            <th className="text-center py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">已使用学生数</th>
                                            <th className="text-right py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">课程详情</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {teacherLicenses.length > 0 ? teacherLicenses.map((tl: any) => (
                                            <tr key={tl.id} className="hover:bg-slate-50/50 transition-all group">
                                                <td className="py-6 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs uppercase shadow-lg">
                                                            {tl.teacher.name?.[0] || tl.teacher.username?.[0]}
                                                        </div>
                                                        <span className="font-black text-slate-900">{tl.teacher.name || tl.teacher.username}</span>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-black inline-block border border-indigo-100 uppercase">
                                                        {tl.course.name}
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4 text-center">
                                                    <span className="font-black text-lg text-slate-900 tabular-nums">{tl.allocatedSeats}</span>
                                                </td>
                                                <td className="py-6 px-4 text-center">
                                                    <span className="font-black text-lg text-blue-500 tabular-nums">{tl.usedSeats}</span>
                                                </td>
                                                <td className="py-6 px-4 text-right">
                                                    <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all">
                                                        <Info className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                                        <BookOpen className="w-16 h-16" />
                                                        <span className="text-xs font-black uppercase tracking-widest">尚未进行任何教师分拨</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
