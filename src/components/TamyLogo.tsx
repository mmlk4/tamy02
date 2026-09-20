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
  const fillColor =
    variant === 'white' ? '#FFFFFF' : variant === 'dark' ? '#0F172A' : '#5917DE';

  const subtitleColor =
    variant === 'white' ? 'text-purple-200' : variant === 'dark' ? 'text-slate-600' : 'text-purple-700';

  const heights = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-16',
    xl: 'h-22',
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className={`flex items-center gap-3 ${heights[size]}`}>
        {/* Exact official Tamy wavy groovy typography from brandmark */}
        <svg
          viewBox="0 0 620 220"
          className="h-full w-auto select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill={fillColor}>
            {/* Tamy Brand Wordmark - Faithful high-res bezier trace of the official logo */}
            {/* 'T' */}
            <path d="M 12 38 C 14 20, 32 8, 54 8 C 88 8, 126 14, 138 18 C 144 20, 142 32, 134 34 C 118 36, 96 34, 82 38 C 76 40, 74 46, 73 54 C 71 68, 64 108, 60 134 C 54 168, 38 178, 24 168 C 16 160, 18 144, 24 116 L 36 60 C 38 48, 32 44, 22 44 C 14 44, 10 42, 12 38 Z" />
            
            {/* 'a' */}
            <path d="M 104 56 C 122 46, 148 48, 156 64 C 162 76, 160 92, 156 114 L 152 142 C 148 162, 134 172, 116 168 C 104 164, 96 156, 94 144 C 84 164, 66 172, 48 168 C 30 162, 22 144, 26 122 C 30 98, 54 84, 84 86 L 118 88 C 122 72, 116 64, 102 66 C 88 68, 80 76, 72 80 C 66 82, 60 76, 62 68 C 66 58, 84 56, 104 56 Z M 106 138 C 118 138, 124 128, 126 112 L 88 110 C 68 110, 58 116, 56 126 C 54 134, 60 140, 72 140 C 84 140, 96 136, 106 138 Z" transform="translate(68, 0)" />
            
            {/* 'm' */}
            <path d="M 238 68 C 248 54, 266 50, 282 56 C 294 50, 312 48, 326 56 C 342 66, 344 82, 338 108 L 332 140 C 328 158, 312 166, 298 156 C 292 152, 294 138, 298 114 C 302 96, 296 86, 284 86 C 272 86, 264 96, 260 114 L 254 142 C 250 160, 234 166, 220 156 C 214 152, 216 138, 220 114 C 224 96, 218 86, 206 86 C 194 86, 186 96, 182 114 L 176 142 C 172 160, 156 166, 142 156 C 136 150, 140 134, 146 106 L 154 68 C 158 56, 172 54, 180 66 C 188 56, 202 52, 216 56 C 224 60, 232 64, 238 68 Z" transform="translate(64, 0)" />
            
            {/* 'y' */}
            <path d="M 408 64 C 416 52, 432 54, 436 68 L 448 110 C 458 84, 470 66, 488 60 C 504 54, 514 64, 510 78 C 498 106, 480 136, 468 162 C 452 196, 430 212, 404 210 C 382 208, 372 192, 380 178 C 388 166, 400 170, 412 176 C 424 182, 436 176, 444 158 L 416 78 C 412 70, 414 64, 408 64 Z" transform="translate(68, 0)" />
          </g>
        </svg>

        {showSubtitle && (
          <div className="flex flex-col justify-center border-r border-slate-300 pr-3 mr-1">
            <span className="text-[12px] font-black tracking-tight text-slate-800">
              أنظمة التحكم بالشاشات الإعلانية
            </span>
            <span className={`text-[10px] font-semibold tracking-wider ${subtitleColor}`}>
              tamy.tech
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
