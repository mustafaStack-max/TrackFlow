import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

// === مكونات الأيقونات SVG ===
const PlusIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
);

const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const BankIcon = () => (
    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
);

const CardIcon = () => (
    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const CashIcon = () => (
    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const SavingsIcon = () => (
    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

export default function Accounts({ accounts = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    const totalNetWorth = accounts.reduce((acc, curr) => acc + parseFloat(curr.balance || 0), 0);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        type: 'cash',
        balance: '0.00',
        currency: 'MAD',
        color_hex: '#00e676',
    });

    const openCreateModal = () => {
        setEditingAccount(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (account) => {
        setEditingAccount(account);
        setData({
            name: account.name,
            type: account.type,
            balance: account.balance,
            currency: account.currency,
            color_hex: account.color_hex,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAccount) {
            put(route('accounts.update', editingAccount.uuid), {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post(route('accounts.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت تأكد في حذف هذا الحساب؟')) {
            destroy(route('accounts.destroy', id));
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'bank': return <BankIcon />;
            case 'card': return <CardIcon />;
            case 'savings': return <SavingsIcon />;
            default: return <CashIcon />;
        }
    };

    return (
        <div dir="rtl" className="min-h-screen bg-[#070a0f] text-slate-100 p-6 font-mono selection:bg-cyan-500 selection:text-black">
            
            {/* Header Section */}
            <div className="flex justify-between items-end mb-6 border-b border-slate-800 pb-4">
                <div>
                    <span className="text-xs tracking-widest text-slate-500 uppercase">
                        ACCOUNTS MANAGEMENT  ADD · EDIT · MONITOR 
                    </span>
                    <h1 className="text-3xl font-extrabold text-[#00e676] tracking-wide mt-1">
                        إدارة الحسابات
                    </h1>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-[#0b1019] border border-slate-800 rounded-lg p-5 mb-8 flex flex-wrap justify-between items-center shadow-2xl">
                <div className="flex gap-8 text-center sm:text-right">
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">ACCOUNTS</div>
                        <div className="text-2xl font-bold text-cyan-400 mt-1">{accounts.length}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">TOTAL EXPENSE</div>
                        <div className="text-xl font-bold text-rose-500 mt-1">MAD 0-</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">TOTAL INCOME</div>
                        <div className="text-xl font-bold text-emerald-400 mt-1">MAD 0+</div>
                    </div>
                </div>

                <div className="border-r border-slate-800 pr-8 text-left">
                    <div className="text-xs text-slate-500 uppercase tracking-widest">TOTAL NET WORTH</div>
                    <div className="text-3xl font-black text-amber-400 mt-1 tracking-wider">
                        MAD {Number(totalNetWorth).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Add New Account Card */}
                <div 
                    onClick={openCreateModal}
                    className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-[#090d14]/50 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-[#0b121e] group min-h-[260px]"
                >
                    <div className="w-12 h-12 rounded-full border border-slate-700 group-hover:border-cyan-400 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors mb-4">
                        <PlusIcon />
                    </div>
                    <span className="text-lg font-bold text-slate-300 group-hover:text-cyan-400 transition-colors">
                        إضافة حساب جديد
                    </span>
                    <span className="text-xs text-slate-600 tracking-widest mt-2 uppercase">
                        BANK · CASH · CARD · SAVINGS
                    </span>
                </div>

                {/* Account Cards */}
                {accounts.map((account) => (
                    <div 
                        key={account.uuid}
                        className="bg-[#0b1019] border-t-2 rounded-lg p-5 flex flex-col justify-between shadow-lg relative group transition-transform hover:-translate-y-1"
                        style={{ borderColor: account.color_hex || '#00e676' }}
                    >
                        {/* Actions Toolbar */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => openEditModal(account)}
                                    className="p-2 border border-slate-800 hover:border-cyan-500 text-slate-400 hover:text-cyan-400 rounded transition-colors"
                                    title="تعديل"
                                >
                                    <EditIcon />
                                </button>
                                <button 
                                    onClick={() => handleDelete(account.id)}
                                    className="p-2 border border-slate-800 hover:border-rose-500 text-slate-400 hover:text-rose-500 rounded transition-colors"
                                    title="حذف"
                                >
                                    <TrashIcon />
                                </button>
                            </div>

                            <div className="text-left">
                                <div className="text-lg font-bold text-slate-100 flex items-center gap-2 justify-end">
                                    <span>{account.name}</span>
                                    {getTypeIcon(account.type)}
                                </div>
                                <span className="inline-block border border-slate-700 text-slate-400 text-[10px] uppercase px-2 py-0.5 rounded mt-1">
                                    {account.type}
                                </span>
                            </div>
                        </div>

                        {/* Balance display */}
                        <div className="text-center my-4">
                            <span className="text-xs text-slate-500 uppercase mr-1">{account.currency}</span>
                            <span className="text-3xl font-extrabold text-cyan-400 tracking-tight">
                                {Number(account.balance).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        {/* Mini Stats Breakdown */}
                        <div className="grid grid-cols-2 gap-2 bg-[#070a0f] p-3 rounded border border-slate-800/60 text-xs mb-3">
                            <div className="text-center">
                                <div className="text-slate-500 text-[10px]">↑ دخل</div>
                                <div className="text-emerald-400 font-bold mt-0.5">0+</div>
                            </div>
                            <div className="text-center border-r border-slate-800">
                                <div className="text-slate-500 text-[10px]">↓ مصروف</div>
                                <div className="text-rose-500 font-bold mt-0.5">0-</div>
                            </div>
                        </div>

                        {/* Bottom Status / Progress Bar */}
                        <div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full" 
                                    style={{ width: '60%', backgroundColor: account.color_hex || '#00e676' }}
                                />
                            </div>
                            <div className="text-[10px] text-slate-600 text-center mt-2">
                                0 عملية  %60 استخدام
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Create/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#0b1019] border border-slate-800 rounded-lg max-w-md w-full p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-[#00e676] mb-4">
                            {editingAccount ? 'تعديل بيانات الحساب' : 'إضافة حساب جديد'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">اسم الحساب</label>
                                <input 
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full bg-[#070a0f] border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 outline-none"
                                    placeholder="مثال: CIH Bank أو النقد"
                                    required
                                />
                                {errors.name && <div className="text-rose-500 text-xs mt-1">{errors.name}</div>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">النوع</label>
                                    <select 
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full bg-[#070a0f] border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 outline-none"
                                    >
                                        <option value="cash">نقدي (Cash)</option>
                                        <option value="bank">بنكي (Bank)</option>
                                        <option value="card">بطاقة (Card)</option>
                                        <option value="savings">ادخار (Savings)</option>
                                        <option value="other">آخر (Other)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">العملة</label>
                                    <input 
                                        type="text"
                                        value={data.currency}
                                        onChange={(e) => setData('currency', e.target.value)}
                                        className="w-full bg-[#070a0f] border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 outline-none uppercase"
                                        maxLength={3}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">الرصيد الأولي</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        value={data.balance}
                                        onChange={(e) => setData('balance', e.target.value)}
                                        className="w-full bg-[#070a0f] border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">لون التمييز (HEX)</label>
                                    <div className="flex gap-2 items-center">
                                        <input 
                                            type="color"
                                            value={data.color_hex}
                                            onChange={(e) => setData('color_hex', e.target.value)}
                                            className="w-10 h-9 bg-transparent border-0 cursor-pointer"
                                        />
                                        <input 
                                            type="text"
                                            value={data.color_hex}
                                            onChange={(e) => setData('color_hex', e.target.value)}
                                            className="w-full bg-[#070a0f] border border-slate-800 rounded px-2 py-2 text-xs text-slate-200 focus:border-cyan-500 outline-none uppercase"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-slate-800 rounded text-slate-400 text-xs hover:bg-slate-800 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button 
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'جاري الحفظ...' : (editingAccount ? 'حفظ التعديلات' : 'إنشاء الحساب')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}