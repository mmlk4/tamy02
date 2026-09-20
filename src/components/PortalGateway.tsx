import React, { useState } from 'react';
import { TamyLogo } from './TamyLogo';
import { 
  ShieldCheck, 
  Building2, 
  Tv, 
  ArrowLeft, 
  Copy, 
  Check, 
  Radio, 
  CheckCircle2,
} from 'lucide-react';

interface PortalGatewayProps {
  onSelectPortal: (portal: 'admin' | 'client' | 'player') => void;
  screensCount: number;
  accountsCount: number;
}

export const PortalGateway: React.FC<PortalGatewayProps> = ({
  onSelectPortal,
  screensCount,
  accountsCount,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyUrl = (portal: 'admin' | 'client' | 'player') => {
    const url = new URL(window.location.href);
    url.searchParams.set('portal', portal);
    if (portal !== 'player') {
      url.searchParams.delete('screen');
    }
    navigator.clipboard.writeText(url.toString());
    setCopiedKey(portal);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 selection:bg-purple-600 selection:text-white font-sans" dir="rtl">
      {/* Top Banner */}
      <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <TamyLogo size="md" showSubtitle={true} variant="purple" />
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-xs">
          <Radio className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
          <span>منظومة تامي لإدارة الشاشات الإعلانية • بوابات مستقلة ومؤمنة</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center my-10">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          اختر البوابة المستقلة للدخول
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-2xl mx-auto leading-relaxed">
          تم تصميم النظام بروابط دخول مستقلة ومنفصلة لكل دور: إدارة المسؤول، لوحة تحكم منشآت العملاء، وشاشات العرض الذكية.
        </p>
      </div>

      {/* 3 Dedicated Portal Cards */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        {/* 1. ADMIN PORTAL */}
        <div className="bg-white border border-slate-200/90 hover:border-purple-500 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group hover:shadow-xl shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                ?portal=admin
              </span>
            </div>

            <h2 className="text-lg font-black text-slate-900 group-hover:text-purple-700 transition-colors">
              بوابة إدارة النظام (الأدمن)
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              صفحة دخول خاصة بالمسؤول لإدارة حسابات المنشآت والشركات، تعيين وإصدار كود الشاشات، ومتابعة الحصص التخزينية.
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>صفحة تسجيل دخول محمية للمسؤول</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>إجمالي المنشآت المسجلة: <strong className="text-slate-900 font-bold">{accountsCount}</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2.5">
            <button
              onClick={() => onSelectPortal('admin')}
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>دخول بوابة الأدمن</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => copyUrl('admin')}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copiedKey === 'admin' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'admin' ? 'تم نسخ الرابط!' : 'نسخ الرابط المستقل'}</span>
            </button>
          </div>
        </div>

        {/* 2. CLIENT DASHBOARD PORTAL */}
        <div className="bg-white border border-slate-200/90 hover:border-purple-500 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group hover:shadow-xl shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                ?portal=client
              </span>
            </div>

            <h2 className="text-lg font-black text-slate-900 group-hover:text-purple-700 transition-colors">
              لوحة تحكم شاشات العملاء
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              صفحة دخول خاصة بالعميل تتيح له رفع المواد الإعلانية، جدولة أوقات وأيام العرض، واختيار شاشات فروعه الخاصة.
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>تسجيل دخول العميل المباشر والمنفصل</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>جدولة المواد الإعلانية وساعات البث</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2.5">
            <button
              onClick={() => onSelectPortal('client')}
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>دخول لوحة العميل</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => copyUrl('client')}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copiedKey === 'client' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'client' ? 'تم نسخ الرابط!' : 'نسخ الرابط المستقل'}</span>
            </button>
          </div>
        </div>

        {/* 3. SCREEN PLAYER PORTAL */}
        <div className="bg-white border border-slate-200/90 hover:border-purple-500 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group hover:shadow-xl shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <Tv className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                ?portal=player
              </span>
            </div>

            <h2 className="text-lg font-black text-slate-900 group-hover:text-purple-700 transition-colors">
              شاشة العرض (TV Player)
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              رابط مستقل مخصص للشاشات الذكية والتلفزيونات، يدعم كتابة كود الشاشة أو اختيارها وحفظها على الجهاز للتشغيل التلقائي.
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>دخول مباشر بكود الشاشة أو اختيار شاشة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>إجمالي الشاشات المسجلة: <strong className="text-slate-900 font-bold">{screensCount}</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2.5">
            <button
              onClick={() => onSelectPortal('player')}
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>فتح شاشة العرض</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => copyUrl('player')}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copiedKey === 'player' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'player' ? 'تم نسخ الرابط!' : 'نسخ الرابط المستقل'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Footer info */}
      <div className="max-w-6xl w-full mx-auto pt-6 border-t border-slate-200 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>TAMY Advertising Screen Control Systems • {new Date().getFullYear()}</span>
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
          <span>Portal URLs: ?portal=admin</span>
          <span>•</span>
          <span>?portal=client</span>
          <span>•</span>
          <span>?portal=player&screen=CODE</span>
        </div>
      </div>
    </div>
  );
};
