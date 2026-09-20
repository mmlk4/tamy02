import React from 'react';

interface TamyLogoProps {
  className?: string;
  variant?: 'purple' | 'white' | 'dark';
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const TamyLogo: React.FC<TamyLogoProps> = ({
  className = '',
  variant = 'purple',
  showSubtitle = false,
  size = 'md',
}) => {
  const subtitleColor =
    variant === 'white' ? 'text-purple-200' : variant === 'dark' ? 'text-slate-600' : 'text-purple-700';

  const heights = {
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-12',
    lg: 'h-16 sm:h-18',
    xl: 'h-20 sm:h-24',
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className={`flex items-center gap-3.5 ${heights[size]}`}>
        {/* Official Tamy Logo Image specified by user */}
        <img
          src="/logo.png"
          onError={(e) => {
            // Fallback directly to the official remote URL if needed
            e.currentTarget.src = 'https://b.top4top.io/p_3914dva0l1.png';
          }}
          alt="Tamy - الشعار الرسمي"
          referrerPolicy="no-referrer"
          className="h-full w-auto max-w-[280px] sm:max-w-none object-contain select-none pointer-events-none"
        />

        {showSubtitle && (
          <div className="flex flex-col justify-center border-r-2 border-slate-200 pr-3.5 mr-1">
            <span className="text-[13px] font-bold tracking-tight text-slate-800 leading-tight">
              أنظمة التحكم بالشاشات الإعلانية
            </span>
            <span className={`text-[11px] font-medium tracking-wide ${subtitleColor} mt-0.5`}>
              tamy.tech
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
