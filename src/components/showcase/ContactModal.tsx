import React, { useState } from 'react';
import { X, Send, Phone, Mail, Globe, CheckCircle2, MessageSquare } from 'lucide-react';
import { StorageService } from '../../services/storage';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: string | null;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
}) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [screensCount, setScreensCount] = useState('3');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      StorageService.saveInquiry({
        id: 'inq-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: name.trim(),
        company: company.trim() || 'منشأة تجارية',
        phone: phone.trim(),
        screensCount,
        selectedPlan: selectedPlan || 'طلب استشارة وتواصل عام',
        notes: notes.trim(),
        type: selectedPlan ? 'subscription' : 'contact',
        status: 'new',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to save inquiry', err);
    }
    setSubmitted(true);
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `مرحباً تامي، أرغب في الاستفسار عن باقات نظام إدارة الشاشات الإعلانية ${
        selectedPlan ? `(باقة: ${selectedPlan})` : ''
      }. المنشأة: ${company || 'منشأة تجارية'} - الشاشات المطلوبة: ${screensCount}.`
    );
    window.open(`https://wa.me/9665110185858?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-sans" dir="rtl">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Tamy Purple accent */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-5 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 sm:top-5 sm:left-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors text-white cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-xs font-bold text-purple-200 tracking-wider mb-1">
            TAMY ADVERTISING SCREEN SYSTEMS
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            {selectedPlan ? `طلب الاشتراك في ${selectedPlan}` : 'طلب باقة أو استشارة مجانية'}
          </h3>
          <p className="text-xs text-purple-100 mt-1">
            فريق تامي جاهز لمساعدتك في تجهيز وتشغيل شاشات منشأتك في غضون 24 ساعة.
          </p>
        </div>

        <div className="p-5 sm:p-6 flex-1 min-h-0 overflow-y-auto">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">تم استلام طلبك بنجاح!</h4>
                <p className="text-xs text-slate-600 mt-2 max-w-xs mx-auto leading-relaxed">
                  شكراً لتواصلك مع تامي. سيتواصل معك مستشار الحلول الرقمية في أقرب وقت لإتمام التفعيل.
                </p>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={handleWhatsAppDirect}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>المتابعة الفورية عبر واتساب (+966 511 018 5858)</span>
                </button>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                  }}
                  className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكريم</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: تركي السعدي"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المنشأة أو النشاط</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="مثال: مطعم أو مقهى..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الجوال / واتساب</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-slate-50/50 font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عدد الشاشات المطلوبة</label>
                  <select
                    value={screensCount}
                    onChange={(e) => setScreensCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-slate-50/50 font-sans"
                  >
                    <option value="1">شاشة واحدة (ستاند أو تلفزيون)</option>
                    <option value="2-3">2 إلى 3 شاشات</option>
                    <option value="4-5">4 إلى 5 شاشات</option>
                    <option value="6-10">6 إلى 10 شاشات</option>
                    <option value="10+">أكثر من 10 شاشات (فروع متعددة)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات أو استفسارات إضافية (اختياري)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أذكر نوع النشاط أو مواصفات الشاشات المتوفرة لديك..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-slate-50/50 resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال الطلب الآن</span>
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>محادثة واتساب</span>
                </button>
              </div>

              {/* Direct Company Contact Info */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-purple-600" />
                  <span className="font-mono text-slate-700" dir="ltr">+966 511 018 5858</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-slate-700">info@tamy.tech</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-slate-700">tamy.tech</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
