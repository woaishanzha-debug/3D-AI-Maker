'use client';

import { useState } from 'react';
import { Power, Trash2, ChevronRight, ChevronDown, Ticket, School, Info, Copy, Crown, GraduationCap, PlusCircle, XCircle, Sparkles } from 'lucide-react';

// 简单实现 cn 函数以避免导入问题
function cn(...inputs: (string | boolean | undefined | null | { [key: string]: boolean })[]) {
    return inputs.filter(Boolean).map(item => {
        if (typeof item === 'object') {
            return Object.entries(item!).filter(([, v]) => v).map(([k]) => k).join(' ');
        }
        return item;
    }).join(' ');
}

interface DashboardCodeTreeProps {
    organization: any;
    currentUser: any;
    onToggle: (id: string, status: string, name: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onAddTeacher: (formData: FormData) => Promise<void>;
    onAssignCourse: (formData: FormData) => Promise<void>;
}

export default function DashboardCodeTree({ organization, currentUser, onToggle, onDelete, onAddTeacher, onAssignCourse }: DashboardCodeTreeProps) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([`org-${organization.id}`]));
    const [infoIds, setInfoIds] = useState<Set<string>>(new Set());
    const [isToggling, setIsToggling] = useState<string | null>(null);
    const [showAssignModal, setShowAssignModal] = useState<{ teacherId: string, teacherName: string } | null>(null);

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

    const handleToggleInternal = async (id: string, currentStatus: string, operatorRole: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setIsToggling(id);
        try {
            // 操作者名称：优先使用真实姓名，否则用户名，否则角色名
            const opName = currentUser.name || currentUser.username || currentUser.role;
            await onToggle(id, currentStatus, opName);
        } finally {
            setIsToggling(null);
        }
    };

    const allUsers = organization.users || [];
    const principals = allUsers.filter((u: any) => u.role === 'ORG_ADMIN');
    const teachers = allUsers.filter((u: any) => u.role === 'TEACHER');

    return (
        <div className="flex-1 overflow-x-auto rounded-[40px] border border-slate-200 bg-white shadow-2xl relative">
            <div className="min-w-[900px]">
                {/* 顶部标题栏 */}
                <div className="grid grid-cols-12 bg-slate-900 py-6 px-8 sticky top-0 font-black text-[10px] text-slate-500 uppercase tracking-widest z-10 italic">
                    <div className="col-span-5">层级归属 (机构 / 校长 / 老师 / 学生)</div>
                    <div className="col-span-2">分发账户 (KEY)</div>
                    <div className="col-span-2 text-center">预设密码 (PASS)</div>
                    <div className="col-span-3 text-right">状态管控与操作 (STATUS)</div>
                </div>

                <div className="divide-y divide-slate-100">
                    <div className="bg-white">
                        {/* LEVEL 0: Organization Row */}
                        <div
                            className={cn(
                                "grid grid-cols-12 py-6 px-8 items-center hover:bg-slate-50 transition-all cursor-pointer group",
                                expandedIds.has(`org-${organization.id}`) && "bg-slate-50/50 border-b border-dashed border-slate-100"
                            )}
                            onClick={() => toggleExpand(`org-${organization.id}`)}
                        >
                            <div className="col-span-5 flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {expandedIds.has(`org-${organization.id}`) ? <ChevronDown className="w-6 h-6 text-slate-600" /> : <ChevronRight className="w-6 h-6 text-slate-300" />}
                                    <div className="p-3 bg-slate-900 rounded-[20px] shadow-xl">
                                        <School className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-black text-slate-900 text-xl tracking-tight">{organization.name}</span>
                                </div>
                            </div>
                            <div className="col-span-2">
                            </div>
                            <div className="col-span-2"></div>
                            <div className="col-span-3 text-right">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                                    {currentUser.role} CONTROL PANEL
                                </span>
                            </div>
                        </div>

                        {expandedIds.has(`org-${organization.id}`) && (
                            <div className="ml-12 border-l-4 border-slate-100">
                                {/* 渲染校长号 */}
                                {principals.map((p: any) => (
                                    <AccountNode
                                        key={p.id}
                                        node={p}
                                        allCodes={allUsers}
                                        parentId={`org-${organization.id}`}
                                        currentUser={currentUser}
                                        organization={organization}
                                        setShowAssignModal={setShowAssignModal}
                                        {...{ toggleExpand, toggleInfo, copyToClipboard, handleToggleInternal, onDelete: () => Promise.resolve(), isToggling, expandedIds, infoIds }}
                                    />
                                ))}
                                {/* 渲染教师号 (如果是老师本人，或者该老师没有关联校长) */}
                                {teachers.filter((t: any) => {
                                    if (currentUser.role === 'TEACHER') return t.id === currentUser.id;
                                    return !t.teacherId;
                                }).map((t: any) => (
                                    <AccountNode
                                        key={t.id}
                                        node={t}
                                        allCodes={allUsers}
                                        parentId={`org-${organization.id}`}
                                        currentUser={currentUser}
                                        organization={organization}
                                        setShowAssignModal={setShowAssignModal}
                                        {...{ toggleExpand, toggleInfo, copyToClipboard, handleToggleInternal, onDelete: () => Promise.resolve(), isToggling, expandedIds, infoIds }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Assign Course Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[999] flex items-center justify-center p-6">
                    <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-lg overflow-hidden border border-white">
                        <div className="p-10 bg-indigo-600 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">分配并点亮课程</h3>
                                <p className="text-[10px] font-bold text-indigo-200 mt-1 uppercase">Course Assignment Protocol</p>
                            </div>
                            <button onClick={() => setShowAssignModal(null)} className="p-3 hover:bg-white/10 rounded-full transition-all"><XCircle className="w-8 h-8" /></button>
                        </div>
                        <form action={async (formData) => {
                            formData.append('teacherId', showAssignModal.teacherId);
                            await onAssignCourse(formData);
                            setShowAssignModal(null);
                        }} className="p-10 space-y-8">
                            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 italic">
                                <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">正在为以下教师分配 (To Teacher)</span>
                                <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">{showAssignModal.teacherName}</span>
                            </div>

                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">选择可用课程 (从已买体系中)</label>
                                    <select name="courseAndLicense" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-5 font-black focus:border-indigo-500 focus:bg-white transition-all outline-none appearance-none">
                                        <option value="">请选择具体课程...</option>
                                        {organization.orgLicenses?.flatMap((lic: any) =>
                                            lic.series?.courses?.map((c: any) => ({
                                                ...c,
                                                licenseId: lic.id,
                                                seriesName: lic.series.name
                                            }))
                                        ).map((course: any) => (
                                            <option key={`${course.licenseId}-${course.id}`} value={`${course.id}|${course.licenseId}`}>
                                                [{course.seriesName}] {course.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">授权名额 (点亮学生数)</label>
                                    <input name="seats" type="number" min="1" max="1000" defaultValue="50" className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-5 font-black focus:border-indigo-500 focus:bg-white transition-all outline-none" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-3">
                                <PlusCircle className="w-5 h-5" /> 立即确认分配
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function AccountNode({ node, allCodes, parentId, toggleExpand, toggleInfo, copyToClipboard, handleToggleInternal, onDelete, isToggling, expandedIds, infoIds, currentUser, organization, setShowAssignModal }: any) {
    const nodeId = `node-${node.id}`;
    const isExpanded = expandedIds.has(nodeId);
    const isInfoVisible = infoIds.has(nodeId);
    const isPrincipal = node.role === 'ORG_ADMIN';
    const isTeacher = node.role === 'TEACHER';

    // 找出以此节点为父节点的子节点
    // 校长找直属老师，老师找激活码
    const children = (allCodes || []).filter((c: any) => {
        if (isPrincipal) return c.role === 'TEACHER' && c.teacherId === node.id;
        if (isTeacher) return !c.role && c.teacherId === node.id;
        return false;
    });

    const displayCode = node.username || node.code;

    // 当前登录的是否是校长
    const isCurrentUserPrincipal = currentUser.role === 'ORG_ADMIN';

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
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-black text-slate-800 text-base uppercase">
                                    {isPrincipal ? '机构校长号' : '机构讲师号'} {node.name ? `(${node.name})` : ''}
                                </span>
                                <button onClick={(e) => toggleInfo(nodeId, e)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-300 hover:text-slate-600 transition-all">
                                    <Info className="w-4 h-4" />
                                </button>
                            </div>

                            {/* 教师已获授权课程展示 */}
                            {isTeacher && node.teacherLicenses?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {node.teacherLicenses.map((lic: any) => (
                                        <span key={lic.id} className="px-2 py-0.5 bg-indigo-50 text-indigo-500 text-[8px] font-black uppercase rounded-md border border-indigo-100 flex items-center gap-1">
                                            <Sparkles className="w-2.5 h-2.5" /> {lic.course?.name} ({lic.usedSeats}/{lic.allocatedSeats})
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* 校长操作教师课程分配按钮 */}
                            {isCurrentUserPrincipal && isTeacher && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowAssignModal({ teacherId: node.id, teacherName: node.name || node.username }); }}
                                    className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black rounded-lg transition-all w-fit shadow-lg shadow-indigo-200 uppercase"
                                >
                                    <PlusCircle className="w-3 h-3" /> 点亮分配新课程
                                </button>
                            )}
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
                        onClick={(e) => handleToggleInternal(node.id, node.status, isPrincipal ? '校长' : '管理员', e)}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-2 border shadow-lg active:scale-95",
                            node.status === 'ACTIVE'
                                ? 'bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-500/10'
                                : 'bg-rose-500 text-white border-rose-600 ring-4 ring-rose-500/10',
                            isToggling === node.id && "opacity-50 cursor-wait"
                        )}
                    >
                        <Power className="w-4 h-4" />
                        {node.status === 'ACTIVE' ? '正常运行中' : '账户已冻结'}
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
                        (!child.role) ? ( // 没有 role 的是学生激活码
                            <div key={child.id} className="grid grid-cols-12 py-4 px-8 items-center bg-white border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-all group">
                                <div className="col-span-5 flex items-center gap-3 pl-4">
                                    <div className="w-3 h-3 rounded-full bg-indigo-50" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 italic flex items-center gap-2">
                                            <Ticket className="w-3.5 h-3.5" /> 学生激活码
                                        </span>
                                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter mt-0.5">授课内容: {child.course?.name || '未指定'}</span>
                                    </div>
                                </div>
                                <div className="col-span-2 font-mono text-xs font-black text-indigo-500">{child.code}</div>
                                <div className="col-span-2 text-center text-[10px] font-black text-slate-300 tabular-nums">
                                    使用: {child.usedCount} / {child.maxUses}
                                </div>
                                <div className="col-span-3 flex justify-end">
                                    <button
                                        disabled={isToggling === child.id}
                                        onClick={(e) => handleToggleInternal(child.id, child.status, isTeacher ? '所属老师' : '管理校长', e)}
                                        className={cn(
                                            "px-4 py-1.5 rounded-full text-[9px] font-black transition-all border shadow-md active:scale-95",
                                            child.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200",
                                            isToggling === child.id && "opacity-50 cursor-wait"
                                        )}
                                    >
                                        {child.status === 'ACTIVE' ? '正常激活' : '已被禁用'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <AccountNode
                                key={child.id}
                                node={child}
                                allCodes={allCodes}
                                parentId={nodeId}
                                currentUser={currentUser}
                                organization={organization}
                                setShowAssignModal={setShowAssignModal}
                                {...{ toggleExpand, toggleInfo, copyToClipboard, handleToggleInternal, onDelete, isToggling, expandedIds, infoIds }}
                            />
                        )
                    ))}
                </div>
            )}
        </div>
    );
}
