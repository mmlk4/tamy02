import React, { useState } from 'react';
import { ClientAccount } from '../types';
import { StorageService } from '../services/storage';
import { TamyLogo } from './TamyLogo';
import { 
  Building2, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Copy, 
  Check, 
  Tv, 
  LogIn, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface ClientLoginProps {
  accounts: ClientAccount[];
  onLoginSuccess: (account: ClientAccount) => void;
  onNavigatePortal: (portal: 'gateway' | 'admin' | 'player' | 'login') => void;
  preselectedAccountId?: string;
}

export const ClientLogin: React.FC<ClientLoginProps> = ({
  accounts,
  onLoginSuccess,
  onNavigatePortal,
  preselectedAccountId,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    if (preselectedAccountId && accounts.some(a => a.id === preselectedAccountId)) {
      return preselectedAccountId;
    }
    return accounts[0]?.id || '';
  });

  const [enteredEmail, setEnteredEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      let targetAccount: ClientAccount | undefined;

      if (selectedAccountId) {
        targetAccount = accounts.find(a => a.id === selectedAccountId);
      } else if (enteredEmail.trim()) {
        targetAccount = accounts.find(
          a =>
            a.email.toLowerCase() === enteredEmail.trim().toLowerCase() ||
            a.name.toLowerCase() === enteredEmail.trim().toLowerCase()
        );
      }

      if (!targetAccount) {
        setError('يرجى اختيار المنشأة أو إدخال بريد إلكتروني صحيح مسجل بالنظام.');
        setIsLoading(false);
        return;
      }

      if (!password || password.length < 3) {
        setError('يرجى إدخال كلمة مرور أو رمز دخول صحيح (3 خانات على الأقل).');
        setIsLoading(false);
        return;
      }

      if (rememberMe) {
        StorageService.setClientSession({ accountId: targetAccount.id });
      }

      onLoginSuccess(targetAccount);
    }, 400);
  };

  const copyClientPortalUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('portal', 'client');
    if (selectedAccountId) {
      url.searchParams.set('account', selectedAccountId);
    }
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between py-8 px-4 selection:bg-purple-600 selection:text-white font-sans" dir="rtl">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => onNavigatePortal('gateway')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة إلى البوابة الرئيسية</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigatePortal('player')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-purple-700 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
            title="الدخول إلى مشغل الشاشات"
          >
            <Tv className="w-3.5 h-3.5 text-purple-600" />
            <span>دخول الشاشات</span>
          </button>

          <button
            onClick={() => onNavigatePortal('login')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors bg-white px-3.5 py-2 rounded-xl border border-purple-200 shadow-xs cursor-pointer"
            title="الانتقال إلى بوابة الدخول الموحدة"
          >
            <LogIn className="w-3.5 h-3.5 text-purple-600" />
            <span>الدخول الموحد</span>
          </button>

          <button
            onClick={copyClientPortalUrl}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-purple-700 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
            title="نسخ الرابط المستقل لبوابة العملاء"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'تم النسخ!' : 'رابط بوابة العملاء المستقل'}</span>
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 shadow-xs mb-3">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="flex justify-center mb-2">
            <TamyLogo size="md" showSubtitle={false} variant="purple" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            لوحة تحكم شاشات المنشأة
          </h1>
          <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
            تسجيل دخول صاحب المنشأة لإدارة وتحديث المواد الإعلانية، جدولة أوقات العرض، ومتابعة حالة الشاشات.
          </p>
        </div>

        {/* If no accounts exist at all */}
        {accounts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-5 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center mx-auto">
              <Tv className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">لا توجد منشآت مسجلة بعد في النظام</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                لم يتم بعد إنشاء حساب عميل من قبل مسؤول النظام. يرجى الدخول عبر بوابة الأدمن لإنشاء حساب المنشأة وتعيين الشاشات المسموح بها.
              </p>
            </div>
            <button
              onClick={() => onNavigatePortal('admin')}
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>الانتقال إلى بوابة الأدمن لإنشاء حساب</span>
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl">
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اختر المنشأة المسجلة
                </label>
                <div className="relative">
                  <select
                    value={selectedAccountId}
                    onChange={e => setSelectedAccountId(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors appearance-none font-bold"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.companyName || acc.email})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
                </div>
                {selectedAccount && (
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                    <span>البريد المسجل: {selectedAccount.email} • الحصة: {selectedAccount.maxScreens} شاشات</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    رمز الدخول / كلمة المرور
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>تذكر دخولي لهذه المنشأة</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>دخول لوحة تحكم الشاشات</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="text-center text-[11px] text-slate-500 font-mono mt-6">
        TAMY CLIENT SCREEN MANAGEMENT • INDEPENDENT CLIENT ROUTE (?portal=client)
      </div>
    </div>
  );
};
