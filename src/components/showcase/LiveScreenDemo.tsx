import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Smartphone, 
  Play, 
  Pause, 
  SkipForward, 
  Maximize2, 
  Sparkles, 
  Clock, 
  Calendar, 
  Volume2,
  CheckCircle,
  ExternalLink,
  Fish,
  Coffee,
  UtensilsCrossed,
  Tag,
  Flame
} from 'lucide-react';

interface LiveScreenDemoProps {
  onOpenRealPlayer: () => void;
}

interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  price?: string;
  oldPrice?: string;
  timeSlot: string;
  tag: string;
  tagIcon: React.ComponentType<{ className?: string }>;
  bgGradient: string;
  icon: React.ComponentType<{ className?: string }>;
  details: string;
}

export const LiveScreenDemo: React.FC<LiveScreenDemoProps> = ({ onOpenRealPlayer }) => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  const slides: SlideItem[] = [
    {
      id: '1',
      title: 'مَفْطَحَك سَمَك',
      subtitle: 'شركة أسماك المرسى • SAMMARI',
      category: 'قائمة الغداء الرئيسية',
      price: '89 ر.س',
      oldPrice: '120 ر.س',
      timeSlot: '12:00 م - 04:00 م',
      tag: 'الأكثر مبيعاً',
      tagIcon: Flame,
      bgGradient: 'from-blue-900 via-indigo-900 to-slate-900',
      icon: Fish,
      details: 'أرز صيادية بالبهارات الخاصة مع تشكيلة سمك طازج مقلي ومقرمش وسلطات',
    },
    {
      id: '2',
      title: 'كابتشينو كونا وسينامون',
      subtitle: 'KONA Coffee & Roasters',
      category: 'قائمة الصباح والإفطار',
      price: '22 ر.س',
      oldPrice: '28 ر.س',
      timeSlot: '07:00 ص - 11:30 ص',
      tag: 'إفطار الصباح',
      tagIcon: Coffee,
      bgGradient: 'from-amber-950 via-stone-900 to-amber-900',
      icon: Coffee,
      details: 'بن كولومبي فاخر مع رغوة حليب ناعمة ولفائف القرفة الطازجة يومياً',
    },
    {
      id: '3',
      title: 'عرض التوفير العائلي',
      subtitle: 'الويكند والجمعة والسبت',
      category: 'عروض حصرية للفروع',
      price: '149 ر.س',
      oldPrice: '190 ر.س',
      timeSlot: 'طوال اليوم',
      tag: 'توفير 25%',
      tagIcon: Tag,
      bgGradient: 'from-purple-950 via-slate-900 to-indigo-950',
      icon: UtensilsCrossed,
      details: 'وجبة متكاملة لـ 4 أشخاص تشمل المقبلات والمشروبات والحلويات',
    },
  ];

  // Auto slide loop with progress bar
  useEffect(() => {
    if (!isPlaying) return;

    const duration = 5000; // 5 seconds per slide
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveSlideIndex((idx) => (idx + 1) % slides.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  const currentSlide = slides[activeSlideIndex];

  return (
    <section id="demo" className="py-16 sm:py-24 bg-white relative overflow-hidden font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-3 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>محاكي شاشات العرض الحية</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            شاهد كيف يظهر محتواك على الشاشات الذكية
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            اختبر البث التلقائي، دقة العرض الفائقة، والتنقل السلس بين المواد المجدولة في الوقت الفعلي.
          </p>

          {/* Orientation & Controls Toggle */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setOrientation('portrait')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orientation === 'portrait'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>ستاند طولي (Portrait 9:16)</span>
              </button>
              <button
                onClick={() => setOrientation('landscape')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orientation === 'landscape'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>تلفزيون عرضي (Landscape 16:9)</span>
              </button>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-600" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isPlaying ? 'إيقاف مؤقت' : 'متابعة البث'}</span>
            </button>

            <button
              onClick={() => {
                setProgress(0);
                setActiveSlideIndex((prev) => (prev + 1) % slides.length);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>المادة التالية</span>
            </button>
          </div>
        </div>

        {/* Live Simulator Viewport */}
        <div className="flex flex-col items-center justify-center">
          <div 
            className={`transition-all duration-500 rounded-3xl bg-slate-950 p-3 shadow-2xl border-4 border-slate-800 relative overflow-hidden flex flex-col ${
              orientation === 'portrait'
                ? 'w-full max-w-[340px] sm:max-w-[370px] h-[550px] sm:h-[600px]'
                : 'w-full max-w-3xl h-[380px] sm:h-[460px]'
            }`}
          >
            {/* Top Device Bezel & Live Badge */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 text-white text-[11px] border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold">بث حي متصل • TAMY LIVE</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-slate-400 text-[10px]">
                <Clock className="w-3 h-3" />
                <span>{new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Screen Content Container */}
            <div className={`flex-1 relative overflow-hidden bg-gradient-to-b ${currentSlide.bgGradient} text-white p-5 sm:p-6 flex flex-col justify-between transition-all duration-700`}>
              
              {/* Header inside slide */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-purple-200/80 font-bold block">
                    {currentSlide.category}
                  </span>
                  <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                    {currentSlide.subtitle}
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold border border-white/20 flex items-center gap-1.5">
                  <currentSlide.tagIcon className="w-3 h-3 text-amber-300" />
                  <span>{currentSlide.tag}</span>
                </span>
              </div>

              {/* Main Typography & Artwork */}
              <div className="my-auto text-center py-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center shadow-2xl mb-4 text-white">
                  <currentSlide.icon className="w-12 h-12 text-white drop-shadow-md" />
                </div>

                <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  {currentSlide.title}
                </h3>
                <p className="text-xs sm:text-sm text-purple-100/90 mt-2 max-w-sm mx-auto leading-relaxed">
                  {currentSlide.details}
                </p>

                {/* Price Display */}
                {currentSlide.price && (
                  <div className="mt-4 inline-flex items-baseline gap-2 bg-white/15 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/20">
                    <span className="text-2xl sm:text-3xl font-black text-amber-300">
                      {currentSlide.price}
                    </span>
                    {currentSlide.oldPrice && (
                      <span className="text-xs text-white/60 line-through">
                        {currentSlide.oldPrice}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer inside slide */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/80">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-purple-300" />
                  <span>جدول البث: {currentSlide.timeSlot}</span>
                </div>
                <div className="font-mono text-[9px] bg-black/40 px-2 py-0.5 rounded text-purple-200">
                  Slide {activeSlideIndex + 1}/{slides.length}
                </div>
              </div>

              {/* Progress Bar of current slide */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
                <div 
                  className="h-full bg-purple-500 transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Bottom Bezel with Tamy TV branding */}
            <div className="py-1 px-4 bg-slate-900 flex items-center justify-between text-[9px] text-slate-400 font-mono border-t border-slate-800">
              <span>TAMY DISPLAY PLAYER • v2.4</span>
              <span>1080 × 1920 60FPS</span>
            </div>
          </div>

          {/* Action button beneath simulator */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onOpenRealPlayer}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer hover:shadow-lg"
            >
              <Tv className="w-4 h-4" />
              <span>فتح مشغل الشاشات الكامل بكود الشاشة</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-slate-500">
              يدعم أجهزة التلفزيون الذكية، رسيفرات أندرويد، والشاشات الجدارية
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
