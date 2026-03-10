'use client';

import { useState } from 'react';
import { Key, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChangePasswordForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (password.length < 6) {
            setMessage({ type: 'error', text: '密码长度至少为 6 位' });
            return;
        }

        const res = await fetch('/api/user/change-password', {
            method: 'POST',
            body: JSON.stringify({ password }),
        });

        if (res.ok) {
            setMessage({ type: 'success', text: '密码更新成功！' });
            setPassword('');
            setTimeout(() => setIsOpen(false), 2000);
        } else {
            setMessage({ type: 'error', text: '更新失败，请重试' });
        }
    };

    return (
        <div className="relative">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 hover:text-blue-600 shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                    <Key className="w-4 h-4" />
                    修改密码 Reset Secret
                </button>
            ) : (
                <div className="absolute top-0 right-0 w-64 bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">设置新密码 New Pass</div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-slate-900"><X className="w-4 h-4" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="至少 6 位字符"
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" /> 确认保存
                        </button>
                    </form>
                    {message && (
                        <div className={cn(
                            "mt-4 p-3 rounded-lg text-[10px] font-black text-center uppercase tracking-widest",
                            message.type === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                            {message.text}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
