import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CreditCard, History, Clock, Package, Share2, Award, Users, GraduationCap, Sparkles, BookOpen, ArrowRight, ShieldAlert, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import ChangePasswordForm from '../../components/dashboard/ChangePasswordForm';
import DashboardCodeTree from '../../components/dashboard/DashboardCodeTree';

// Define types to avoid 'any'
interface CustomUser {
    id: string;
    name?: string;
    username?: string;
    role: string;
    credits: number;
    orgId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toolHistories?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    posts?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    usedInvitationCode?: any;
}

// 简单实现 cn 函数以避免导入问题
function cn(...inputs: (string | boolean | undefined | null | { [key: string]: boolean })[]) {
    return inputs.filter(Boolean).map(item => {
        if (typeof item === 'object' && item !== null) {
            return Object.entries(item).filter(([, v]) => v).map(([k]) => k).join(' ');
        }
        return item;
    }).join(' ');
}

// --- Server Actions ---
async function toggleStatus(id: string, current: string, operator: string = 'System') {
    'use server'
    const newStatus = current === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';

    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma.user as any).update({
            where: { id },
            data: {
                status: newStatus,
                disabledBy: newStatus === 'DISABLED' ? operator : null
            }
        });
    } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma.invitationCode as any).update({
            where: { id },
            data: {
                status: newStatus,
                disabledBy: newStatus === 'DISABLED' ? operator : null
            }
        });
    }
    revalidatePath('/dashboard');
}

async function deleteSubCode(id: string) {
    'use server'
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
        if (user.role === 'TEACHER') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (prisma.invitationCode as any).deleteMany({ where: { teacherId: id } });
        }
        await prisma.user.delete({ where: { id } });
    } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma.invitationCode as any).delete({ where: { id } });
    }
    revalidatePath('/dashboard');
}

