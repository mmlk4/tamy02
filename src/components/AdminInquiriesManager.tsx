import React, { useState } from 'react';
import { InquiryRequest } from '../types';
import { StorageService } from '../services/storage';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  UserPlus, 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  Tv, 
  ExternalLink,
  ChevronDown,
  X,
  PhoneCall
} from 'lucide-react';

interface AdminInquiriesManagerProps {
  type: 'contact' | 'subscription';
  inquiries: InquiryRequest[];
  onInquiriesChange: () => void;
  onConvertToAccount: (inquiry: InquiryRequest) => void;
}

export const AdminInquiriesManager: React.FC<AdminInquiriesManagerProps> = ({
  type,
  inquiries,
  onInquiriesChange,
  onConvertToAccount,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Manual Add Form State
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPhone, setNewPhone] = useState('+966 ');
  const [newEmail, setNewEmail] = useState('');
  const [newScreens, setNewScreens] = useState(2);
  const [newPlan, setNewPlan] = useState(type === 'subscription' ? 'باقة ترخيص شاشة (29 ر.س/شهرياً)' : 'استفسار عام عن النظام');
  const [newNotes, setNewNotes] = useState('');

  // Filter inquiries by type (contact or subscription)
  const itemsOfType = inquiries.filter(inq => inq.type === type);

  // Filter by status & search
  const filteredItems = itemsOfType.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const company = (item.companyName || item.company || '').toLowerCase();
    const plan = (item.planTitle || item.selectedPlan || '').toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      company.includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      plan.includes(q)
    );
  });

  const countNew = itemsOfType.filter(i => i.status === 'new').length;
  const countContacted = itemsOfType.filter(i => i.status === 'contacted').length;
  const countCompleted = itemsOfType.filter(i => i.status === 'completed').length;

  const handleStatusChange = (id: string, newStatus: 'new' | 'contacted' | 'completed') => {
    StorageService.updateInquiryStatus(id, newStatus);
    onInquiriesChange();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف طلب "${name}"؟`)) {
      StorageService.deleteInquiry(id);
      onInquiriesChange();
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    StorageService.saveInquiry({
      id: 'inq-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type,
      name: newName.trim(),
      company: newCompany.trim() || undefined,
      companyName: newCompany.trim() || undefined,
      phone: newPhone.trim(),
      email: newEmail.trim() || undefined,
      screensCount: Number(newScreens) || 1,
      planTitle: newPlan,
      selectedPlan: newPlan,
      notes: newNotes.trim() || undefined,
      status: 'new',
      createdAt: new Date().toISOString()
    });

    // Reset Form
    setNewName('');
    setNewCompany('');
    setNewPhone('+966 ');
    setNewEmail('');
    setNewScreens(2);
    setNewNotes('');
    setShowAddModal(false);
    onInquiriesChange();
  };

  // Format phone for WhatsApp
  const cleanPhoneForWhatsApp = (phoneStr: string) => {
    let clean = phoneStr.replace(/[^0-9]/g, '');
    if (clean.startsWith('05')) {
      clean = '966' + clean.slice(1);
    } else if (clean.startsWith('5')) {
      clean = '966' + clean;
    }
    return clean;
  };

  const isSubscription = type === 'subscription';

  return (
    <div className="space-y-4 font-sans" dir="rtl">
      {/* Header & Controls Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              {isSubscription ? <Sparkles className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            </span>
            <h2 className="text-base font-black text-neutral-900">
              {isSubscription ? 'اهتمامات الاشتراك وباقات الشاشات' : 'طلبات التواصل والاستفسارات'}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800">
              {itemsOfType.length} طلب
            </span>
            {countNew > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                {countNew} جديد
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {isSubscription 
              ? 'العملاء المهتمون بالاشتراك وحجز تراخيص الشاشات عبر الموقع. يمكنك التواصل معهم وتحويلهم لحسابات عملاء مفعلة.' 
              : 'طلبات التواصل والاستشارات المرسلة من نموذج الاتصال بالموقع. تابع حالة الرد وتفاصيل كل عميل.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isSubscription ? '+ تسجيل اهتمام باشتراك' : '+ تسجيل طلب تواصل يدوي'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            الكل ({itemsOfType.length})
          </button>
          <button
            onClick={() => setStatusFilter('new')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'new'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>جديد ({countNew})</span>
          </button>
          <button
            onClick={() => setStatusFilter('contacted')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'contacted'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200/60'
            }`}
          >
            تم التواصل ({countContacted})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
            }`}
          >
            مكتمل ({countCompleted})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم، المنشأة، الجوال..."
            className="w-full pr-9 pl-4 py-2 bg-neutral-50 hover:bg-neutral-100 focus:bg-white rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden transition-colors"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-3">
            <div className="w-14 h-14 bg-neutral-100 text-neutral-400 rounded-2xl flex items-center justify-center mx-auto">
              {isSubscription ? <Sparkles className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-800">
                {searchTerm || statusFilter !== 'all' 
                  ? 'لا توجد نتائج مطابقة للبحث أو التصفية المحددة' 
                  : `لا توجد ${isSubscription ? 'اهتمامات اشتراك' : 'طلبات تواصل'} مسجلة حتى الآن`}
              </h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                {searchTerm || statusFilter !== 'all'
                  ? 'جرّب إعادة تعيين معايير البحث أو اختيار حالة تصفية أخرى.'
                  : `عندما يُرسل زوار الموقع استفسارات أو اهتمامات بالاشتراك، ستظهر هنا مباشرة مع إمكانية التواصل والتحويل لحساب عميل.`}
              </p>
            </div>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
              >
                إلغاء التصفية وعرض الكل
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredItems.map(item => {
              const cleanPhone = cleanPhoneForWhatsApp(item.phone);
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `مرحباً أستاذ ${item.name}، بخصوص طلبك في منصة تامي لأنظمة شاشات الإعلانات (${item.planTitle || 'خدمات الشاشات'}). يسعدنا خدمتك والإجابة على أي استفسار!`
              )}`;

              return (
                <div key={item.id} className="p-5 hover:bg-neutral-50/60 transition-colors space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    
                    {/* Customer Identity */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 font-black text-sm flex items-center justify-center shrink-0">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-neutral-900">{item.name}</h3>
                          {(item.companyName || item.company) && (
                            <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-neutral-100 text-neutral-700">
                              {item.companyName || item.company}
                            </span>
                          )}
                          <span
                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                              item.status === 'new'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status === 'contacted'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {item.status === 'new'
                              ? 'جديد'
                              : item.status === 'contacted'
                              ? 'تم التواصل'
                              : 'مكتمل'}
                          </span>
                        </div>

                        {/* Plan & Screens requested */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                          {(item.planTitle || item.selectedPlan) && (
                            <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                              <Sparkles className="w-3 h-3" />
                              <span>{item.planTitle || item.selectedPlan}</span>
                            </span>
                          )}
                          {item.screensCount && (
                            <span className="inline-flex items-center gap-1 font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                              <Tv className="w-3 h-3 text-neutral-500" />
                              <span>العدد المطلوب: {item.screensCount} شاشات</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-neutral-400 text-[11px]">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(item.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Status Dropdown */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* WhatsApp Button */}
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        title="مراسلة عبر الواتساب"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>واتساب</span>
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </a>

                      {/* Direct Call Button */}
                      <a
                        href={`tel:${item.phone}`}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-neutral-200"
                        title="اتصال هاتفي مباشر"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-neutral-600" />
                        <span dir="ltr">{item.phone}</span>
                      </a>

                      {/* Convert to Client Account */}
                      <button
                        onClick={() => onConvertToAccount(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="إنشاء حساب عميل مفعل فورياً من بيانات هذا الطلب"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>تحويل إلى حساب عميل</span>
                      </button>

                      {/* Status Selector */}
                      <div className="relative">
                        <select
                          value={item.status}
                          onChange={e => handleStatusChange(item.id, e.target.value as any)}
                          className="appearance-none bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold py-2 pr-3 pl-7 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 cursor-pointer"
                        >
                          <option value="new">حالة: جديد</option>
                          <option value="contacted">حالة: تم التواصل</option>
                          <option value="completed">حالة: مكتمل</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="حذف الطلب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notes & Customer Message */}
                  {item.notes && (
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 text-xs text-neutral-700 leading-relaxed">
                      <strong className="text-neutral-900 ml-1">ملاحظات / رسالة العميل:</strong>
                      <span>{item.notes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Add Inquiry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-sans" dir="rtl">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-neutral-200 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                {isSubscription ? <Sparkles className="w-5 h-5 text-purple-400" /> : <MessageSquare className="w-5 h-5 text-purple-400" />}
                <h3 className="text-base font-bold">
                  {isSubscription ? 'تسجيل اهتمام باشتراك جديد' : 'تسجيل طلب تواصل جديد'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleManualAdd} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 space-y-4 flex-1 min-h-0 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    اسم العميل / جهة الاتصال *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="مثال: عبدالله الشمري"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    اسم المنشأة أو الشركة
                  </label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    placeholder="مثال: مطاعم ومطابخ الكرم"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      رقم الجوال *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      placeholder="+966 5..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      عدد الشاشات المطلوب
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newScreens}
                      onChange={e => setNewScreens(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden font-bold text-purple-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {isSubscription ? 'الباقة أو نوع الترخيص' : 'الموضوع'}
                  </label>
                  <input
                    type="text"
                    value={newPlan}
                    onChange={e => setNewPlan(e.target.value)}
                    placeholder="مثال: باقة ترخيص شاشة (29 ر.س/شهرياً)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    ملاحظات أو تفاصيل الطلب
                  </label>
                  <textarea
                    rows={3}
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    placeholder="اكتب أي ملاحظات خاصة بالعميل أو متطلبات الفروع..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-200/70 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>حفظ الطلب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
