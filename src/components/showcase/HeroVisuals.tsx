import React, { useState } from 'react';
import { 
  Tv, 
  Smartphone, 
  LayoutDashboard, 
  Clock, 
  Calendar, 
  Play, 
  Sparkles, 
  Check, 
  Upload, 
  Trash2, 
  Radio, 
  ChevronRight, 
  ChevronLeft,
  Volume2,
  Fish,
  Coffee,
  ChefHat,
  Zap,
  ChevronDown,
  Film
} from 'lucide-react';

export const HeroVisuals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cascade' | 'dashboard' | 'mobile'>('cascade');
  const [selectedDemoScreen, setSelectedDemoScreen] = useState<number>(1);
  const [simulatedDay, setSimulatedDay] = useState<string>('Monday');

  return (
    <div className="w-full relative select-none">
      {/* Visual Navigation Tabs */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/80 shadow-2xs">
          <button
            onClick={() => setActiveTab('cascade')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'cascade'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>شاشات العرض (3D Signage)</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>لوحة التحكم (Dashboard)</span>
          </button>

          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'mobile'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>التحكم من الجوال (Mobile)</span>
          </button>
        </div>
      </div>

      {/* 1. CASCADE VIEW (Inspired directly by 0102-27.png) */}
      {activeTab === 'cascade' && (
        <div className="relative w-full max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-purple-50/60 via-white to-purple-50/40 p-4 sm:p-8 border border-purple-100 shadow-xl overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Indicator */}
          <div className="flex items-center justify-between mb-6 text-xs text-slate-500 relative z-10">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-slate-700">بث حي متزامن عبر السحابة</span>
            </div>
            <div className="text-[11px] font-mono bg-purple-100/70 text-purple-800 px-2.5 py-0.5 rounded-full font-bold">
              TAMY SIGNAGE 2024
            </div>
          </div>

          {/* 3D-Like Fan/Cascade Screens Presentation */}
          <div className="relative h-[380px] sm:h-[430px] flex items-center justify-center perspective-[1000px] overflow-visible">
            
            {/* Left Screen 1 (Deep Background) */}
            <div 
              className="absolute transform -translate-x-36 sm:-translate-x-48 scale-[0.78] opacity-60 rounded-2xl bg-white border border-purple-200 shadow-md w-44 sm:w-52 h-[340px] sm:h-[380px] flex flex-col overflow-hidden transition-all duration-300 hover:opacity-90 hover:scale-85 hover:z-20 cursor-pointer"
              onClick={() => setSelectedDemoScreen(0)}
            >
              <div className="h-full bg-gradient-to-b from-amber-500/10 via-amber-100/30 to-amber-900/40 p-3 flex flex-col justify-between relative">
                <div className="text-center font-bold text-amber-900 text-[10px] tracking-wider uppercase">
                  SAMMARI SEAFOOD
                </div>
                <div className="my-auto text-center">
                  <div className="w-20 h-20 rounded-full bg-amber-200/80 mx-auto mb-2 flex items-center justify-center shadow-inner overflow-hidden border border-amber-300 text-amber-900">
                    <Fish className="w-9 h-9" />
                  </div>
                  <div className="text-xs font-black text-amber-950">صيادية سمك بلدي</div>
                  <div className="text-[10px] text-amber-800 font-bold mt-1">45 ر.س</div>
                </div>
                <div className="text-[9px] text-center text-amber-800/80 font-mono">
                  12:00 PM - 04:00 PM
                </div>
              </div>
            </div>

            {/* Center Screen (Main Showcase: "مفطحك سمك" - شركة أسماك المرسى SAMMARI) */}
            <div 
              className="relative z-30 transform scale-100 rounded-3xl bg-white border-2 border-purple-500 shadow-2xl shadow-purple-600/20 w-52 sm:w-64 h-[370px] sm:h-[415px] flex flex-col overflow-hidden transition-all"
            >
              {/* Screen Top Bezel */}
              <div className="bg-slate-900 text-white px-3 py-1.5 flex items-center justify-between text-[10px]">
                <span className="font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  شاشة الواجهة الرئيسية
                </span>
                <span className="font-mono text-purple-300 text-[9px]">albasatin 001</span>
              </div>

              {/* Poster Body mimicking 0102-27.png & 0102-22.png */}
              <div className="flex-1 bg-gradient-to-b from-slate-50 via-amber-50/30 to-slate-100 p-4 flex flex-col justify-between text-center relative overflow-hidden">
                {/* Decorative wavy curves */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#7e22ce_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

                {/* Top Brand Logo */}
                <div>
                  <div className="text-[11px] font-black tracking-widest text-slate-800 uppercase font-sans">
                    سَـمّـاري
                  </div>
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                    SAMMARI • شركة أسماك المرسى
                  </div>
                </div>

                {/* Central Typography Banner */}
                <div className="my-2 py-3 px-2 bg-gradient-to-b from-blue-900 to-indigo-950 text-white rounded-2xl shadow-lg border border-blue-800 relative overflow-hidden">
                  <div className="text-[9px] font-bold text-blue-200 tracking-wider">
                    عرض الغداء الحصري
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-tight my-1 tracking-tight">
                    مَفْطَحَك سَمَك
                  </div>
                  <div className="text-[10px] text-amber-300 font-bold">
                    مع أرز الصيادية والمقبلات
                  </div>
                </div>

                {/* Dish Visual Preview */}
                <div className="relative bg-amber-100/50 rounded-2xl p-2.5 border border-amber-200/60 shadow-inner flex items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-800 shadow-xs">
                    <ChefHat className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-600 block">عرض خاص لفترة محدودة</span>
                    <span className="text-sm font-black text-purple-700">89 ر.س</span>
                    <span className="text-[9px] text-slate-400 line-through mr-1.5">120 ر.س</span>
                  </div>
                </div>

                {/* Bottom Footer Info */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
                  <span className="font-bold">متاح اليوم حتى 11 مساءً</span>
                  <span className="font-mono text-purple-600 font-bold">TAMY PLAYER</span>
                </div>
              </div>

              {/* Bottom Bezel with Tamy Signature Branding */}
              <div className="bg-purple-950 py-1.5 px-3 flex items-center justify-between text-[10px] text-white">
                <span className="font-bold tracking-wider text-purple-300 text-[9px]">
                  TAMY SIGNAGE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
            </div>

            {/* Right Screen (Deep Background) */}
            <div 
              className="absolute transform translate-x-36 sm:translate-x-48 scale-[0.78] opacity-60 rounded-2xl bg-white border border-purple-200 shadow-md w-44 sm:w-52 h-[340px] sm:h-[380px] flex flex-col overflow-hidden transition-all duration-300 hover:opacity-90 hover:scale-85 hover:z-20 cursor-pointer"
              onClick={() => setSelectedDemoScreen(2)}
            >
              <div className="h-full bg-gradient-to-b from-purple-500/10 via-purple-100/30 to-purple-900/40 p-3 flex flex-col justify-between relative">
                <div className="text-center font-bold text-purple-900 text-[10px] tracking-wider uppercase">
                  KONA CAFE & BAKERY
                </div>
                <div className="my-auto text-center">
                  <div className="w-20 h-20 rounded-full bg-purple-200/80 mx-auto mb-2 flex items-center justify-center shadow-inner overflow-hidden border border-purple-300 text-purple-900">
                    <Coffee className="w-9 h-9" />
                  </div>
                  <div className="text-xs font-black text-purple-950">سبانش لاتيه مثلج</div>
                  <div className="text-[10px] text-purple-800 font-bold mt-1">18 ر.س</div>
                </div>
                <div className="text-[9px] text-center text-purple-800/80 font-mono">
                  07:00 AM - 12:00 PM
                </div>
              </div>
            </div>

          </div>

          {/* Slogan Banner from 0102-23.png */}
          <div className="mt-4 pt-4 border-t border-purple-100/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Tv className="w-4 h-4" />
              </div>
              <span className="text-sm font-black text-purple-950">
                قم بإدارة شاشاتك الإعلانية في مكان واحد
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              يدعم الشاشات الرأسية والأفقية وتلفزيونات الفروع بدقة فائقة
            </span>
          </div>
        </div>
      )}

      {/* 2. DASHBOARD VIEW (Inspired directly by 0102-22.png) */}
      {activeTab === 'dashboard' && (
        <div className="relative w-full max-w-4xl mx-auto rounded-3xl bg-slate-900 text-white p-4 sm:p-6 shadow-2xl border border-slate-800 overflow-hidden font-sans" dir="ltr">
          {/* Top Mock Window Bar */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              <span className="ml-2 font-mono text-slate-400 text-[11px]">https://tamy.tech/dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-purple-400 font-bold text-[11px]">KONA CO.</span>
              <span className="bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded-md font-mono text-[10px]">Client Mode</span>
            </div>
          </div>

          {/* Content Layout from 0102-22.png */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Table Area (Left 8 cols) */}
            <div className="lg:col-span-8 bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-purple-400" />
                  <span>Media for Display: albasatin 001</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">1 Active Item</span>
              </div>

              {/* Table replica */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-purple-900/40 text-purple-200 border-b border-purple-800/40">
                    <tr>
                      <th className="py-2 px-3">Image/Video</th>
                      <th className="py-2 px-3">Days</th>
                      <th className="py-2 px-3">Start Time</th>
                      <th className="py-2 px-3">End Time</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-10 rounded-md bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                            <Film className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-[10px]">Al-Marsa Banner.mp4</div>
                            <div className="text-[9px] text-slate-400">1080x1920 • 15s</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-purple-300 text-[10px]">
                        Mon, Wed, Fri
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">12:00</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">15:30</td>
                      <td className="py-2.5 px-3 text-right">
                        <button className="px-2 py-0.5 rounded bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 text-[10px] font-mono border border-rose-600/30">
                          Delete
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/30 flex items-center justify-between text-[10px] text-purple-200">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Real-time Cloud Sync: Status Online</span>
                </span>
                <span className="font-mono">Ping: 24ms</span>
              </div>
            </div>

            {/* Upload Sidebar Area (Right 4 cols from 0102-22.png) */}
            <div className="lg:col-span-4 bg-slate-950/90 rounded-2xl p-4 border border-slate-800 text-xs">
              <h5 className="font-bold text-white mb-2 pb-1 border-b border-slate-800">Upload Media</h5>
              
              <div className="space-y-2.5 text-[11px]">
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px]">Screen Select</label>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-[10px] flex items-center justify-between">
                    <span>albasatin 001</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 text-[10px]">Active Days</label>
                  <div className="flex flex-wrap gap-1 text-[9px]">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                      <span
                        key={d}
                        className={`px-2 py-0.5 rounded-md font-bold ${
                          i === 1 || i === 3 || i === 5
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-0.5 text-[10px]">Start</label>
                    <div className="p-1 rounded-md bg-slate-900 border border-slate-700 font-mono text-[10px] text-center">
                      12:00 PM
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5 text-[10px]">End</label>
                    <div className="p-1 rounded-md bg-slate-900 border border-slate-700 font-mono text-[10px] text-center">
                      03:30 PM
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-[10px]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload & Schedule</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. MOBILE APP VIEW (Inspired directly by tamy 2024-18.jpg) */}
      {activeTab === 'mobile' && (
        <div className="relative w-full max-w-3xl mx-auto py-4 flex flex-col sm:flex-row items-center justify-center gap-6">
          
          {/* Mobile Phone 1: Dashboard */}
          <div className="w-64 h-[420px] rounded-[36px] bg-slate-900 p-2.5 shadow-2xl border-4 border-slate-800 relative flex flex-col">
            {/* Dynamic Island */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-800 ml-2"></div>
            </div>

            {/* Mobile Screen Content */}
            <div className="flex-1 bg-white rounded-[26px] p-3 text-slate-900 flex flex-col justify-between overflow-hidden" dir="rtl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-[11px] font-black text-purple-700">Tamy Mobile</span>
                <span className="text-[9px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                  فرع البساتين
                </span>
              </div>

              <div className="my-auto space-y-2">
                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                  <div className="text-[10px] text-purple-900 font-bold">المحتوى المعروض حالياً</div>
                  <div className="text-xs font-black text-purple-950 mt-0.5">عرض الغداء - أسماك المرسى</div>
                  <div className="text-[9px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-600" />
                    <span>مجدول: 12:00 م - 03:30 م</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[9px] text-slate-500">حالة الشاشة</div>
                    <div className="text-[10px] font-bold text-emerald-600">متصلة 🟢</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[9px] text-slate-500">دقة العرض</div>
                    <div className="text-[10px] font-bold text-slate-700 font-mono">4K UHD</div>
                  </div>
                </div>
              </div>

              <button className="w-full py-2 bg-purple-600 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1">
                <Upload className="w-3 h-3" />
                <span>رفع وتغيير العرض فوراً</span>
              </button>
            </div>
          </div>

          {/* Mobile Phone 2: Login */}
          <div className="w-64 h-[420px] rounded-[36px] bg-slate-900 p-2.5 shadow-2xl border-4 border-slate-800 relative flex flex-col hidden sm:flex">
            {/* Dynamic Island */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2"></div>

            {/* Mobile Screen Content */}
            <div className="flex-1 bg-white rounded-[26px] p-4 text-slate-900 flex flex-col justify-center text-center">
              <div className="text-xl font-black text-purple-700 mb-1">Tamy</div>
              <div className="text-[9px] text-slate-500 mb-4">أنظمة التحكم بالشاشات الإعلانية</div>

              <div className="space-y-2 text-right">
                <div>
                  <div className="text-[9px] text-slate-600 mb-0.5">اسم المستخدم أو الكود</div>
                  <div className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 text-[10px] font-mono border border-slate-200">
                    kona_user
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-600 mb-0.5">كلمة المرور</div>
                  <div className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 text-[10px] font-mono border border-slate-200">
                    ••••••••
                  </div>
                </div>
                <div className="w-full py-2 bg-purple-600 text-white rounded-lg text-[10px] font-bold mt-2 shadow-sm text-center">
                  دخول لوحة التحكم
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
