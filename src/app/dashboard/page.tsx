import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CreditCard, History, Clock, Package, Share2, Award, Users, PlusCircle, GraduationCap, Sparkles, Ticket, Power, Trash2, XCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { revalidatePath } from 'next/cache';
import ChangePasswordForm from '../../components/dashboard/ChangePasswordForm';
import DashboardCodeTree from '../../components/dashboard/DashboardCodeTree';

// 简单实现 cn 函数以避免导入问题
function cn(...inputs: (string | boolean | undefined | null | { [key: string]: boolean })[]) {
    return inputs.filter(Boolean).map(item => {
        if (typeof item === 'object') {
            return Object.entries(item!).filter(([, v]) => v).map(([k]) => k).join(' ');
        }
        return item;
    }).join(' ');
}

// --- Server Actions ---
async function toggleStatus(id: string, current: string, operator: string) {
    'use server'
    const newStatus = current === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    await (prisma as any).invitationCode.update({
        where: { id },
        data: {
            status: newStatus,
            disabledBy: newStatus === 'DISABLED' ? operator : null
        }
    });
    revalidatePath('/dashboard');
}

async function deleteSubCode(id: string) {
    'use server'
    // 递归删除子级
    await (prisma as any).$executeRawUnsafe(`DELETE FROM "InvitationCode" WHERE "parentId" = ?`, id);
    await (prisma as any).invitationCode.delete({ where: { id } });
    revalidatePath('/dashboard');
}

async function addTeacherToOrgAction(formData: FormData) {
    'use server'
    const orgId = formData.get('orgId') as string;
    const loginUsername = formData.get('loginUsername') as string;
    const initialPassword = formData.get('initialPassword') as string;
    const studentQuota = parseInt(formData.get('studentQuota') as string || '0');

    if (!orgId || !loginUsername || !initialPassword) return;

    const tId = `tr${Math.random().toString(36).substring(2, 15)}`;
    const tCode = loginUsername.toUpperCase();

    // 寻找该机构下的校长账号作为父级
    const principal = await (prisma as any).invitationCode.findFirst({
        where: { organizationId: orgId, type: 'PRINCIPAL' }
    });

    await (prisma as any).$executeRawUnsafe(
        `INSERT INTO "InvitationCode" ("id", "code", "type", "organizationId", "parentId", "status", "initialPassword", "createdAt") 
         VALUES (?, ?, 'TEACHER', ?, ?, 'ACTIVE', ?, CURRENT_TIMESTAMP)`,
        tId, tCode, orgId, principal?.id || null, initialPassword
    );

    for (let j = 0; j < studentQuota; j++) {
        const sId = `st${Math.random().toString(36).substring(2, 15)}`;
        const sCode = `S-${tCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        await (prisma as any).$executeRawUnsafe(
            `INSERT INTO "InvitationCode" ("id", "code", "type", "organizationId", "parentId", "status", "createdAt") 
             VALUES (?, ?, 'STUDENT', ?, ?, 'ACTIVE', CURRENT_TIMESTAMP)`,
            sId, sCode, orgId, tId
        );
    }
    revalidatePath('/dashboard');
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect('/login');
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            toolHistories: {
                orderBy: { createdAt: 'desc' },
                take: 5
            },
            posts: {
                orderBy: { createdAt: 'desc' },
                take: 3
            }
        }
    }) as any;

    if (!user) {
        redirect('/login');
    }

    // 获取该账户下的组织完整结构 (如果是校长或老师)
    let organization = null;
    if (user.organizationId) {
        organization = await (prisma as any).organization.findUnique({
            where: { id: user.organizationId },
            include: {
                invitationCodes: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        // 数据沙盒化：普通老师只能看到自己那一支的树，校长看全貌
        if (organization && user.role === 'TEACHER' && user.usedInvitationCodeId) {
            organization.invitationCodes = organization.invitationCodes.filter((c: any) =>
                c.id === user.usedInvitationCodeId || c.parentId === user.usedInvitationCodeId
            );
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

                    <div className="flex items-center gap-6 bg-blue-50 border-2 border-blue-100 px-8 py-5 rounded-[28px] shadow-xl shadow-blue-500/5 group hover:bg-white transition-all cursor-default">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1 opacity-60">AI 创客资产 (Credits)</div>
                            <div className="text-3xl font-black text-slate-900 tracking-tight">{user.credits} <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Coins</span></div>
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
                        />
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
