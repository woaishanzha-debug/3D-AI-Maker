'use client';

import { useState } from 'react';
import { Key, Power, Trash2, ChevronRight, ChevronDown, Ticket, School, Info, Copy, Crown, GraduationCap, PlusCircle, XCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeTreeProps {
    organizations: any[];
    courseSeries: any[];
    onToggle: (id: string, status: string, name?: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onDeleteOrg: (id: string) => Promise<void>;
    onAddTeacher: (formData: FormData) => Promise<void>;
    onAllocateCourse: (formData: FormData) => Promise<void>;
}

export default function CodeTree({ organizations, courseSeries, onToggle, onDelete, onDeleteOrg, onAddTeacher, onAllocateCourse }: CodeTreeProps) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [infoIds, setInfoIds] = useState<Set<string>>(new Set());
    const [showAddModal, setShowAddModal] = useState<string | null>(null);
    const [showAllocateModal, setShowAllocateModal] = useState<string | null>(null);
    const [isToggling, setIsToggling] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) next.delete(id); else next.add(id);
        setExpandedIds(next);
    };

    const toggleInfo = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = new Set(infoIds);
        if (next.has(id)) next.delete(id); else next.add(id);
        setInfoIds(next);
    };

    const copyToClipboard = (text: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        alert('已复制: ' + text);
    };

    const handleToggleInternal = async (id: string, currentStatus: string, operatorName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setIsToggling(id);
        try {
            await onToggle(id, currentStatus, operatorName);
        } finally {
            setIsToggling(null);
        }
    };

    return (
        <div className="flex-1 overflow-x-auto rounded-[40px] border border-slate-200 bg-white shadow-2xl relative">
            <div className="min-w-[1000px]">
                {/* 顶部标题栏 */}
                <div className="grid grid-cols-12 bg-slate-900 py-6 px-8 sticky top-0 font-black text-[10px] text-slate-500 uppercase tracking-widest z-10 italic">
                    <div className="col-span-5">层级归属 (机构 / 校长 / 老师 / 学生)</div>
                    <div className="col-span-2">分发账户 (KEY)</div>
                    <div className="col-span-2 text-center">预设密码 (PASS)</div>
                    <div className="col-span-3 text-right">状态管控与操作 (STATUS)</div>
                </div>

                <div className="divide-y divide-slate-100">
                    {organizations.map((org) => {
                        const orgId = `org-${org.id}`;
                        const isOrgExpanded = expandedIds.has(orgId);
                        const allUsers = org.users || [];
                        const principals = allUsers.filter((u: any) => u.role === 'ORG_ADMIN');
                        const teachers = allUsers.filter((u: any) => u.role === 'TEACHER');

                        return (
                            <div key={org.id} className="bg-white">
                                {/* LEVEL 0: Organization Row */}
                                <div
                                    className={cn(
                                        "grid grid-cols-12 py-6 px-8 items-center hover:bg-slate-50 transition-all cursor-pointer group",
                                        isOrgExpanded && "bg-slate-50/50 border-b border-dashed border-slate-100"
                                    )}
                                    onClick={() => toggleExpand(orgId)}
                                >
                                    <div className="col-span-12 px-8 pb-4 flex flex-wrap gap-2">
                                        {org.orgLicenses?.map((lic: any) => (
                                            <div key={lic.id} className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[9px] font-black uppercase">
                                                <Zap className="w-3 h-3" />
                                                {lic.series?.name} ({lic.usedSeats}/{lic.totalSeats})
                                            </div>
                                        ))}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowAllocateModal(org.id); }}
                                            className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9px] font-black uppercase rounded-lg transition-all"
                                        >
                                            <PlusCircle className="w-3 h-3" /> 点亮课程体系
                                        </button>
                                    </div>

                                    <div className="col-span-5 flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            {isOrgExpanded ? <ChevronDown className="w-6 h-6 text-slate-600" /> : <ChevronRight className="w-6 h-6 text-slate-300" />}
                                            <div className="p-3 bg-slate-900 rounded-[20px] shadow-xl">
                                                <School className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 text-xl tracking-tight">{org.name}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('确定注销整个机构吗？')) onDeleteOrg(org.id);
                                            }}
                                            className="p-2 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="col-span-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowAddModal(org.id); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded-xl shadow-lg active:scale-95 transition-all"
                                        >
                                            <PlusCircle className="w-4 h-4" /> 扩容此机构
                                        </button>
                                    </div>
                                    <div className="col-span-2"></div>
                                    <div className="col-span-3 text-right">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ORG_ADMIN_ROOT</span>
                                    </div>
                                </div>

                                {isOrgExpanded && (
                                    <div className="ml-12 border-l-4 border-slate-100">
                                        {/* 渲染校长号 */}
                                        {principals.map((p: any) => (
                                            <AccountNode
                                                key={p.id}
                                                node={p}
                                                allCodes={allUsers}
                                                parentId={orgId}
                                                {...{ toggleExpand, toggleInfo, copyToClipboard, handleToggleInternal, onDelete, isToggling, expandedIds, infoIds }}
                                            />
                                        ))}
                                        {/* 渲染老师号 (如果没有关联校长) */}
                                        {teachers.filter((t: any) => !t.teacherId).map((t: any) => (
                                            <AccountNode
                                                key={t.id}
                                                node={t}
                                                allCodes={allUsers}
                                                parentId={orgId}
                                                {...{ toggleExpand, toggleInfo, copyToClipboard, handleToggleInternal, onDelete, isToggling, expandedIds, infoIds }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[999] flex items-center justify-center p-6">
                    <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-lg overflow-hidden border border-white">
                        <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">执行扩容分发</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Instant Expansion Protocol</p>
                            </div>
                            <button onClick={() => setShowAddModal(null)} className="p-3 hover:bg-white/10 rounded-full transition-all"><XCircle className="w-8 h-8" /></button>
                        </div>
                        <form action={async (formData) => {
                            formData.append('orgId', showAddModal);
                            await onAddTeacher(formData);
                            setShowAddModal(null);
                        }} className="p-10 space-y-8">
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">设置登录识别码</label>
                                    <input name="loginUsername" type="text" placeholder="LOGIN KEY" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-5 font-black uppercase focus:border-blue-500 focus:bg-white transition-all outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">初始登录私钥</label>
                                    <input name="initialPassword" type="text" placeholder="INITIAL PASS" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-5 font-black focus:border-blue-500 focus:bg-white transition-all outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">携带学生激活码数</label>
                                    <input name="studentQuota" type="number" min="0" max="200" defaultValue="20" className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-5 font-black focus:border-blue-500 focus:bg-white transition-all outline-none" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl shadow-2xl hover:bg-blue-700 active:scale-95 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-3">
                                <PlusCircle className="w-5 h-5" /> 立即生成并行账号
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Course Allocation Modal */}
            {showAllocateModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[999] flex items-center justify-center p-6">
                    <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-lg overflow-hidden border border-white">
                        <div className="p-10 bg-blue-600 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">点亮课程体系</h3>
                                <p className="text-[10px] font-bold text-blue-200 mt-1 uppercase">Course Series Authorization</p>
                            </div>
                            <button onClick={() => setShowAllocateModal(null)} className="p-3 hover:bg-white/10 rounded-full transition-all"><XCircle className="w-8 h-8" /></button>
                        </div>
                        <form action={async (formData) => {
                            formData.append('orgId', showAllocateModal);
                            await onAllocateCourse(formData);
                            setShowAllocateModal(null);
                        }} className="p-10 space-y-8">
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">选择课程体系</label>
                                    <select name="seriesId" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-5 font-black focus:border-blue-500 focus:bg-white transition-all outline-none appearance-none">
                                        <option value="">请选择体系...</option>
                                        {courseSeries.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">授权激活数 (席位)</label>
                                    <input name="seats" type="number" min="1" max="10000" defaultValue="100" className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-5 font-black focus:border-blue-500 focus:bg-white transition-all outline-none" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl shadow-2xl hover:bg-blue-700 active:scale-95 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-3">
                                <Zap className="w-5 h-5" /> 立即激活授权
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function AccountNode({ node, allCodes, parentId, toggleExpand, toggleInfo, copyToClipboard, handleToggleInternal, onDelete, isToggling, expandedIds, infoIds }: any) {
    const nodeId = `node-${node.id}`;
    const isExpanded = expandedIds.has(nodeId);
    const isInfoVisible = infoIds.has(nodeId);
    const isPrincipal = node.role === 'ORG_ADMIN';
    const isTeacher = node.role === 'TEACHER';

    // 找出以此节点为父节点的子节点
    // 如果是校长，子节点是老师 (User)
    // 如果是老师，子节点是激活码 (InvitationCode)
    const children = (allCodes || []).filter((c: any) => {
        if (isPrincipal) return c.role === 'TEACHER' && c.teacherId === node.id;
        if (isTeacher) return !c.role && c.teacherId === node.id;
        return false;
    });

    // 这里的 code 显示改为 username
    const displayCode = node.username || node.code;

    return (
        <div className={cn("border-l-4 transition-all", isPrincipal ? "border-amber-400" : (isTeacher ? "border-indigo-400" : "border-slate-300"))}>
            <div
                className={cn(
                    "grid grid-cols-12 py-5 px-8 items-center hover:bg-white transition-all cursor-pointer group border-b border-slate-50",
                    isExpanded && "bg-slate-50/30"
                )}
                onClick={() => toggleExpand(nodeId)}
            >
                <div className="col-span-5 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        {children.length > 0 ? (isExpanded ? <ChevronDown className="w-4 h-4 text-slate-600" /> : <ChevronRight className="w-4 h-4 text-slate-300" />) : <div className="w-4" />}
                        <div className={cn("p-2 rounded-xl text-white shadow-lg", isPrincipal ? "bg-amber-500" : "bg-indigo-500")}>
                            {isPrincipal ? <Crown className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-black text-slate-800 text-base uppercase">
                                {isPrincipal ? '校长管理号' : '机构老师号'} {node.name ? `(${node.name})` : ''}
                            </span>
                            <button onClick={(e) => toggleInfo(nodeId, e)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-300 hover:text-slate-600 transition-all">
                                <Info className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('彻底删除此账号？')) onDelete(node.id);
                                }}
                                className="p-1.5 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-span-2 font-mono font-black text-blue-600 text-sm flex items-center gap-2">
                    {displayCode}
                    <button onClick={(e) => copyToClipboard(displayCode, e)} className="text-slate-200 hover:text-blue-500 transition-all">
                        <Copy className="w-4 h-4" />
                    </button>
                </div>

                <div className="col-span-2 font-mono font-bold text-slate-500 text-sm text-center">
                    {node.initialPassword || '---'}
                </div>

                <div className="col-span-3 flex justify-end">
                    <button
                        disabled={isToggling === node.id}
                        onClick={(e) => handleToggleInternal(node.id, 'ACTIVE', isPrincipal ? '校长' : '管理员', e)}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-2 border shadow-lg active:scale-95",
                            true // 暂时都显示正常
                                ? 'bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-500/10'
                                : 'bg-rose-500 text-white border-rose-600 ring-4 ring-rose-500/10',
                            isToggling === node.id && "opacity-50 cursor-wait"
                        )}
                    >
                        <Power className="w-4 h-4" />
                        {'正常运行中'}
                    </button>
                </div>
            </div>

            {isInfoVisible && (
                <div className="ml-20 mr-10 my-4 p-6 bg-slate-900 text-white rounded-[32px] shadow-2xl flex flex-wrap gap-10 text-[11px] font-black border-l-8 border-blue-500">
                    <div className="flex items-center gap-2 italic uppercase text-slate-500">创建日期: {new Date(node.createdAt).toLocaleString()}</div>
                    <div className="flex items-center gap-2 font-black tracking-widest uppercase">角色: {node.role}</div>
                </div>
            )}

            {isExpanded && children.length > 0 && (
                <div className="ml-16 border-l-2 border-dashed border-slate-200">
                    {children.map((child: any) => (
                        (!child.role) ? ( // 激活码没有 role
                            <div key={child.id} className="grid grid-cols-12 py-4 px-8 items-center bg-white border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-all group">
                                <div className="col-span-5 flex items-center gap-3 pl-4">
                                    <div className="w-3 h-3 rounded-full bg-indigo-50" />
                                    <span className="text-[10px] font-black text-slate-400 italic flex items-center gap-2">
                                        <Ticket className="w-3.5 h-3.5" /> 学生激活码
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('删除此学生激活码？')) onDelete(child.id);
                                        }}
                                        className="p-1 text-slate-100 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="col-span-2 font-mono text-xs font-black text-indigo-500">{child.code}</div>
                                <div className="col-span-2 text-center text-[10px] font-black text-slate-300 tabular-nums">
                                    使用: {child.usedCount} / {child.maxUses}
                                </div>
                                <div className="col-span-3 flex justify-end">
                                    <div className="px-4 py-1.5 rounded-full text-[9px] font-black transition-all border bg-emerald-50 text-emerald-600 border-emerald-200">
                                        有效
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <AccountNode
                                key={child.id}
                                node={child}
                                allCodes={allCodes}
                                parentId={nodeId}
                                {...{ toggleExpand, toggleInfo, copyToClipboard, handleToggleInternal, onDelete, isToggling, expandedIds, infoIds }}
                            />
                        )
                    ))}
                </div>
            )}
        </div>
    );
}

