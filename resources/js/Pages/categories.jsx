import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';

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

const TagIcon = ({ color }) => (
    <svg className="w-5 h-5" style={{ color: color || '#00e676' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function Categories({ Categories = [] }) {
    const { success, message } = usePage().props;
    const [toastMessage, setToastMessage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentCategoryId, setCurrentCategoryId] = useState(null);

    const totalCategories = Categories.length;
    const systemCategories = Categories.filter(c => c.is_system).length;
    const customCategories = Categories.filter(c => !c.is_system).length;

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        icon: 'Category',
        color_hex: '#00e676',
    });

    useEffect(() => {
        if (message) {
            setToastMessage(message);
            const timer = setTimeout(() => setToastMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message, success]);

    const openCreateModal = () => {
        setModalMode('create');
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setModalMode('edit');
        setCurrentCategoryId(category.id);
        setData({
            name: category.name,
            icon: category.icon || '',
            color_hex: category.color_hex || '#00e676',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalMode === 'create') {
            post(route('categories.store'), { onSuccess: () => setIsModalOpen(false) });
        } else {
            put(route('categories.update', currentCategoryId), { onSuccess: () => setIsModalOpen(false) });
        }
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من رغبتك في حذف هذا التصنيف؟')) {
            destroy(route('categories.destroy', id));
        }
    };

    return (
        <div dir="rtl" className="min-h-screen bg-[#070a0f] text-slate-100 p-6 font-mono selection:bg-cyan-500 selection:text-black">
            <Head title="إدارة التصنيفات" />
            
            {/* Header Section */}
            <div className="flex justify-between items-end mb-6 border-b border-slate-800 pb-4">
                <div>
                    <span className="text-xs tracking-widest text-slate-500 uppercase">
                        CATEGORIES MANAGEMENT // SYSTEM · CUSTOM //
                    </span>
                    <h1 className="text-3xl font-extrabold text-[#00e676] tracking-wide mt-1">
                        إدارة التصنيفات
                    </h1>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-[#0b1019] border border-slate-800 rounded-lg p-5 mb-8 flex flex-wrap justify-between items-center shadow-2xl">
                <div className="flex gap-8 text-center sm:text-right">
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">TOTAL</div>
                        <div className="text-2xl font-bold text-cyan-400 mt-1">{totalCategories}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">SYSTEM</div>
                        <div className="text-xl font-bold text-emerald-500 mt-1">{systemCategories}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">CUSTOM</div>
                        <div className="text-xl font-bold text-amber-400 mt-1">{customCategories}</div>
                    </div>
                </div>

                <div className="border-r border-slate-800 pr-8 text-left">
                    <div className="text-xs text-slate-500 uppercase tracking-widest">ACTIVE STATUS</div>
                    <div className="text-2xl font-black text-[#00e676] mt-1 tracking-wider">
                        ONLINE
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Add New Category Card */}
                <div 
                    onClick={openCreateModal}
                    className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-[#090d14]/50 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-[#0b121e] group min-h-[260px]"
                >
                    <div className="w-12 h-12 rounded-full border border-slate-700 group-hover:border-cyan-400 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors mb-4">
                        <PlusIcon />
                    </div>
                    <span className="text-lg font-bold text-slate-300 group-hover:text-cyan-400 transition-colors">
                        إضافة تصنيف جديد
                    </span>
                    <span className="text-xs text-slate-600 tracking-widest mt-2 uppercase">
                        EXPENSES · INCOME · BILLS
                    </span>
                </div>

                {/* Category Cards */}
                {Categories.map((category) => (
                    <div 
                        key={category.id}
                        className="bg-[#0b1019] border-t-2 rounded-lg p-5 flex flex-col justify-between shadow-lg relative group transition-transform hover:-translate-y-1"
                        style={{ borderColor: category.color_hex || '#00e676' }}
                    >
                        {/* Actions Toolbar */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-2 min-h-[34px]">
                                {!category.is_system && (
                                    <>
                                        <button 
                                            onClick={() => openEditModal(category)}
                                            className="p-2 border border-slate-800 hover:border-cyan-500 text-slate-400 hover:text-cyan-400 rounded transition-colors"
                                            title="تعديل"
                                        >
                                            <EditIcon />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(category.id)}
                                            className="p-2 border border-slate-800 hover:border-rose-500 text-slate-400 hover:text-rose-500 rounded transition-colors"
                                            title="حذف"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="text-left">
                                <div className="text-lg font-bold text-slate-100 flex items-center gap-2 justify-end">
                                    <span>{category.name}</span>
                                    <TagIcon color={category.color_hex} />
                                </div>
                                <span className={`inline-block border text-[10px] uppercase px-2 py-0.5 rounded mt-1 ${
                                    category.is_system 
                                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                                        : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                                }`}>
                                    {category.is_system ? 'SYSTEM' : 'CUSTOM'}
                                </span>
                            </div>
                        </div>

                        {/* Icon/Name display */}
                        <div className="text-center my-4">
                            <span 
                                className="text-3xl font-extrabold tracking-tight uppercase"
                                style={{ color: category.color_hex || '#00e676' }}
                            >
                                {category.icon || 'Category'}
                            </span>
                        </div>

                        {/* Mini Stats Breakdown */}
                        <div className="grid grid-cols-1 bg-[#070a0f] p-3 rounded border border-slate-800/60 text-xs mb-3">
                            <div className="text-center">
                                <div className="text-slate-500 text-[10px] uppercase">Usage Stats</div>
                                <div className="text-slate-300 font-bold mt-1">0 عمليات مسجلة</div>
                            </div>
                        </div>

                        {/* Bottom Status / Progress Bar */}
                        <div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full opacity-70" 
                                    style={{ width: '100%', backgroundColor: category.color_hex || '#00e676' }}
                                />
                            </div>
                            <div className="text-[10px] text-slate-600 text-center mt-2 uppercase tracking-widest">
                                {category.color_hex} // ACTIVE
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#0b1019] border border-emerald-500/50 shadow-2xl text-emerald-400 px-5 py-3 rounded-lg animate-pulse">
                    <CheckCircleIcon />
                    <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
                </div>
            )}

            {/* Modal for Create/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#0b1019] border border-slate-800 rounded-lg max-w-md w-full p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-[#00e676] mb-4">
                            {modalMode === 'edit' ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">اسم التصنيف</label>
                                <input 
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full bg-[#070a0f] border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 outline-none"
                                    placeholder="مثال: تسوق، فواتير..."
                                    required
                                />
                                {errors.name && <div className="text-rose-500 text-xs mt-1">{errors.name}</div>}
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">الاسم الإنجليزي (كأيقونة)</label>
                                <input 
                                    type="text"
                                    value={data.icon}
                                    onChange={(e) => setData('icon', e.target.value)}
                                    className="w-full bg-[#070a0f] border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 outline-none uppercase"
                                    placeholder="مثال: SHOPPING"
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
                                    {processing ? 'جاري الحفظ...' : (modalMode === 'edit' ? 'حفظ التعديلات' : 'إنشاء التصنيف')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}