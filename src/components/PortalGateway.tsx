import React, { useState } from 'react';
import { TamyLogo } from './TamyLogo';
import { PricingSection } from './showcase/PricingSection';
import { ContactModal } from './showcase/ContactModal';
import { 
  Tv, 
  ShieldCheck, 
  Building2, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  LogIn, 
  Phone, 
  Mail, 
  Globe, 
  Sparkles, 
  Clock, 
  Sliders, 
  Calendar, 
  HelpCircle, 
  ChevronDown, 
  MessageSquare, 
  ExternalLink, 
  Layers, 
  Radio,
  Zap,
  Store,
  MonitorCheck,
  CheckCircle,
  UtensilsCrossed,
  ShoppingBag,
  Stethoscope
} from 'lucide-react';

interface PortalGatewayProps {
  onSelectPortal: (portal: 'admin' | 'client' | 'player' | 'login') => void;
  screensCount: number;
  accountsCount: number;
}

export const PortalGateway: React.FC<PortalGatewayProps> = ({
  onSelectPortal,
  screensCount,
  accountsCount,
}) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleOpenContact = (planName?: string) => {
    setSelectedPlanName(planName || null);
    setIsContactModalOpen(true);
  };

  const handleWhatsAppChat = () => {
    const text = encodeURIComponent(
      'مرحباً تامي، أرغب في الاستفسار عن باقات نظام إدارة الشاشات الإعلانية الذكية.'
    );
    window.open(`https://wa.me/9665110185858?text=${text}`, '_blank');
  };

  const faqs = [
    {
      q: 'كم تكلفة ترخيص الشاشة في نظام تامي؟',
      a: 'تبلغ تكلفة ترخيص الشاشة الواحدة 29 ريال شهرياً، وتصل إلى 23 ريال شهرياً لكل شاشة عند اشتراك الشاشات المتعددة، وتشمل لوحة تحكم سحابية لرفع وجدولة محتواك الإعلاني وإدارته بسهولة.',
    },
    {
      q: 'هل أحتاج لشراء أجهزة خاصة أو معقدة لتشغيل تامي؟',
      a: 'لا، نظام تامي مصمم ليعمل على أي شاشة ذكية متصلة بالإنترنت (Smart TV بنظام Android TV أو شاشات سامسونج أو إل جي)، أو باستخدام أي جهاز TV Box أو TV Stick اقتصادي يتصل بمنفذ HDMI.',
    },
    {
      q: 'كيف يتم تحديث الإعلانات وقوائم الأسعار في الفروع؟',
      a: 'يتم التحديث لحظياً وسحابياً بالكامل عبر لوحة التحكم الخاصة بك في تامي من هاتفك أو حاسوبك، دون الحاجة لزيارة الفروع أو نسخ الملفات على فلاش ميموري (USB).',
    },
    {
      q: 'هل يدعم النظام جدولة وجبات الإفطار والغداء وعروض الويكند تلقائياً؟',
      a: 'نعم بكل تأكيد! يمكنك تحديد جدول زمني بالساعة والدقيقة وأيام الأسبوع لكل مادة إعلانية، لتبدأ قائمة الإفطار وتتحول تلقائياً لقائمة الغداء أو العشاء حسب توقيتاتك المحددة.',
    },
    {
      q: 'ماذا يحدث إذا انقطع اتصال الإنترنت مؤقتاً في المحل؟',
      a: 'تم تصميم مشغل الشاشات (Tamy Player) ليعتمد على تخزين مؤقت ذكي، مما يعني استمرار تشغيل المواد الإعلانية بسلاسة دون توقف حتى يعود الاتصال السحابي.',
    },
    {
      q: 'هل يمكنني إدارة عدة شاشات وفروع مختلفة بحساب واحد؟',
      a: 'نعم، يتيح لك النظام ربط عدد غير محدود من الشاشات وتصنيفها حسب الفروع والمواقع، مع إمكانية بث محتوى مخصص لكل شاشة أو بث إعلان موحد لجميع الفروع بضغطة زر.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-purple-600 selection:text-white font-sans" dir="rtl">
      
      {/* 1. TOP HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo with Slogan Subtitle */}
          <div className="flex items-center gap-6">
            <TamyLogo size="md" showSubtitle={true} variant="purple" />
          </div>

          {/* Action Buttons: Screen Player & Unified Login */}
          <div className="flex items-center gap-2.5">
            {/* Screens Player Button */}
            <button
              onClick={() => onSelectPortal('player')}
              className="flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 hover:text-purple-700 border border-slate-300 hover:border-purple-300 transition-all shadow-2xs cursor-pointer"
              title="الدخول إلى مشغل الشاشات الذكية والتلفزيونات"
            >
              <Tv className="w-4 h-4 text-purple-600" />
              <span>دخول الشاشات</span>
            </button>

            {/* Unified Login Button */}
            <button
              onClick={() => onSelectPortal('login')}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-all shadow-md shadow-purple-600/25 cursor-pointer hover:shadow-lg"
              title="تسجيل الدخول الموحد للأدمن والمنشآت"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        
        {/* 2. HERO SECTION */}
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden bg-gradient-to-b from-white via-purple-50/25 to-slate-50">
          
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-[700px] h-[500px] bg-purple-200/25 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="max-w-4xl mx-auto text-center">
              
              {/* Brand Slogan Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/90 text-purple-800 text-xs font-bold mb-6 border border-purple-200 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                <span>أنظمة التحكم بالشاشات الإعلانية الذكية • TAMY 2024</span>
              </div>

              {/* Official Slogan Headline (From 0102-23.png & tamy 2024-18.jpg) */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.2]">
                قم بإدارة شاشاتك الإعلانية <br className="hidden sm:inline" />
                <span className="text-purple-700 relative inline-block">
                  في مكان واحد
                  <span className="absolute bottom-1 left-0 right-0 h-2 bg-purple-200/60 -z-10 rounded-full"></span>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-lg text-slate-600 mt-5 max-w-2xl mx-auto leading-relaxed">
                منصة سحابية متطورة تمكن المطاعم والمتاجر وسلاسل الفروع من التحكم الفوري وجدولة قوائم الطعام والعروض الترويجية على كافة الشاشات بدقة وسرعة فائقة.
              </p>

              {/* Hero Call to Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <button
                  onClick={() => onSelectPortal('login')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer hover:shadow-xl"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول للمنصة</span>
                </button>

                <button
                  onClick={() => onSelectPortal('player')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 hover:border-purple-300 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Tv className="w-4 h-4 text-purple-600" />
                  <span>دخول شاشات العرض الذكية</span>
                </button>

                <button
                  onClick={() => handleOpenContact()}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>طلب باقة أو تجربة</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>مزامنة سحابية لحظية بدون USB</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>دعم الشاشات الرأسية والأفقية</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>جدولة أوتوماتيكية حسب الوجبات والساعات</span>
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* 3. KEY FEATURES & CAPABILITIES */}
        <section id="features" className="py-16 sm:py-24 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="max-w-3xl mx-auto text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-3 border border-purple-200">
                <Zap className="w-3.5 h-3.5" />
                <span>إمكانيات مصممة لنمو مبيعاتك</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                كل ما تحتاجه لإدارة شاشات فروعك باحترافية
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
                وداعاً لتغيير الفلاشات وتأخير تحديث الأسعار. تحكّم في شاشاتك أينما كنت وفي أي وقت.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Radio className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                  مزامنة سحابية وبث فوري
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  ارفع تصميمك أو قائمتك الجديدة واضغط نشر؛ ستنعكس التغييرات فوراً على شاشات الفروع دون الحاجة لإعادة تشغيل التلفزيون أو زيارة الموقع.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                  جدولة ذكية بالساعة واليوم
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  حدّد مسبقاً مواعيد ظهور الإفطار، الغداء، العشاء، وعروض نهاية الأسبوع. يبدأ المحتوى المخصص بالظهور في الدقيقة المحددة وينتهي تلقائياً.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Tv className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                  دعم جميع أنواع الشاشات
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  سواء كانت شاشتك ستاند طولي (9:16) أو تلفزيون جداري عرضي (16:9)، يعرض النظام محتواك بالأبعاد المناسبة وبدقة عالية ووضوح كامل.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                  إدارة متعددة الفروع والمناطق
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  صنّف شاشاتك حسب المدينة والفرع، وقم ببث عروض خاصة بفرع معين، أو إطلاق حملة تسويقية شاملة لجميع فروع المملكة في آن واحد.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                  كود ربط وحفظ تلقائي
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  كل شاشة تملك كود تفعيل بسيط. بمجرد إدخاله لمرة واحدة، يحفظ في ذاكرة التلفزيون ويبدأ البث تلقائياً كل صباح بمجرد تشغيل الجهاز.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <MonitorCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                  مراقبة حية وحالة الاتصال
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  لوحة معلومات تبين لك الشاشات المتصلة بالإنترنت حالياً وتلك غير المتصلة، مع معرفة المادة الإعلانية المعروضة في الوقت الفعلي.
                </p>
              </div>

            </div>
          </div>
        </section>


        {/* 4. HOW IT WORKS (3 SIMPLE STEPS) */}
        <section id="how-it-works" className="py-16 sm:py-24 bg-purple-900 text-white relative overflow-hidden font-sans">
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            <div className="max-w-3xl mx-auto text-center mb-14">
              <span className="text-purple-300 font-bold text-xs uppercase tracking-wider block mb-2">
                انطلق في 3 دقائق فقط
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                كيف تبدأ تشغيل شاشاتك مع تامي؟
              </h2>
              <p className="text-sm sm:text-base text-purple-200 mt-2">
                خطوات سهلة ومباشرة لا تتطلب أي خبرة تقنية أو مهندسين ميدانيين.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Step 1 */}
              <div className="p-7 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 relative flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-xl flex items-center justify-center mb-5 shadow-md">
                    1
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">
                    افتح الرابط وأدخل الكود
                  </h3>
                  <p className="text-xs text-purple-100 leading-relaxed">
                    افتح متصفح شاشتك الذكية وأدخل رابط البث ثم اكتب كود الشاشة الممنوح لك من لوحة التحكم، وسيتم حفظه تلقائياً.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-purple-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>يعمل لمرة واحدة فقط</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-7 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 relative flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-xl flex items-center justify-center mb-5 shadow-md">
                    2
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">
                    ارفع تصاميمك وحدد الأوقات
                  </h3>
                  <p className="text-xs text-purple-100 leading-relaxed">
                    من جوالك أو جهازك، ارفع صور وفيديوهات منتجاتك وحدد أيام الأسبوع وساعات العرض (مثلاً من 12:00 م حتى 04:00 م).
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-purple-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>دعم الصور والفيديوهات عالية الدقة</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-7 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 relative flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-xl flex items-center justify-center mb-5 shadow-md">
                    3
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">
                    استمتع بالعرض التلقائي
                  </h3>
                  <p className="text-xs text-purple-100 leading-relaxed">
                    تبدأ الشاشة فوراً بعرض المحتوى وتغييره حسب التوقيت دون أي تدخل منك، مع إمكانية التعديل في أي لحظة.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-purple-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>مزامنة فورية على مدار 24 ساعة</span>
                </div>
              </div>

            </div>

            {/* Bottom Step CTA */}
            <div className="mt-12 text-center">
              <button
                onClick={() => onSelectPortal('login')}
                className="px-8 py-3.5 rounded-xl bg-white text-purple-950 hover:bg-purple-50 font-black text-xs sm:text-sm shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>دخول لوحة التحكم والبدء فوراً</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

          </div>
        </section>


        {/* 6. PRICING & PACKAGES SECTION (Requested explicitly by user) */}
        <PricingSection 
          onSelectPlan={(plan) => handleOpenContact(plan)}
          onOpenLiveDemo={() => {
            const el = document.getElementById('demo');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />


        {/* 7. SECTORS SERVED */}
        <section className="py-16 sm:py-20 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-10">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                قطاعات تثق بنظام تامي لإدارة شاشاتها
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                حلول رقمية مرنة تناسب بيئات الأعمال والمتاجر الأكثر حيوية
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-100/70 text-purple-700 flex items-center justify-center mb-3">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-800 text-xs block">المطاعم والكافيهات</span>
                <span className="text-[11px] text-slate-500 mt-1 block">قوائم طعام وعروض وجبات سريعة</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-blue-700 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-800 text-xs block">المعارض ومحلات التجزئة</span>
                <span className="text-[11px] text-slate-500 mt-1 block">تخفيضات وإعلانات منتجات مميزة</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-3">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-800 text-xs block">العيادات والمستشفيات</span>
                <span className="text-[11px] text-slate-500 mt-1 block">إرشادات وأرقام انتظار وباقات رعاية</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-700 flex items-center justify-center mb-3">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-800 text-xs block">الشركات وصالات العرض</span>
                <span className="text-[11px] text-slate-500 mt-1 block">رسائل ترحيبية وأخبار وإعلانات داخلية</span>
              </div>
            </div>
          </div>
        </section>


        {/* 8. FAQ ACCORDION */}
        <section id="faq" className="py-16 sm:py-24 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-3 border border-purple-200">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>إجابات على أكثر الاستفسارات شيوعاً</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                الأسئلة الشائعة حول نظام تامي
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((item, idx) => (
                <div 
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200 overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-purple-700 transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-purple-600' : ''}`} />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* 9. CONTACT & CONSULTATION BANNER (Official details from tamy 2024-18.jpg) */}
        <section id="contact" className="py-16 bg-gradient-to-r from-purple-800 to-indigo-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              
              <div className="text-center lg:text-right max-w-xl">
                <span className="text-purple-300 font-bold text-xs uppercase tracking-wider block mb-1">
                  تواصل مباشر مع فريق تامي
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  هل تحتاج استشارة أو تجهيز شاشات لفروعك؟
                </h3>
                <p className="text-xs sm:text-sm text-purple-200 mt-2 leading-relaxed">
                  فريقنا الهندسي والتسويقي متاح للإجابة على استفساراتك وتزويدك بعرض سعر تفصيلي مناسب لحجم نشاطك.
                </p>

                {/* Direct info icons */}
                <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-purple-100">
                  <a 
                    href="tel:+9665110185858" 
                    className="flex items-center gap-2 hover:text-white transition-colors"
                    dir="ltr"
                  >
                    <Phone className="w-4 h-4 text-purple-300" />
                    <span className="font-mono font-bold">+966 511 018 5858</span>
                  </a>

                  <a 
                    href="mailto:info@tamy.tech" 
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4 text-purple-300" />
                    <span>info@tamy.tech</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-300" />
                    <span>tamy.tech</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={handleWhatsAppChat}
                  className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>تحدث معنا عبر واتساب</span>
                </button>

                <button
                  onClick={() => handleOpenContact()}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white text-purple-950 hover:bg-purple-50 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <span>طلب نموذج عرض سعر</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </section>

      </main>


      {/* 10. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <TamyLogo size="md" showSubtitle={true} variant="white" />
            
            <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs text-slate-400">
              <a href="mailto:info@tamy.tech" className="hover:text-white transition-colors">info@tamy.tech</a>
              <span className="text-slate-700">•</span>
              <span dir="ltr">+966 511 018 5858</span>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div>
              جميع الحقوق محفوظة © {new Date().getFullYear()} — نظام تامي للتحكم بالشاشات الإعلانية (TAMY Advertising Screen Systems • tamy.tech)
            </div>
            <div className="text-slate-500">
              المملكة العربية السعودية
            </div>
          </div>

        </div>
      </footer>


      {/* Contact & Request Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        selectedPlan={selectedPlanName}
      />

    </div>
  );
};
