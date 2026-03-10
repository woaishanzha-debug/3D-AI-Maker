'use client';

import { useState } from 'react';
import { Power, Trash2, ChevronRight, ChevronDown, Ticket, School, Info, Copy, Crown, GraduationCap, PlusCircle, XCircle } from 'lucide-react';

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
}

export default function DashboardCodeTree({ organization, currentUser, onToggle, onDelete, onAddTeacher }: DashboardCodeTreeProps) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([`org-${organization.id}`]));
    const [infoIds, setInfoIds] = useState<Set<string>>(new Set());
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
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

    const principals = organization.invitationCodes.filter((c: any) => c.type === 'PRINCIPAL');
    const teachers = organization.invitationCodes.filter((c: any) => c.type === 'TEACHER');

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
                                {currentUser.role === 'ORG_ADMIN' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowAddModal(true); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded-xl shadow-lg active:scale-95 transition-all"
                                    >
                                        <PlusCircle className="w-4 h-4" /> 扩容此机构
                                    </button>
                                )}
                            </div>
                            <div className="col-span-2"></div>
                            <div className="col-span-3 text-right">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                                    {currentUser.role} DASHBOARD
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
                                        allCodes={organization.invitationCodes}
                                        parentId={`org-${organization.id}`}
                                        {...{ toggleExpand, toggleInfo, copyToClipboard, handleToggleInternal, onDelete, isToggling, expandedIds, infoIds }}
                                    />
                                ))}
                                {/* 渲染并线老师号 (如果没有关联校长或者直属机构) */}
                                {teachers.filter((t: any) => !t.parentId).map((t: any) => (
                                    <AccountNode
                                        key={t.id}
                                        node={t}
                                        allCodes={organization.invitationCodes}
                                        parentId={`org-${organization.id}`}
                                        {...{ toggleExpand, toggleInfo, copyToClipboard, handleToggleInternal, onDelete, isToggling, expandedIds, infoIds }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
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
                            <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-white/10 rounded-full transition-all"><XCircle className="w-8 h-8" /></button>
                        </div>
                        <form action={async (formData) => {
                            formData.append('orgId', organization.id);
                            await onAddTeacher(formData);
                            setShowAddModal(false);
                        }} className="p-10 space-y-8">
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">设置老师识别码</label>
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
                                <PlusCircle className="w-5 h-5" /> 立即生成并行子账号
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
    const isPrincipal = node.type === 'PRINCIPAL';
    const isTeacher = node.type === 'TEACHER';

    // 找出以此节点为父节点的子节点
    const children = allCodes.filter((c: any) => c.parentId === node.id);

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
                                {isPrincipal ? '校长管理号' : '机构老师号'}
                            </span>
                            <button onClick={(e) => toggleInfo(nodeId, e)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-300 hover:text-slate-600 transition-all">
                                <Info className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('彻底删除此账号及其下属所有激活码？')) onDelete(node.id);
                                }}
                                className="p-1.5 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-span-2 font-mono font-black text-blue-600 text-sm flex items-center gap-2">
                    {node.code}
                    <button onClick={(e) => copyToClipboard(node.code, e)} className="text-slate-200 hover:text-blue-500 transition-all">
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
                    <div className="flex items-center gap-2"><PlusCircle className="w-4 h-4 text-blue-400" /> 登录密匙: {node.initialPassword || '未设置'}</div>
                    {node.disabledBy && <div className="flex items-center gap-2 text-rose-400 font-black tracking-widest"><Power className="w-4 h-4" /> 操作人: {node.disabledBy}</div>}
                </div>
            )}

            {isExpanded && children.length > 0 && (
                <div className="ml-16 border-l-2 border-dashed border-slate-200">
                    {children.map((child: any) => (
                        child.type === 'STUDENT' ? (
                            <div key={child.id} className="grid grid-cols-12 py-4 px-8 items-center bg-white border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-all group">
                                <div className="col-span-5 flex items-center gap-3 pl-4">
                                    <div className="w-3 h-3 rounded-full bg-indigo-50" />
                                    <span className="text-[10px] font-black text-slate-400 italic flex items-center gap-2">
                                        <Ticket className="w-3.5 h-3.5" /> 学生激活码
                                        {child.disabledBy && <span className="text-[9px] text-rose-500 ml-2 not-italic">被 {child.disabledBy} 停用</span>}
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
                                    <button
                                        disabled={isToggling === child.id}
                                        onClick={(e) => handleToggleInternal(child.id, child.status, isTeacher ? '所属老师' : '管理校长', e)}
                                        className={cn(
                                            "px-4 py-1.5 rounded-full text-[9px] font-black transition-all border",
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
                                {...{ toggleExpand, toggleInfo, copyToClipboard, handleToggleInternal, onDelete, isToggling, expandedIds, infoIds }}
                            />
                        )
                    ))}
                </div>
            )}
        </div>
    );
}
