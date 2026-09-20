import React, { useState, useEffect, useRef } from 'react';
import { ScreenDevice, ClientAccount } from '../types';
import { StorageService } from '../services/storage';
import { TamyLogo } from './TamyLogo';
import { 
  Tv, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Monitor, 
  Smartphone,
  Sparkles
} from 'lucide-react';

interface ScreenPlayerLauncherProps {
  screens: ScreenDevice[];
  accounts: ClientAccount[];
  onLaunchScreen: (screenCode: string, saveAsDefault: boolean) => void;
  onNavigatePortal: (portal: 'gateway' | 'admin' | 'client') => void;
  initialCode?: string;
}

type FocusZone = 'input' | 'saved' | 'screens_list';

export const ScreenPlayerLauncher: React.FC<ScreenPlayerLauncherProps> = ({
  screens,
  accounts,
  onLaunchScreen,
  onNavigatePortal,
  initialCode = '',
}) => {
  const [typedCode, setTypedCode] = useState(initialCode);
  const [savedScreenCode, setSavedScreenCode] = useState<string | null>(() =>
    StorageService.getSavedScreenCode()
  );
  
  // Keyboard focus navigation state:
  // 'input': inside the code input box
  // 'saved': on the saved screen button (if exists)
  // 'screens_list': navigating the available screens list
  const [focusZone, setFocusZone] = useState<FocusZone>(() => 
    savedScreenCode ? 'saved' : 'input'
  );

  const [selectedScreenIndex, setSelectedScreenIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when focusZone is 'input'
  useEffect(() => {
    if (focusZone === 'input') {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [focusZone]);

  // Find saved screen device if exists
  const savedScreenDevice = savedScreenCode
    ? screens.find(s => s.code.toLowerCase() === savedScreenCode.toLowerCase())
    : null;

  // Handle Global Keyboard Navigation (Arrows + Enter + Direct Typing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Enter Key -> Launch
      if (e.key === 'Enter') {
        e.preventDefault();
        if (focusZone === 'saved' && savedScreenCode) {
          onLaunchScreen(savedScreenCode, true);
        } else if (focusZone === 'screens_list' && screens[selectedScreenIndex]) {
          onLaunchScreen(screens[selectedScreenIndex].code, true);
        } else if (typedCode.trim()) {
          onLaunchScreen(typedCode.trim(), true);
        }
        return;
      }

      // 2. Escape Key -> Return to Gateway
      if (e.key === 'Escape') {
        onNavigatePortal('gateway');
        return;
      }

      // 3. Arrow Down -> Move to next zone
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (focusZone === 'saved') {
          setFocusZone('input');
        } else if (focusZone === 'input' && screens.length > 0) {
          setFocusZone('screens_list');
        }
        return;
      }

      // 4. Arrow Up -> Move to previous zone
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (focusZone === 'screens_list') {
          setFocusZone('input');
        } else if (focusZone === 'input' && savedScreenCode) {
          setFocusZone('saved');
        }
        return;
      }

      // 5. Arrow Right & Left -> Navigate screens when in screens_list
      if (focusZone === 'screens_list' && screens.length > 0) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          // In RTL, right moves to previous index or wraps
          setSelectedScreenIndex(prev => (prev > 0 ? prev - 1 : screens.length - 1));
          return;
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          // In RTL, left moves to next index or wraps
          setSelectedScreenIndex(prev => (prev < screens.length - 1 ? prev + 1 : 0));
          return;
        }
      }

      // 6. Direct Typing: If user types alphanumeric characters and is not focused on input, switch to input
      if (
        focusZone !== 'input' &&
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        setFocusZone('input');
        setTypedCode(prev => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusZone, typedCode, savedScreenCode, selectedScreenIndex, screens, onLaunchScreen, onNavigatePortal]);

  const handleLaunchTyped = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedCode.trim()) return;
    onLaunchScreen(typedCode.trim(), true);
  };

  return (
    <div 
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-6 select-none font-sans" 
      dir="rtl"
    >
      {/* Top Bar: Minimal exit / portal return */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <button
          onClick={() => onNavigatePortal('gateway')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
          tabIndex={-1}
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرئيسية [Esc]</span>
        </button>

        <TamyLogo variant="purple" size="sm" showSubtitle={false} />
      </div>

      {/* Main Focus Area */}
      <div className="max-w-2xl w-full mx-auto my-auto py-6">
        
        {/* Simple Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 mb-3 shadow-xs">
            <Tv className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            دخول شاشة العرض
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            اكتب كود الشاشة أو اختر من القائمة بواسطة الأسهم وزر [Enter]
          </p>
        </div>

        {/* SECTION 1: Saved Screen (If Present) */}
        {savedScreenCode && (
          <div className="mb-6">
            <div className="text-[11px] font-bold text-slate-700 mb-2 px-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>الشاشة المحفوظة على هذا الجهاز:</span>
            </div>
            
            <button
              onClick={() => onLaunchScreen(savedScreenCode, true)}
              onFocus={() => setFocusZone('saved')}
              className={`w-full p-4 rounded-2xl flex items-center justify-between text-right transition-all cursor-pointer border ${
                focusZone === 'saved'
                  ? 'bg-purple-50 border-purple-500 ring-4 ring-purple-500/20 shadow-xl scale-[1.01]'
                  : 'bg-white border-slate-200 hover:border-purple-300 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold ${
                  focusZone === 'saved' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700'
                }`}>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900">
                    {savedScreenDevice ? savedScreenDevice.name : `كود: ${savedScreenCode}`}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-700">{savedScreenCode}</span>
                    {savedScreenDevice && (
                      <span className="text-[11px] text-slate-400">({savedScreenDevice.branch})</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md">
                <Play className="w-4 h-4 fill-white" />
                <span>تشغيل الشاشة [Enter]</span>
              </div>
            </button>
          </div>
        )}

        {/* SECTION 2: Type Code Input Field */}
        <div className="mb-6">
          <div className="text-[11px] font-bold text-slate-700 mb-2 px-1">
            كتابة كود الشاشة يدوياً:
          </div>

          <form onSubmit={handleLaunchTyped} className="relative">
            <div className={`rounded-2xl transition-all border ${
              focusZone === 'input'
                ? 'border-purple-600 ring-4 ring-purple-500/20 bg-white shadow-xl scale-[1.01]'
                : 'border-slate-200 bg-white shadow-xs'
            }`}>
              <div className="flex items-center p-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={typedCode}
                  onChange={(e) => setTypedCode(e.target.value)}
                  onFocus={() => setFocusZone('input')}
                  placeholder="اكتب كود الشاشة هنا (مثال: albasatin-001)..."
                  className="flex-1 bg-transparent px-4 py-3 text-base sm:text-lg font-bold text-slate-900 placeholder-slate-400 focus:outline-none font-mono"
                  dir="ltr"
                />

                <button
                  type="submit"
                  disabled={!typedCode.trim()}
                  className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-md"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>بدء العرض [Enter]</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* SECTION 3: Select from Available Screens via Arrows */}
        {screens.length > 0 && (
          <div>
            <div className="text-[11px] font-bold text-slate-700 mb-2 px-1 flex items-center justify-between">
              <span>أو اختر شاشة من القائمة (الأسهم ← →):</span>
              <span className="text-[10px] text-slate-500 font-bold">
                {selectedScreenIndex + 1} من {screens.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {screens.map((scr, idx) => {
                const isSelected = focusZone === 'screens_list' && selectedScreenIndex === idx;
                const isPortrait = scr.orientation === 'portrait';

                return (
                  <button
                    key={scr.id}
                    onClick={() => onLaunchScreen(scr.code, true)}
                    onMouseEnter={() => {
                      setFocusZone('screens_list');
                      setSelectedScreenIndex(idx);
                    }}
                    className={`p-3.5 rounded-xl text-right transition-all flex items-center justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 border-purple-500 ring-4 ring-purple-500/20 shadow-md scale-[1.01]'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isPortrait ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Monitor className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {scr.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {scr.code} • {scr.branch}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {isPortrait ? 'طولية' : 'عرضية'}
                      </span>
                      {isSelected && (
                        <Play className="w-4 h-4 text-purple-600 fill-purple-600 mr-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Remote Control Keyboard Legend */}
      <div className="max-w-xl w-full mx-auto border-t border-slate-200 pt-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-white text-slate-700 font-mono text-[11px] border border-slate-200 shadow-xs">
              ↑ ↓
            </span>
            <span>للتنقل بين الخيارات</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-white text-slate-700 font-mono text-[11px] border border-slate-200 shadow-xs">
              ← →
            </span>
            <span>لاختيار الشاشة</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[11px] border border-purple-200 font-bold shadow-xs">
              Enter / OK
            </span>
            <span>للتشغيل والعرض</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-white text-slate-700 font-mono text-[11px] border border-slate-200 shadow-xs">
              الكيبورد
            </span>
            <span>للكتابة المباشرة</span>
          </div>
        </div>
      </div>

    </div>
  );
};
