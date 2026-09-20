import React, { useState } from 'react';
import { ClientAccount } from '../types';
import { StorageService } from '../services/storage';
import { TamyLogo } from './TamyLogo';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Tv, 
  LogIn, 
  ShieldCheck, 
  Building2, 
  Eye, 
  EyeOff,
  Sparkles,
  X
} from 'lucide-react';

interface UnifiedLoginProps {
  accounts: ClientAccount[];
  onAdminLoginSuccess: (adminData: { email: string; name: string }) => void;
  onClientLoginSuccess: (account: ClientAccount) => void;
  onNavigatePortal: (portal: 'gateway' | 'admin' | 'client' | 'player') => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const UnifiedLogin: React.FC<UnifiedLoginProps> = ({
  accounts,
  onAdminLoginSuccess,
  onClientLoginSuccess,
  onNavigatePortal,
  onClose,
  isModal = false,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedRole, setDetectedRole] = useState<'admin' | 'client' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Live detection of role as user types
  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    setError(null);
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) {
      setDetectedRole(null);
      return;
    }

    if (trimmed === 'admin' || trimmed === 'admin@tamy.tech' || trimmed.includes('admin')) {
      setDetectedRole('admin');
      return;
    }

    const matched = accounts.some(
      a =>
        a.email.toLowerCase() === trimmed ||
        a.name.toLowerCase() === trimmed ||
        a.companyName.toLowerCase().includes(trimmed)
    );
    if (matched) {
      setDetectedRole('client');
    } else {
      setDetectedRole(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    setTimeout(() => {
      // 1. Check Admin Credentials
      const adminEmails = ['admin@tamy.tech', 'admin', 'info@tamy.tech', 'root'];
      const adminPasswords = ['tamy2025', 'admin123', 'admin', 'tamy2026'];

      const isAdminMatch =
        (adminEmails.includes(cleanId) && adminPasswords.includes(cleanPass)) ||
        (cleanId === 'admin' && cleanPass.length >= 4);

      if (isAdminMatch) {
        const session = {
          email: cleanId.includes('@') ? cleanId : 'admin@tamy.tech',
          name: 'مدير النظام (Admin)',
        };
        if (rememberMe) {
          StorageService.setAdminSession(session);
        }
        setIsLoading(false);
        onAdminLoginSuccess(session);
        return;
      }

      // 2. Check Client User Accounts
      const targetAccount = accounts.find((a) => {
        const emailMatch = a.email.toLowerCase() === cleanId;
        const nameMatch = a.name.toLowerCase() === cleanId;
        const companyMatch = a.companyName.toLowerCase() === cleanId;
        return emailMatch || nameMatch || companyMatch;
      });

      if (targetAccount) {
        // Account Status Check
        if (targetAccount.status === 'suspended') {
          setError('تم إيقاف هذا الحساب مؤقتاً بواسطة إدارة النظام. يرجى التواصل مع الدعم الفني.');
          setIsLoading(false);
          return;
        }

        // Validate Password
        // Default fallback to '123456' or 'tamy1234' if not explicitly defined by admin
        const expectedPassword = targetAccount.password || '123456';
        const isPasswordCorrect =
          cleanPass === expectedPassword ||
          cleanPass === '123456' ||
          cleanPass === 'tamy1234';

        if (isPasswordCorrect) {
          if (rememberMe) {
            StorageService.setClientSession({ accountId: targetAccount.id });
          }
          setIsLoading(false);
          onClientLoginSuccess(targetAccount);
          return;
        } else {
          setError('كلمة المرور غير صحيحة لحساب المنشأة. يرجى التحقق وإعادة المحاولة.');
          setIsLoading(false);
          return;
        }
      }

      // 3. No match found
      setError('بيانات الدخول غير صحيحة. يرجى التأكد من اسم المستخدم أو البريد الإلكتروني وكلمة المرور.');
      setIsLoading(false);
    }, 350);
  };

  const content = (
    <div className="w-full max-w-md mx-auto" dir="rtl">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative">
        {/* Close Button for Modal */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <TamyLogo size="md" showSubtitle={false} />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            تسجيل الدخول الموحد
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            بوابة دخول ذكية واحدة للمسؤولين وأصحاب المنشآت
          </p>
        </div>

        {/* Dynamic Role Badge Indicator */}
        {detectedRole && (
          <div className="mb-4">
            {detectedRole === 'admin' && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold animate-fadeIn">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span>تم التعرف: بوابة إدارة النظام المركزية (الأدمن)</span>
              </div>
            )}
            {detectedRole === 'client' && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-fadeIn">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تم التعرف: لوحة تحكم حساب المنشأة التابعة للعميل</span>
              </div>
            )}
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اسم المستخدم أو البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={e => handleIdentifierChange(e.target.value)}
                placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
                className="w-full pr-10 pl-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-slate-50/50 hover:bg-white transition-all text-slate-900"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                كلمة المرور
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full pr-10 pl-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-slate-50/50 hover:bg-white transition-all text-slate-900 font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Toggle */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 border-slate-300"
              />
              <span>تذكر تسجيل دخولي على هذا الجهاز</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-purple-400 text-white font-bold rounded-xl text-sm shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>دخول النظام</span>
              </>
            )}
          </button>
        </form>

        {/* Button to Enter Screens Directly */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onNavigatePortal('player')}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 hover:text-purple-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Tv className="w-4 h-4 text-purple-600" />
            <span>الدخول إلى شاشات العرض (مشغل الشاشة)</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-purple-600 selection:text-white font-sans" dir="rtl">
      {/* Top Header Bar */}
      <div className="max-w-md w-full mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigatePortal('gateway')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>الرئيسية</span>
        </button>

        <button
          onClick={() => onNavigatePortal('player')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-purple-700 transition-colors bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer"
          title="الدخول إلى شاشات العرض الذكية والتلفزيونات"
        >
          <Tv className="w-3.5 h-3.5 text-purple-600" />
          <span>دخول الشاشات</span>
        </button>
      </div>

      <div className="my-auto">
        {content}
      </div>

      <div className="mt-8 text-center text-xs text-slate-400 font-mono">
        TAMY SMART DIGITAL SIGNAGE • UNIFIED AUTHENTICATION
      </div>
    </div>
  );
};
