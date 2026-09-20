import React, { useState, useEffect, useRef } from 'react';
import { ScreenDevice, ScheduleItem, MediaItem, DayOfWeek, ClientAccount } from '../types';
import { StorageService } from '../services/storage';
import { Lock, Clock, MessageSquare, RefreshCw } from 'lucide-react';

interface ScreenPlayerProps {
  screenCode: string;
  onExitPlayer?: () => void;
  onChangeScreen?: () => void;
  isEmbedded?: boolean;
}

const DAY_NAMES: DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const ScreenPlayer: React.FC<ScreenPlayerProps> = ({
  screenCode,
  onExitPlayer,
  onChangeScreen,
  isEmbedded = false,
}) => {
  const [screen, setScreen] = useState<ScreenDevice | undefined>(() =>
    StorageService.getScreenById(screenCode)
  );
  const [account, setAccount] = useState<ClientAccount | undefined>(() => {
    const s = StorageService.getScreenById(screenCode);
    return s ? StorageService.getAccountById(s.accountId) : undefined;
  });

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMuted, setIsMuted] = useState(true);

  // Rotation:
  // User directive: "اذا كانت الشاشة عرضية تعرض المواد مقلوبه للمين بشكل طولي تعرض على كامل الشاشة"
  // Default for landscape screens is 90 (rotated 90deg clockwise to the right so it displays in portrait filling the full display).
  // If orientation is portrait, default is 0.
  const [rotation, setRotation] = useState<number>(() => {
    const saved = localStorage.getItem(`tamy_screen_rot_${screenCode}`);
    if (saved !== null) {
      return parseInt(saved, 10);
    }
    const scr = StorageService.getScreenById(screenCode);
    // If landscape -> rotate 90deg to the right by default
    if (scr && scr.orientation === 'landscape') {
      return 90;
    }
    return 0;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Refresh clock every minute for schedule filtering
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Heartbeat ping every 10 seconds to keep screen marked as online
  useEffect(() => {
    if (!screen) return;
    StorageService.pingScreen(screen.id);
    const pingInterval = setInterval(() => {
      StorageService.pingScreen(screen.id);
    }, 10000);
    return () => clearInterval(pingInterval);
  }, [screen]);

  // Load schedules for this screen
  const refreshSchedules = () => {
    const freshScreen = StorageService.getScreenById(screenCode);
    setScreen(freshScreen);

    if (freshScreen) {
      const freshAcc = StorageService.getAccountById(freshScreen.accountId);
      setAccount(freshAcc);
      const allSchedules = StorageService.getSchedules(freshScreen.id);
      setSchedules(allSchedules);
    }
  };

  useEffect(() => {
    refreshSchedules();
  }, [screenCode]);

  // Subscribe to real-time cloud schedule updates
  useEffect(() => {
    const unsubscribe = StorageService.subscribe(msg => {
      if (
        (msg.screenId && screen && msg.screenId === screen.id) ||
        !msg.screenId
      ) {
        if (msg.type === 'SCHEDULE_UPDATED' || msg.type === 'SCREEN_REFRESH') {
          refreshSchedules();
        }
      }
    });

    return () => unsubscribe();
  }, [screen]);

  // Filter valid media according to current day and time
  const getActiveSchedules = () => {
    const currentDay = DAY_NAMES[currentTime.getDay()];
    const currentHours = currentTime.getHours().toString().padStart(2, '0');
    const currentMins = currentTime.getMinutes().toString().padStart(2, '0');
    const currentHHMM = `${currentHours}:${currentMins}`;

    return schedules.filter(item => {
      if (!item.isActive) return false;
      const dayMatches = item.days.includes(currentDay);
      if (!dayMatches) return false;

      if (item.isForever) return true;

      return currentHHMM >= item.startTime && currentHHMM <= item.endTime;
    });
  };

  // Cycle through valid scheduled media
  useEffect(() => {
    const activeList = getActiveSchedules();
    if (activeList.length === 0) {
      setActiveMedia(null);
      return;
    }

    const safeIndex = currentIndex % activeList.length;
    const currentItem = activeList[safeIndex];
    setActiveMedia(currentItem.media);

    // If only 1 media item is scheduled, no cyclic timeout is needed
    if (activeList.length <= 1) {
      return;
    }

    // USER DIRECTIVE:
    // "اضف خاصية لتحديد عدد ثواني العرض للصورة الواحدة والمقطع على عدد ثواني المقطع ذاتها"
    // For images: cycle after the exact specified number of seconds
    // For videos: cycle when the video finishes (onEnded event on <video>).
    if (currentItem.media?.type !== 'video') {
      const duration = Math.max(2, currentItem.media?.durationSeconds || 10) * 1000;
      const cycleTimer = setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % activeList.length);
      }, duration);

      return () => clearTimeout(cycleTimer);
    } else {
      // For video clips, display duration is the video clip's own length!
      // The onEnded callback on the <video> element will advance to next item.
      // Safety fallback timer if video stalls or fails to trigger onEnded:
      const videoDuration = Math.max(5, currentItem.media?.durationSeconds || 30);
      const fallbackTimer = setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % activeList.length);
      }, (videoDuration + 3) * 1000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [schedules, currentIndex, currentTime.getMinutes()]);

  // Keyboard navigation & TV remote control in Player:
  // - Escape or Backspace or Q: Exit / Change screen
  // - R: Cycle rotation (90 -> 180 -> 270 -> 0 -> 90)
  // - F: Fullscreen toggle
  // - M: Mute toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q' || e.key === 'Backspace') {
        if (onChangeScreen) {
          onChangeScreen();
        } else if (onExitPlayer) {
          onExitPlayer();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        // Cycle rotation 0 -> 90 -> 180 -> 270 -> 0
        setRotation(prev => {
          const next = (prev + 90) % 360;
          try {
            localStorage.setItem(`tamy_screen_rot_${screenCode}`, next.toString());
          } catch {}
          return next;
        });
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screenCode, onChangeScreen, onExitPlayer]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Auto-request fullscreen on click or tap
  const handleContainerClick = () => {
    if (!isEmbedded && !document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    }
  };

  if (!screen) {
    return (
      <div 
        className="fixed inset-0 z-50 w-screen h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-8 select-none font-sans"
        dir="rtl"
      >
        <div className="text-xl font-bold text-slate-800 mb-2">
          كود الشاشة غير مقترن: <span className="font-mono text-purple-700">{screenCode}</span>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          اضغط زر الرجوع (Esc أو Backspace) للعودة وكتابة كود آخر
        </p>
        <div className="flex gap-3">
          {onChangeScreen && (
            <button
              onClick={onChangeScreen}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              تغيير كود الشاشة
            </button>
          )}
          {onExitPlayer && (
            <button
              onClick={onExitPlayer}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              الخروج
            </button>
          )}
        </div>
      </div>
    );
  }

  // Check if account subscription has expired or suspended
  const isAccountExpired = account ? StorageService.isAccountExpired(account) : false;
  if (isAccountExpired) {
    const formattedExpiry = account?.subscriptionExpiresAt
      ? new Date(account.subscriptionExpiresAt).toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'غير محدد';

    const whatsappMessage = encodeURIComponent(
      `السلام عليكم، أود تجديد وتمديد اشتراك الشاشة (${screen.name} - كود: ${screen.code}) التابعة لمنشأة (${account?.companyName || ''}).`
    );

    return (
      <div
        className="fixed inset-0 z-50 w-screen h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 select-none font-sans"
        dir="rtl"
      >
        <div className="max-w-md w-full text-center space-y-6 bg-slate-800/95 border border-slate-700 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              انتهت فترة الاشتراك
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              تم إيقاف بث هذه الشاشة مؤقتاً
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              انتهت صلاحية اشتراك منشأة <span className="font-bold text-white">{account?.companyName}</span> بتاريخ <span className="font-bold text-rose-300">{formattedExpiry}</span>.
            </p>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-700/50 text-xs text-slate-400 flex items-center justify-between">
            <span>كود الشاشة: <span className="font-mono text-purple-400 font-bold">{screen.code}</span></span>
            <span>الفرع: <span className="text-slate-200">{screen.branch}</span></span>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <a
              href={`https://wa.me/966500000000?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <MessageSquare className="w-4 h-4" />
              <span>تواصل مع الإدارة لتجديد الاشتراك فوراً</span>
            </a>

            <button
              onClick={refreshSchedules}
              className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحقق من التجديد الآن</span>
            </button>

            {onExitPlayer && (
              <button
                onClick={onExitPlayer}
                className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
              >
                الخروج من المشغل
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dimension & Transform Calculation:
  // When rotation is 90 or 270 (rotated right/left for vertical display on landscape TV):
  // The element width must equal 100vh and height must equal 100vw, centered at 50% 50%,
  // so that after rotation by 90deg, its physical bounds exactly match the 100vw x 100vh display,
  // filling the screen completely without any black letterboxing.
  const isRotatedQuarter = rotation === 90 || rotation === 270;

  const mediaStyle: React.CSSProperties = isRotatedQuarter
    ? {
        position: 'absolute',
        width: '100vh',
        height: '100vw',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }
    : rotation !== 0
    ? {
        position: 'absolute',
        width: '100vw',
        height: '100vh',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }
    : {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
      };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={`relative bg-black select-none overflow-hidden ${
        isEmbedded
          ? 'w-full aspect-video rounded-2xl'
          : 'fixed inset-0 z-50 w-screen h-screen'
      }`}
    >
      {/* 
        USER DIRECTIVE:
        "شاشة العرض فارغة تماماً فقط مادة العرض تعرض"
        NO clock, NO headers, NO logos, NO overlay text, NO floating badges!
        ONLY the media item is displayed edge-to-edge!
      */}
      {activeMedia ? (
        <div style={mediaStyle} className="overflow-hidden flex items-center justify-center bg-black">
          {activeMedia.type === 'video' ? (
            <video
              ref={videoRef}
              key={activeMedia.id}
              src={activeMedia.url}
              autoPlay
              loop={getActiveSchedules().length <= 1}
              muted={isMuted}
              playsInline
              onEnded={() => {
                const activeList = getActiveSchedules();
                // Play for the clip's full duration, then advance to next media item
                if (activeList.length > 1) {
                  setCurrentIndex(prev => (prev + 1) % activeList.length);
                }
              }}
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                v.play().catch(() => {
                  v.muted = true;
                  v.play().catch(() => {});
                });
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              key={activeMedia.id}
              src={activeMedia.url}
              alt=""
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          )}
        </div>
      ) : (
        /* Standby state if no schedule is active: Pure clean black display */
        <div className="w-full h-full bg-black flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-purple-600/30 animate-pulse"></div>
        </div>
      )}
    </div>
  );
};
