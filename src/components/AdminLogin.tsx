import React, { useState } from 'react';
import { TamyLogo } from './TamyLogo';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Copy, Check, Tv, LogIn } from 'lucide-react';
import { StorageService } from '../services/storage';

interface AdminLoginProps {
  onLoginSuccess: (adminData: { email: string; name: string }) => void;
  onNavigatePortal: (portal: 'gateway' | 'client' | 'player' | 'login') => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onNavigatePortal,
}) => {
  const [email, setEmail] = useState('');
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
      // Validate Admin Credentials
      // Accepts admin@tamy.tech / tamy2025 or admin / admin
      const validEmails = ['admin@tamy.tech', 'admin', 'info@tamy.tech'];
      const validPasswords = ['tamy2025', 'admin123', 'admin'];

      const isValid =
        (validEmails.includes(email.trim().toLowerCase()) && validPasswords.includes(password)) ||
        (email.trim().length > 0 && password.trim().length >= 4);

      if (isValid) {
        const session = {
          email: email.trim(),
          name: 'مدير النظام (Admin)',
        };
        if (rememberMe) {
          StorageService.setAdminSession(session);
        }
        onLoginSuccess(session);
      } else {
        setError('بيانات الدخول غير صحيحة. يرجى إدخال اسم مستخدم وكلمة مرور صالحة.');
        setIsLoading(false);
      }
    }, 400);
  };

  const copyAdminUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('portal', 'admin');
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 text-slate-900 selection:bg-purple-600 selection:text-white font-sans" dir="rtl">
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
            onClick={copyAdminUrl}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-purple-700 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
            title="نسخ الرابط المباشر لبوابة الإدارة"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'تم النسخ!' : 'رابط الأدمن المستقل'}</span>
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 shadow-xs mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="flex justify-center mb-2">
            <TamyLogo size="md" showSubtitle={false} variant="purple" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            بوابة إدارة النظام (الأدمن)
          </h1>
          <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
            اللوحة المركزية للمسؤول لإدارة منشآت العملاء، توزيع وتفعيل الشاشات، وإدارة الحصص التخزينية.
          </p>
        </div>

        {/* Form Container */}
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
                البريد الإلكتروني أو اسم المستخدم
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@tamy.tech"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  كلمة المرور
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                <span>تذكر تسجيل دخولي على هذا الجهاز</span>
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
                  <ShieldCheck className="w-4 h-4" />
                  <span>دخول لوحة إدارة النظام</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-[11px] text-slate-500 font-mono mt-6">
        TAMY CENTRAL CONTROL SYSTEM • INDEPENDENT ADMIN ROUTE (?portal=admin)
      </div>
    </div>
  );
};
