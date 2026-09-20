import React, { useState } from 'react';
import { TamyLogo } from './TamyLogo';
import { ClientAccount } from '../types';
import { 
  ShieldCheck, 
  LogOut, 
  Copy, 
  Check, 
  Building2
} from 'lucide-react';

interface HeaderProps {
  activePortal: 'admin' | 'client';
  onLogout: () => void;
  activeAccount?: ClientAccount | null;
  adminData?: { email: string; name: string } | null;
}

export const Header: React.FC<HeaderProps> = ({
  activePortal,
  onLogout,
  activeAccount,
  adminData,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const copyCurrentPortalUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('portal', activePortal);
    if (activePortal === 'client' && activeAccount) {
      url.searchParams.set('account', activeAccount.id);
    }
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <TamyLogo size="md" showSubtitle={false} />
            
            {/* Active Portal Badge - Strictly Isolated */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-300">/</span>
              {activePortal === 'admin' && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>بوابة إدارة النظام (الأدمن)</span>
                </div>
              )}

              {activePortal === 'client' && activeAccount && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>لوحة تحكم المنشأة: {activeAccount.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions & User Profile */}
          <div className="flex items-center gap-3">
            {/* Copy Current Independent URL Button */}
            <button
              onClick={copyCurrentPortalUrl}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-neutral-600 hover:text-purple-700 hover:bg-purple-50 border border-neutral-200 transition-colors cursor-pointer"
              title="نسخ الرابط المستقل لهذه الصفحة"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'تم النسخ!' : 'نسخ رابط الصفحة'}</span>
            </button>

            {activePortal === 'admin' && adminData && (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-neutral-900 leading-none">
                    {adminData.name}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    {adminData.email}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-rose-50 text-neutral-700 hover:text-rose-600 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-neutral-200 hover:border-rose-200"
                  title="تسجيل الخروج من لوحة الإدارة"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج</span>
                </button>
              </div>
            )}

            {activePortal === 'client' && activeAccount && (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-neutral-900 leading-none">
                    {activeAccount.name}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    {activeAccount.companyName}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-rose-50 text-neutral-700 hover:text-rose-600 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-neutral-200 hover:border-rose-200"
                  title="تسجيل الخروج من حساب المنشأة"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