async function addTeacherToOrgAction(formData: FormData) {
    'use server'
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return;

    const orgId = formData.get('orgId') as string;
    const loginUsername = formData.get('loginUsername') as string;
    const initialPassword = formData.get('initialPassword') as string;
    const studentQuota = parseInt(formData.get('studentQuota') as string || '0');

    if (!orgId || !loginUsername || !initialPassword) return;

    const hashedPassword = await bcrypt.hash(initialPassword, 10);
    const principalId = (session.user as CustomUser).id;

    // 1. 创建讲师账号
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teacher = await (prisma.user as any).create({
        data: {
            username: loginUsername,
            password: hashedPassword,
            initialPassword: initialPassword,
            name: `机构讲师 (${loginUsername})`,
            role: 'TEACHER',
            orgId: orgId,
            teacherId: principalId,
            credits: 1000
        }
    });

    // 2. 为讲解生成学生激活码
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaultCourse = await (prisma.course as any).findFirst();
    if (defaultCourse) {
        for (let j = 0; j < studentQuota; j++) {
            const sCode = `S-${loginUsername}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (prisma.invitationCode as any).create({
                data: {
                    code: sCode,
                    teacherId: teacher.id,
                    courseId: defaultCourse.id,
                    maxUses: 1,
                    initialPassword: '无'
                }
            });
        }
    }
    revalidatePath('/dashboard');
}

async function assignCourseToTeacherAction(formData: FormData) {
    'use server'
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return;

    const teacherId = formData.get('teacherId') as string;
    const courseAndLicense = formData.get('courseAndLicense') as string;
    const seats = parseInt(formData.get('seats') as string || '0');

    if (!teacherId || !courseAndLicense || !seats) return;

    const [courseId, orgLicenseId] = courseAndLicense.split('|');

    if (!courseId || !orgLicenseId) return;

    // 1. 创建 TeacherLicense
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.teacherLicense as any).create({
        data: {
            teacherId,
            courseId,
            allocatedSeats: seats,
            usedSeats: 0
        }
    });

    // 2. 更新 OrgLicense 的已用席位
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.orgLicense as any).update({
        where: { id: orgLicenseId },
        data: {
            usedSeats: {
                increment: seats
            }
        }
    });

    revalidatePath('/dashboard');
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect('/login');
    }

    const customUser = session.user as CustomUser;
    const role = customUser.role;
    const userId = customUser.id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const includeOptions: any = {
        toolHistories: {
            orderBy: { createdAt: 'desc' },
            take: 5
        },
        posts: {
            orderBy: { createdAt: 'desc' },
            take: 3
        }
    };

    // Only include student-specific relations if they are a student
    if (role === 'STUDENT') {
        includeOptions.usedInvitationCode = {
            include: {
                course: {
                    include: {
                        series: true
                    }
                }
            }
        };
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: includeOptions
    }) as unknown as CustomUser;

    if (!user) {
        redirect('/login');
    }

    // 获取该账户下的组织完整结构 (如果是校长或老师)
    let organization = null;
    if (user.orgId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const orgData = await (prisma.organization as any).findUnique({
            where: { id: user.orgId },
            include: {
                users: {
                    include: {
                        createdCodes: {
                            include: {
                                course: true
                            }
                        },
                        teacherLicenses: {
                            include: {
                                course: true
                            }
                        }
                    }
                },
                orgLicenses: {
                    include: {
                        series: {
                            include: {
                                courses: true
                            }
                        }
                    }
                }
            }
        });

        if (orgData) {
            // 提取所有激活码并扁平化
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const allInvitationCodes = (orgData.users || []).flatMap((u: any) => u.createdCodes || []);

            // 为了兼容 CodeTree，我们将 invitationCodes 混入 users 列表中
            organization = {
                ...orgData,
                users: [...(orgData.users || []), ...allInvitationCodes]
            };

            // 数据沙盒化：如果是老师，只能看到自己这一支（自己和自己名下的激活码）
            if (user.role === 'TEACHER') {
                const myTeacherId = user.id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                organization.users = organization.users.filter((item: any) => {
                    // 1. 如果是用户，必须是老师本人
                    if (item.role) return item.id === myTeacherId;
                    // 2. 如果是激活码，必须是老师生成的
                    return item.teacherId === myTeacherId;
                });
            }
        }
    }

    const isTeacher = user.role === 'TEACHER' || user.role === 'ORG_ADMIN' || user.role === 'SUPER_ADMIN';

    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-24 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-20">
                {/* Header: User Info & Role Badge */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm relative">
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">HAVE FUN, {user.name || user.username || 'MAKER'}</h1>
                            <span className={cn(
                                "px-4 py-1 text-[10px] font-black rounded-full border-2 uppercase tracking-[0.2em] transform -rotate-2",
                                user.role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-600 border-red-200' :
                                    user.role === 'TEACHER' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                        user.role === 'ORG_ADMIN' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                            'bg-slate-50 text-slate-600 border-slate-200'
                            )}>
                                {user.role}
                            </span>
                        </div>
                        <p className="text-slate-500 font-medium text-lg">欢迎来到数字创客实验室。管理你的资产、课堂与最新的创意项目。</p>

                        {/* 修改密码项 */}
                        <div className="pt-2">
                            <ChangePasswordForm />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-6 bg-blue-50 border-2 border-blue-100 px-8 py-5 rounded-[28px] shadow-xl shadow-blue-500/5 group hover:bg-white transition-all cursor-default">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1 opacity-60">AI 创客资产 (Credits)</div>
                                <div className="text-3xl font-black text-slate-900 tracking-tight">{user.credits} <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Coins</span></div>
                            </div>
                        </div>

                        {/* Mobile & Tablet Shortcuts */}
                        <div className="grid grid-cols-2 gap-3">
                            {(user.role === 'SUPER_ADMIN' || user.role === 'ORG_ADMIN') && (
                                <Link href="/admin" className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col items-center gap-2 hover:bg-black transition-all">
                                    <ShieldAlert className="w-6 h-6 text-blue-400" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">管理控制台</span>
                                </Link>
                            )}
                            {(user.role === 'SUPER_ADMIN' || user.role === 'ORG_ADMIN' || user.role === 'TEACHER') && (
                                <button
                                    onClick={() => alert('已为您在顶栏菜单（右上角三横杠）中激活“商务合作签约”通道，请点击查看。')}
                                    className="p-4 rounded-2xl bg-white border-2 border-slate-100 flex flex-col items-center gap-2 hover:border-blue-500 transition-all text-slate-900"
                                >
                                    <BadgeCheck className="w-6 h-6 text-blue-600" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">商务授权</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Teacher/Principal Specific View: Sub-Code Management (Tree View) */}
                {isTeacher && organization && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black italic tracking-tight text-slate-900 uppercase">树形组织架构管理</h2>
                                    <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">Hierarchy & Token Management</p>
                                </div>
                            </div>
                        </div>

                        <DashboardCodeTree
                            organization={organization}
                            currentUser={user}
                            onToggle={toggleStatus}
                            onDelete={deleteSubCode}
                            onAddTeacher={addTeacherToOrgAction}
                            onAssignCourse={assignCourseToTeacherAction}
                        />
                    </div>
                )}

                {/* Student Specific View: My Course Context */}
                {user.role === 'STUDENT' && user.usedInvitationCode && (
                    <div className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                            <div className="p-3 bg-blue-50 rounded-2xl">
                                <GraduationCap className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black italic tracking-tight text-slate-900 uppercase">我的授权课程系统</h2>
                                <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">Authorized Curriculum Context</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 group hover:bg-white hover:border-blue-200 transition-all">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">当前课程体系 Series</div>
                                <div className="text-2xl font-black text-slate-900 italic tracking-tight group-hover:text-blue-600 transition-colors">
                                    {user.usedInvitationCode.course.series.name}
                                </div>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 group hover:bg-white hover:border-emerald-200 transition-all">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">激活课程模块 Module</div>
                                <div className="text-2xl font-black text-emerald-600 italic tracking-tight">
                                    {user.usedInvitationCode.course.name}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Link href={
                                user.usedInvitationCode.course.series.id === 'maker-l1' ? '/course/maker' :
                                    user.usedInvitationCode.course.series.id === 'maker-l2' ? '/course/maker' :
                                        user.usedInvitationCode.course.series.id === 'maker-l3' ? '/course/maker' :
                                            user.usedInvitationCode.course.series.id === 'ai-interactive' ? '/course/ai' :
                                                user.usedInvitationCode.course.series.id === '3d-printing' ? '/course/3d' : '/'
                            }>
                                <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl group">
                                    <BookOpen className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 立即进入课程中心 <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: General Records */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-2xl font-black italic tracking-tight text-slate-900 flex items-center gap-3 uppercase">
                                    <History className="w-6 h-6 text-blue-600" /> 最近创作足迹
                                </h2>
                                <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full">Recent Trails</span>
                            </div>

                            {user.toolHistories && user.toolHistories.length > 0 ? (
                                <div className="space-y-4">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {user.toolHistories.map((log: any) => (
                                        <div key={log.id} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:border-blue-200 transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <Clock className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 uppercase tracking-tight mb-0.5">{log.toolType}</div>
                                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(log.createdAt).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div className="text-lg font-black text-red-500 bg-red-50 px-4 py-2 rounded-2xl border border-red-100">-{log.creditCost} Coins</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100 overflow-hidden relative">
                                    <Package className="w-16 h-16 mx-auto mb-4 text-slate-200 opacity-20" />
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">暂无生成记录 No Explorer Footprints</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Gallery & Badges */}
                    <div className="space-y-8">
                        <div className="bg-white p-10 rounded-[40px] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
                            <h2 className="text-xl font-black italic tracking-tight text-slate-900 mb-8 flex items-center gap-3 uppercase">
                                <Share2 className="w-5 h-5 text-indigo-600" /> 我的作品展示
                            </h2>

                            {user.posts && user.posts.length > 0 ? (
                                <div className="space-y-6">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {user.posts.map((post: any) => (
                                        <Link key={post.id} href={`/gallery`} className="block group/item">
                                            <div className="relative aspect-video rounded-[24px] overflow-hidden border-2 border-slate-100 shadow-lg group-hover/item:-translate-y-1 transition-transform">
                                                {post.coverImageUrl && (
                                                    <Image
                                                        src={post.coverImageUrl}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover group-hover/item:scale-105 transition-transform"
                                                        sizes="(max-width: 768px) 100vw, 33vw"
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent">
                                                    <div className="absolute bottom-4 left-5 right-5 text-white">
                                                        <div className="text-xs font-black italic truncate uppercase tracking-tight">{post.title}</div>
                                                        <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Showcase Entry</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4">尚未开启作品集</p>
                                    <button className="px-6 py-3 bg-white border border-slate-200 text-[10px] text-slate-900 font-black rounded-xl hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest shadow-sm">
                                        上传首份成果
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[40px] shadow-2xl shadow-blue-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <Sparkles className="w-8 h-8 text-white/20" />
                            </div>
                            <h2 className="text-xl font-black italic tracking-tight text-white mb-6 flex items-center gap-3 uppercase">
                                <Award className="w-5 h-5 text-yellow-400" /> 荣耀徽章
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                <div className="px-4 py-2 bg-white/10 backdrop-blur-md text-white text-[10px] font-black rounded-2xl border border-white/20 italic uppercase tracking-widest">
                                    S1 光影学徒
                                </div>
                                <div className="px-4 py-2 bg-black/10 text-white/30 text-[10px] font-black rounded-2xl border border-white/5 italic uppercase tracking-widest">
                                    S2 未开启
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
