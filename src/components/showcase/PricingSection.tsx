import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ArrowLeft, 
  Sliders, 
  Tv,
  Layers,
  Star,
} from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (planName: string) => void;
  onOpenLiveDemo?: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
}) => {
  const [calculatorScreens, setCalculatorScreens] = useState<number>(1);

  // Single screen is 29 SAR/month, multiple screens is 23 SAR/month per screen
  const ratePerScreen = calculatorScreens === 1 ? 29 : 23;
  const calculatedMonthlyTotal = calculatorScreens * ratePerScreen;

  const plans = [
    {
      id: 'single-screen',
      name: 'ترخيص شاشة واحدة',
      badge: 'الترخيص الفردي',
      description: 'ترخيص كامل لشاشة عرض ذكية واحدة مع لوحة تحكم سحابية لإدارة المواد وجدولتها.',
      priceMonthly: '29',
      periodNote: 'شهرياً للشاشة',
      screensLabel: 'شاشة ذكية واحدة',
      popular: false,
      icon: Tv,
      // Only genuine, verified features actually built into Tamy
      features: [
        'ترخيص شاشة ذكية واحدة',
        'لوحة تحكم سحابية للمنشأة',
        'رفع وعرض الصور ومقاطع الفيديو',
        'جدولة العرض بحسب أيام الأسبوع وساعات البث',
        'ربط فوري للشاشة عبر كود الربط المباشر',
        'دعم العرض بالوضع الطولي (Portrait) أو الأفقي (Landscape)',
        'متابعة حالة اتصال الشاشة (متصلة / غير متصلة)',
        'دعم فني وتحديثات مستمرة للنظام',
      ],
      buttonText: 'طلب ترخيص شاشة (29 ر.س/شهرياً)',
    },
    {
      id: 'multiple-screens',
      name: 'تراخيص الشاشات المتعددة (شاشتان فأكثر)',
      badge: 'سعر مخفض للشاشات المتعددة',
      description: 'إدارة عدة شاشات في موقع واحد أو عبر عدة فروع بسعر مخفض للشاشة ولوحة تحكم موحدة.',
      priceMonthly: '23',
      periodNote: 'شهرياً لكل شاشة (خصم للشاشات المتعددة)',
      screensLabel: 'شاشتان فأكثر (خصم 23 ر.س للشاشة)',
      popular: true,
      icon: Layers,
      // Only genuine, verified features actually built into Tamy
      features: [
        'ترخيص مستقل لكل شاشة مفعلة',
        'سعر مخفض 23 ريال شهرياً لكل شاشة',
        'لوحة تحكم موحدة لإدارة كافة الشاشات',
        'إمكانية تخصيص محتوى مختلف لكل شاشة أو بث محتوى موحد',
        'جدولة مستقلة للمواد الإعلانية لكل شاشة',
        'رفع الصور ومقاطع الفيديو وإدارتها بسهولة',
        'تصنيف الشاشات بحسب الفروع والمواقع',
        'متابعة حالة الاتصال لجميع الشاشات في لوحة واحدة',
        'دعم فني متواصل للمنشأة',
      ],
      buttonText: 'طلب تراخيص متعددة (23 ر.س/شهرياً للشاشة)',
    },
  ];

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-slate-50 relative overflow-hidden font-sans" dir="rtl">
      {/* Background Subtle Patterns */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#9333ea_0.75px,transparent_0.75px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-3 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تسعير ترخيص الشاشات</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            تسعير واضح ومناسب لكل شاشة
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            تحكم كامل في شاشاتك الإعلانية وجدولة عروضك بسهولة عبر السحاب
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 items-stretch mb-14">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? 'bg-white border-2 border-purple-600 shadow-xl shadow-purple-600/10'
                    : 'bg-white border border-slate-200 hover:border-purple-300 hover:shadow-lg shadow-xs'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 right-8 bg-purple-600 text-white text-[11px] font-black px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300 shrink-0" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                <div>
                  {/* Top Category Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                      <Icon className="w-6 h-6" />
                    </div>
                    {!plan.popular && (
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-500 min-h-[32px] leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Price Tag - Monthly divided rate */}
                  <div className="my-5 pb-5 border-b border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-slate-900 tracking-tight">
                        {plan.priceMonthly}
                      </span>
                      <span className="text-xs font-bold text-slate-500">ر.س / شهرياً</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {plan.periodNote}
                    </div>

                    <div className="mt-3 text-xs font-bold text-slate-700 bg-slate-50 py-1.5 px-3 rounded-lg inline-block">
                      {plan.screensLabel}
                    </div>
                  </div>

                  {/* Verified Features List */}
                  <div className="space-y-2.5 mb-8">
                    <div className="text-xs font-bold text-slate-700 mb-2">ما تشمله الباقة:</div>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <div className="w-4 h-4 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Action CTA */}
                <button
                  onClick={() => onSelectPlan(plan.name)}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    plan.popular
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20'
                      : 'bg-slate-100 hover:bg-purple-50 text-slate-800 hover:text-purple-700 border border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <span>{plan.buttonText}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Interactive Custom Screen Calculator */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1 w-full text-right">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full mb-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>حاسبة عدد الشاشات</span>
              </div>
              <h4 className="text-lg font-black text-slate-900">
                حدد عدد الشاشات لحساب التكلفة الشهرية
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                اختر عدد الشاشات التي ترغب في تشغيلها:
              </p>

              {/* Slider */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>عدد الشاشات: <strong className="text-purple-700 text-base">{calculatorScreens}</strong> شاشة</span>
                  <span className="text-slate-400 font-mono">1 — 20 شاشة</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={calculatorScreens}
                  onChange={(e) => setCalculatorScreens(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>

            {/* Price Output box (No clear/prominent total annual price) */}
            <div className="w-full sm:w-64 bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-center shrink-0">
              <div className="text-xs text-slate-500 font-medium">
                التكلفة الشهرية التقديرية
              </div>
              <div className="text-3xl font-black text-purple-700 my-1">
                {calculatedMonthlyTotal} <span className="text-xs text-slate-600 font-bold">ر.س / شهرياً</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                {calculatorScreens === 1 ? (
                  <span>(29 ر.س للشاشة الواحدة)</span>
                ) : (
                  <span className="text-emerald-700 font-bold">
                    ({calculatorScreens} شاشات × 23 ر.س للشاشة)
                  </span>
                )}
              </div>

              <button
                onClick={() => onSelectPlan(`طلب ترخيص (${calculatorScreens} شاشات)`)}
                className="w-full mt-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                طلب الاشتراك
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
