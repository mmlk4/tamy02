import React, { useState, useRef } from 'react';
import { ClientAccount, ScreenDevice, MediaItem, ScheduleItem, DayOfWeek } from '../types';
import { StorageService } from '../services/storage';
import { 
  Tv, 
  Upload, 
  Trash2, 
  Radio, 
  Clock, 
  Calendar, 
  Play, 
  Eye, 
  ExternalLink, 
  Check, 
  AlertCircle,
  FileText,
  Plus,
  Sliders,
  ChevronDown,
  Copy,
  X,
  Film,
  Sparkles,
  Layers,
  Settings,
  ShieldCheck,
  Monitor,
  Building2,
  Lock
} from 'lucide-react';

interface ClientDashboardProps {
  activeAccount: ClientAccount | null;
  screens: ScreenDevice[];
  activeScreenId: string;
  setActiveScreenId: (id: string) => void;
  onRefreshData: () => void;
  onOpenPlayer: (screenCode: string) => void;
}

const ALL_DAYS: { id: DayOfWeek; labelAr: string; labelEn: string }[] = [
  { id: 'Sunday', labelAr: 'الأحد', labelEn: 'Sunday' },
  { id: 'Monday', labelAr: 'الاثنين', labelEn: 'Monday' },
  { id: 'Tuesday', labelAr: 'الثلاثاء', labelEn: 'Tuesday' },
  { id: 'Wednesday', labelAr: 'الأربعاء', labelEn: 'Wednesday' },
  { id: 'Thursday', labelAr: 'الخميس', labelEn: 'Thursday' },
  { id: 'Friday', labelAr: 'الجمعة', labelEn: 'Friday' },
  { id: 'Saturday', labelAr: 'السبت', labelEn: 'Saturday' },
];

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  activeAccount,
  screens,
  activeScreenId,
  setActiveScreenId,
  onRefreshData,
  onOpenPlayer,
}) => {
  // Screen Management State (Client-driven screen addition according to admin max limit)
  const [showAddScreenModal, setShowAddScreenModal] = useState(false);
  const [showManageScreensModal, setShowManageScreensModal] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenBranch, setNewScreenBranch] = useState(activeAccount?.companyName || 'الفرع الرئيسي');
  const [newScreenOrientation, setNewScreenOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [newScreenCode, setNewScreenCode] = useState('');
  const [screenModalError, setScreenModalError] = useState('');

  // Form State for Schedule Upload (Matching Tamy Brochure Page 3 & 5)
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('22:00');
  const [isForever, setIsForever] = useState(true);
  const [selectedMediaId, setSelectedMediaId] = useState<string>('');
  const [mediaTitle, setMediaTitle] = useState('');
  const [customFileUrl, setCustomFileUrl] = useState<string | null>(null);
  const [customFileType, setCustomFileType] = useState<'image' | 'video'>('image');
  const [directUrl, setDirectUrl] = useState('');
  const [directUrlType, setDirectUrlType] = useState<'image' | 'video'>('image');
  const [isUploading, setIsUploading] = useState(false);
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [copiedScreenLink, setCopiedScreenLink] = useState(false);

  // USER DIRECTIVE:
  // "اضف خاصية لتحديد عدد ثواني العرض للصورة الواحدة والمقطع على عدد ثواني المقطع ذاتها"
  const [imageDurationSeconds, setImageDurationSeconds] = useState<number>(10);
  const [detectedVideoDuration, setDetectedVideoDuration] = useState<number | null>(null);
  const [editingScheduleMedia, setEditingScheduleMedia] = useState<{
    scheduleId: string;
    mediaTitle: string;
    mediaId: string;
    durationSeconds: number;
    type: 'image' | 'video';
  } | null>(null);
  const [editModalSeconds, setEditModalSeconds] = useState<number>(10);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!activeAccount) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-neutral-200 shadow-xs max-w-xl mx-auto space-y-4 my-8" dir="rtl">
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto border border-purple-100">
          <Sliders className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">لا يوجد حساب منشأة محدد</h3>
          <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
            يرجى تسجيل الدخول بحساب منشأتك لتتمكن من إدارة وجدولة المحتوى على شاشاتك.
          </p>
        </div>
      </div>
    );
  }

  // Calculate Screen Quota & Subscription Status
  const screensUsed = screens.length;
  const maxQuota = activeAccount.maxScreens || 1;
  const isQuotaFull = screensUsed >= maxQuota;
  const remainingSlots = Math.max(0, maxQuota - screensUsed);
  const quotaPercent = Math.min(100, Math.round((screensUsed / maxQuota) * 100));

  const isExpired = StorageService.isAccountExpired(activeAccount);
  const remainingDays = StorageService.getSubscriptionRemainingDays(activeAccount);
  const expiryDateFormatted = activeAccount.subscriptionExpiresAt
    ? activeAccount.subscriptionExpiresAt.split('T')[0]
    : 'غير محدد';

  const handleClientAddScreen = (e: React.FormEvent) => {
    e.preventDefault();
    setScreenModalError('');
    if (isExpired) {
      setScreenModalError('عذراً، اشتراك حساب منشأتك منتهي ومقفل حالياً. يرجى التواصل مع إدارة تامي لتجديد أو تمديد الاشتراك.');
      return;
    }
    if (!newScreenName.trim()) {
      setScreenModalError('يرجى كتابة اسم الشاشة');
      return;
    }
    if (screens.length >= activeAccount.maxScreens) {
      setScreenModalError(`عذراً، وصلت للحد الأقصى المصرح لشاشاتك (${activeAccount.maxScreens} شاشات). لزيادة الحد يرجى التواصل مع إدارة النظام.`);
      return;
    }

    const cleanBase = newScreenName.trim().toLowerCase().replace(/[\s\W-]+/g, '-');
    const autoCode = newScreenCode.trim() || `${cleanBase || 'scr'}-${Math.floor(100 + Math.random() * 900)}`;

    const newScreen: ScreenDevice = {
      id: `scr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      code: autoCode,
      name: newScreenName.trim(),
      branch: newScreenBranch.trim() || activeAccount.companyName || 'الفرع الرئيسي',
      accountId: activeAccount.id,
      status: 'online',
      lastPing: new Date().toISOString(),
      orientation: newScreenOrientation,
      resolution: newScreenOrientation === 'portrait' ? '1080x1920' : '1920x1080',
      pairingPin: `TMY-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    const res = StorageService.saveScreen(newScreen);
    if (!res.success) {
      setScreenModalError(res.error || 'تعذر إضافة الشاشة');
      return;
    }

    setActiveScreenId(newScreen.id);
    setShowAddScreenModal(false);
    setNewScreenName('');
    setNewScreenBranch(activeAccount.companyName || 'الفرع الرئيسي');
    setNewScreenCode('');
    setScreenModalError('');
    onRefreshData();
    setBroadcastNotice(`تمت إضافة شاشة [${newScreen.name}] بنجاح، يمكنك الآن جدولة المحتوى عليها!`);
  };

  const handleClientDeleteScreen = (screenId: string, scrName: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف شاشة "${scrName}"؟ سيؤدي ذلك لتفريغ مساحة لإضافة شاشة أخرى ضمن حدك الأقصى.`)) {
      StorageService.deleteScreen(screenId);
      onRefreshData();
      if (activeScreenId === screenId) {
        const remaining = screens.filter(s => s.id !== screenId);
        if (remaining.length > 0) setActiveScreenId(remaining[0].id);
      }
    }
  };

  // If client has 0 screens currently, show helpful setup view with Add Screen button
  if (screens.length === 0) {
    return (
      <div className="space-y-6 font-sans" dir="rtl">
        {/* Account Info & Quota Header */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                <Building2 className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-neutral-900">{activeAccount.companyName}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800">
                حساب منشأة
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              الحصة المصرحة لحسابك من إدارة النظام: <strong className="text-purple-700">{maxQuota} شاشات</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className="text-xs font-bold text-neutral-500">استخدام الشاشات</div>
              <div className="text-sm font-black text-neutral-800">0 من {maxQuota} مستخدمة</div>
            </div>
            <button
              onClick={() => {
                setScreenModalError('');
                setNewScreenName('');
                setNewScreenBranch(activeAccount.companyName || 'الفرع الرئيسي');
                setNewScreenCode('');
                setShowAddScreenModal(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة شاشة جديدة</span>
            </button>
          </div>
        </div>

        {/* Empty State Card */}
        <div className="bg-white rounded-2xl p-10 text-center border border-neutral-200 shadow-xs max-w-xl mx-auto space-y-5 my-8">
          <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto border border-purple-100 shadow-xs">
            <Tv className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-black text-neutral-900">ابدأ بإضافة أول شاشة لمنشأتك</h3>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed max-w-md mx-auto">
              حدد اسم الشاشة والفرع واتجاه العرض (أفقي أو عمودي)، وستتمكن فوراً من رفع الوسائط وجدولة المحتوى عبر سحابة تامي.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
              <ShieldCheck className="w-4 h-4" />
              <span>حدك الأقصى المعتمد من الإدارة: {maxQuota} شاشات</span>
            </div>
          </div>

          <div>
            <button
              onClick={() => {
                setScreenModalError('');
                setNewScreenName('');
                setNewScreenBranch(activeAccount.companyName || 'الفرع الرئيسي');
                setNewScreenCode('');
                setShowAddScreenModal(true);
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold rounded-xl text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة شاشتك الأولى الآن</span>
            </button>
          </div>
        </div>

        {/* Add Screen Modal */}
        {showAddScreenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-sans" dir="rtl">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-neutral-200 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="px-5 py-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <Tv className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <h3 className="text-base font-bold">إضافة شاشة جديدة لمنشأتك</h3>
                    <div className="text-[11px] text-neutral-400">
                      متبقي لك {remainingSlots} من أصل {maxQuota} شاشات مصرحة
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddScreenModal(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                  title="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleClientAddScreen} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-5 space-y-4 flex-1 overflow-y-auto min-h-0">
                  {screenModalError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{screenModalError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      اسم الشاشة *
                    </label>
                    <input
                      type="text"
                      required
                      value={newScreenName}
                      onChange={e => setNewScreenName(e.target.value)}
                      placeholder="مثال: شاشة الاستقبال، شاشة الكاشير، شاشة المنيو 1"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      الفرع أو الموقع
                    </label>
                    <input
                      type="text"
                      value={newScreenBranch}
                      onChange={e => setNewScreenBranch(e.target.value)}
                      placeholder="مثال: الفرع الرئيسي، فرع التحلية..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      اتجاه العرض (Orientation)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewScreenOrientation('landscape')}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          newScreenOrientation === 'landscape'
                            ? 'border-purple-600 bg-purple-50/60 text-purple-900 ring-1 ring-purple-600'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="w-10 h-6 border-2 border-current rounded-md flex items-center justify-center">
                          <span className="text-[9px]">16:9</span>
                        </div>
                        <span>أفقي (Landscape)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewScreenOrientation('portrait')}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          newScreenOrientation === 'portrait'
                            ? 'border-purple-600 bg-purple-50/60 text-purple-900 ring-1 ring-purple-600'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="w-6 h-10 border-2 border-current rounded-md flex items-center justify-center">
                          <span className="text-[9px]">9:16</span>
                        </div>
                        <span>عمودي / طولي (Portrait)</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      كود الشاشة (اختياري - يُنشأ تلقائياً)
                    </label>
                    <input
                      type="text"
                      value={newScreenCode}
                      onChange={e => setNewScreenCode(e.target.value)}
                      placeholder="مثال: screen-01 أو يُترك فارغاً للإنشاء التلقائي"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden font-mono"
                      dir="ltr"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">
                      يُستخدم هذا الكود لفتح شاشة العرض مباشرة عبر الرابط أو مشغل تامي.
                    </p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddScreenModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-200/70 transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تأكيد وإضافة الشاشة</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentScreen = screens.find(s => s.id === activeScreenId) || screens[0];
  const currentSchedules: ScheduleItem[] = currentScreen ? StorageService.getSchedules(currentScreen.id) : [];
  const allMedia: MediaItem[] = activeAccount ? StorageService.getMedia(activeAccount.id) : [];

  const copyCurrentScreenLink = () => {
    if (!currentScreen) return;
    const url = new URL(window.location.href);
    url.searchParams.set('portal', 'player');
    url.searchParams.set('screen', currentScreen.code);
    navigator.clipboard.writeText(url.toString());
    setCopiedScreenLink(true);
    setTimeout(() => setCopiedScreenLink(false), 2500);
  };

  // Toggle Day Selection
  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Select All or Clear Days
  const selectAllDays = () => {
    setSelectedDays(ALL_DAYS.map(d => d.id));
  };

  // Handle Local File Upload with Automatic Clip Duration Detection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    setCustomFileType(isVideo ? 'video' : 'image');
    setMediaTitle(file.name.replace(/\.[^/.]+$/, ''));

    if (isVideo) {
      try {
        const tempVideo = document.createElement('video');
        tempVideo.preload = 'metadata';
        tempVideo.onloadedmetadata = () => {
          window.URL.revokeObjectURL(tempVideo.src);
          const dur = Math.round(tempVideo.duration);
          if (dur && !isNaN(dur) && dur > 0) {
            setDetectedVideoDuration(dur);
          }
        };
        tempVideo.src = URL.createObjectURL(file);
      } catch (err) {
        console.warn('Could not read video metadata:', err);
      }
    } else {
      setDetectedVideoDuration(null);
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCustomFileUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Determine active media type being scheduled (image vs video)
  const activeScheduledType: 'image' | 'video' = customFileUrl
    ? customFileType
    : directUrl.trim()
    ? directUrlType
    : (allMedia.find(m => m.id === selectedMediaId)?.type || 'image');

  // Save Schedule & Instant Push to Screen
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentScreen) return;

    setIsUploading(true);

    const isVideo = activeScheduledType === 'video';
    const durationToSet = isVideo
      ? (detectedVideoDuration || (allMedia.find(m => m.id === selectedMediaId)?.durationSeconds) || 15)
      : Math.max(2, Number(imageDurationSeconds) || 10);

    let mediaToUse: MediaItem | undefined;

    if (customFileUrl || directUrl.trim()) {
      const activeUrl = customFileUrl || directUrl.trim();
      const activeType = customFileUrl ? customFileType : directUrlType;
      // User uploaded a custom file or provided direct URL
      const newMedia: MediaItem = {
        id: `med_${Date.now()}`,
        accountId: activeAccount.id,
        title: mediaTitle || (customFileUrl ? (isVideo ? 'مقطع فيديو مرفوع' : 'صورة إعلانية مرفوعة') : 'رابط وسائط خارجي'),
        type: activeType,
        url: activeUrl,
        thumbnailUrl: activeUrl,
        durationSeconds: durationToSet,
        fileSize: customFileUrl ? (isVideo ? 'Video Clip' : 'Image File') : 'Web Stream',
        createdAt: new Date().toISOString(),
        aspectRatio: currentScreen.orientation === 'portrait' ? '9:16' : '16:9',
      };
      StorageService.saveMedia(newMedia);
      mediaToUse = newMedia;
    } else {
      const found = allMedia.find(m => m.id === selectedMediaId);
      if (found) {
        // If image and user customized the seconds in form, update it
        if (found.type === 'image' && imageDurationSeconds !== found.durationSeconds) {
          const updatedFound: MediaItem = {
            ...found,
            durationSeconds: Math.max(2, Number(imageDurationSeconds) || 10),
          };
          StorageService.saveMedia(updatedFound);
          mediaToUse = updatedFound;
        } else {
          mediaToUse = found;
        }
      }
    }

    if (!mediaToUse) {
      setIsUploading(false);
      return;
    }

    const newSchedule: ScheduleItem = {
      id: `sch_${Date.now()}`,
      screenId: currentScreen.id,
      mediaId: mediaToUse.id,
      media: mediaToUse,
      days: selectedDays,
      startTime: isForever ? '00:00' : startTime,
      endTime: isForever ? '23:59' : endTime,
      isForever,
      priority: currentSchedules.length + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    StorageService.saveSchedule(newSchedule);

    // Instant cloud update notification
    setBroadcastNotice(`تم حفظ وتحديث الجدولة لشاشة [${currentScreen.name}] عبر سحابة تامي`);
    setTimeout(() => setBroadcastNotice(null), 4500);

    // Reset upload fields
    setCustomFileUrl(null);
    setMediaTitle('');
    setDetectedVideoDuration(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsUploading(false);
    onRefreshData();
  };

  // Quick Save for Edited Image Duration
  const handleSaveEditedDuration = () => {
    if (!editingScheduleMedia || !currentScreen) return;
    const targetSchedule = currentSchedules.find(s => s.id === editingScheduleMedia.scheduleId);
    if (targetSchedule) {
      const newSec = Math.max(2, Number(editModalSeconds) || 10);
      const updatedMedia: MediaItem = {
        ...targetSchedule.media,
        durationSeconds: newSec,
      };
      const updatedSchedule: ScheduleItem = {
        ...targetSchedule,
        media: updatedMedia,
      };
      StorageService.saveMedia(updatedMedia);
      StorageService.saveSchedule(updatedSchedule);
      setBroadcastNotice(`تم تحديث مدة عرض صورة "${updatedMedia.title}" إلى ${newSec} ثوانٍ وبثها فوراً للشاشة`);
      setTimeout(() => setBroadcastNotice(null), 4000);
      setEditingScheduleMedia(null);
      onRefreshData();
    }
  };

  // Delete Schedule
  const handleDeleteSchedule = (id: string, title: string) => {
    if (window.confirm(`هل ترغب في حذف محتوى "${title}" من جدولة الشاشة؟`)) {
      StorageService.deleteSchedule(id);
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice for Cloud Sync */}
      {broadcastNotice && (
        <div className="p-4 rounded-xl bg-purple-600 text-white shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/20 rounded-lg">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <div className="font-bold text-sm">تم تحديث الشاشة بنجاح</div>
              <div className="text-xs text-purple-100">{broadcastNotice}</div>
            </div>
          </div>
          <button
            onClick={() => setBroadcastNotice(null)}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg font-bold"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Subscription Banners */}
      {isExpired ? (
        <div className="bg-rose-50 border-2 border-rose-300 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">انتهت مدة اشتراك حساب منشأتك ({activeAccount.companyName})</div>
              <div className="text-xs text-rose-700 mt-0.5">
                تاريخ انتهاء الاشتراك كان: <span className="font-mono font-bold" dir="ltr">{expiryDateFormatted}</span>. شاشات العرض موقوفة حالياً. يرجى التواصل مع إدارة تامي لتمديد وتجديد الاشتراك.
              </div>
            </div>
          </div>
          <span className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold shrink-0 text-center">
            اشتراك مقفل
          </span>
        </div>
      ) : remainingDays <= 7 ? (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">تنبيه: اقتراب موعد انتهاء مدة الاشتراك</div>
              <div className="text-xs text-amber-700 mt-0.5">
                متبقي على نهاية الاشتراك <strong className="font-bold">{remainingDays} يوماً</strong> فقط (ينتهي بتاريخ: <span className="font-mono" dir="ltr">{expiryDateFormatted}</span>). يُرجى التنسيق مع الإدارة للتمديد دون انقطاع البث.
              </div>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold shrink-0 text-center">
            تجديد قريب
          </span>
        </div>
      ) : null}

      {/* Screen Selection Bar & Quota & Quick Controls */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
        
        {/* Top Sub-Bar: Quota Info & Screen Management */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-neutral-100">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-800">حصة الشاشات:</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    isQuotaFull 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {screensUsed} من أصل {maxQuota} شاشات
                  </span>
                  {isQuotaFull && (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      مكتمل الحد
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  الحد الأقصى محدد من الإدارة لكل عميل ({maxQuota} شاشات).
                </div>
              </div>
            </div>

            {/* Subscription Status Card in Client Bar */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              isExpired
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : remainingDays <= 7
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <Clock className="w-4 h-4 shrink-0" />
              <div>
                <span className="font-bold">
                  {isExpired ? 'الاشتراك منتهي' : `رصيد الاشتراك: ${remainingDays} يوم`}
                </span>
                <span className="text-[10px] text-neutral-500 mr-1.5 font-mono" dir="ltr">
                  ({expiryDateFormatted})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowManageScreensModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              title="عرض وتعديل قائمة الشاشات المسجلة لحسابك"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>إدارة الشاشات ({screensUsed})</span>
            </button>

            <button
              onClick={() => {
                if (isQuotaFull) {
                  alert(`لقد وصلت للحد الأقصى لعدد الشاشات المسموح بها (${maxQuota} شاشات) الذي حدده مسؤول النظام.\nلترقية الباقة أو زيادة عدد الشاشات، يرجى التواصل مع إدارة تامي.`);
                  return;
                }
                setScreenModalError('');
                setNewScreenName('');
                setNewScreenBranch(activeAccount.companyName || 'الفرع الرئيسي');
                setNewScreenCode('');
                setShowAddScreenModal(true);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isQuotaFull
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-500 border border-neutral-300/80 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
              title={isQuotaFull ? `تم بلوغ الحد الأقصى (${maxQuota} شاشات)` : 'إضافة شاشة جديدة لحسابك'}
            >
              <Plus className="w-4 h-4" />
              <span>
                {isQuotaFull ? `الحد الأقصى (${maxQuota}/${maxQuota})` : '+ إضافة شاشة جديدة'}
              </span>
            </button>
          </div>
        </div>

        {/* Screen Selector matching the Tamy mockup */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500">الشاشة المحددة:</span>
              <div className="relative">
                <select
                  value={currentScreen?.id || ''}
                  onChange={e => setActiveScreenId(e.target.value)}
                  className="appearance-none bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm font-black py-2 pr-4 pl-10 rounded-xl border border-neutral-300/80 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                >
                  {screens.map(scr => (
                    <option key={scr.id} value={scr.id}>
                      {scr.name} — {scr.branch}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {currentScreen && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>متصلة أونلاين</span>
                </span>
                <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-md">
                  {currentScreen.resolution || '1920x1080'}
                </span>
                <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-md">
                  {currentScreen.orientation === 'portrait' ? 'عمودي 9:16' : 'أفقي 16:9'}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Copy Direct Screen Player Link */}
            {currentScreen && (
              <button
                onClick={copyCurrentScreenLink}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-purple-50 text-neutral-700 hover:text-purple-700 border border-neutral-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                title="نسخ رابط شاشة العرض المباشر لفتحه على شاشة التلفاز أو جهاز العرض"
              >
                {copiedScreenLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">تم نسخ الرابط!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ رابط الشاشة</span>
                  </>
                )}
              </button>
            )}

            {/* Open Player in View */}
            {currentScreen && (
              <button
                onClick={() => onOpenPlayer(currentScreen.code)}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                title="عرض شاشة العرض (Player)"
              >
                <Tv className="w-4 h-4" />
                <span>فتح شاشة العرض</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Main Layout: Exactly matching the Tamy Booklet Layout (Page 3 & Page 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Media for Display Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            
            {/* Table Header Banner */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-neutral-900">
                  Media for Display: <span className="text-purple-700">{currentScreen?.name || 'albasatin 001'}</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  قائمة المواد الإعلانية المجدولة حالياً على هذه الشاشة ومواعيد بثها
                </p>
              </div>

              <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                {currentSchedules.length} مواد مجدولة
              </span>
            </div>

            {/* The Table Styled precisely with the Tamy purple theme */}
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-purple-600 text-white text-xs font-bold">
                    <th className="py-3.5 px-4">Image/Video</th>
                    <th className="py-3.5 px-4">Days</th>
                    <th className="py-3.5 px-4 text-center">Start Time</th>
                    <th className="py-3.5 px-4 text-center">End Time</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {currentSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-neutral-400">
                        <Tv className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
                        <p className="font-bold text-neutral-600">لا توجد وسائط مجدولة لهذه الشاشة حالياً</p>
                        <p className="text-xs mt-1">استخدم نموذج الرفع والجدولة على اليسار لإضافة محتوى وبثه لحظياً</p>
                      </td>
                    </tr>
                  ) : (
                    currentSchedules.map(sch => {
                      const isAllDays = sch.days.length === 7;
                      return (
                        <tr key={sch.id} className="hover:bg-neutral-50/70 transition-colors">
                          
                          {/* Image/Video Thumbnail & Title */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                                {sch.media.type === 'video' ? (
                                  <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-white">
                                    <Play className="w-5 h-5 text-purple-400 fill-purple-400" />
                                  </div>
                                ) : (
                                  <img
                                    src={sch.media.url}
                                    alt={sch.media.title}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="max-w-[200px]">
                                <div className="font-bold text-neutral-900 truncate">
                                  {sch.media.title}
                                </div>
                                <div className="text-[11px] flex items-center flex-wrap gap-1.5 mt-1">
                                  {sch.media.type === 'video' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200/60">
                                      <Film className="w-3 h-3" />
                                      <span>مدة المقطع ذاته ({sch.media.durationSeconds} ثانية)</span>
                                    </span>
                                  ) : (
                                    <div className="inline-flex items-center gap-1.5">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200/60">
                                        <Clock className="w-3 h-3" />
                                        <span>عرض الصورة: {sch.media.durationSeconds || 10} ثوانٍ</span>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingScheduleMedia({
                                            scheduleId: sch.id,
                                            mediaTitle: sch.media.title,
                                            mediaId: sch.media.id,
                                            durationSeconds: sch.media.durationSeconds || 10,
                                            type: 'image',
                                          });
                                          setEditModalSeconds(sch.media.durationSeconds || 10);
                                        }}
                                        className="text-[10px] font-bold text-purple-700 hover:text-purple-900 bg-purple-100 hover:bg-purple-200 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                                        title="تعديل عدد ثواني عرض هذه الصورة"
                                      >
                                        تعديل الثواني
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Days */}
                          <td className="py-3.5 px-4 font-medium text-neutral-700">
                            {isAllDays ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[11px]">
                                طوال أيام الأسبوع
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {sch.days.map(d => (
                                  <span
                                    key={d}
                                    className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[10px] font-medium"
                                  >
                                    {d}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Start Time */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-neutral-800">
                            {sch.startTime}
                          </td>

                          {/* End Time */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-neutral-800">
                            {sch.isForever ? (
                              <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px] font-bold">
                                Forever
                              </span>
                            ) : (
                              sch.endTime
                            )}
                          </td>

                          {/* Actions: Preview, Delete */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Preview */}
                              <button
                                onClick={() => setPreviewMedia(sch.media)}
                                className="px-2.5 py-1 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="معاينة المادة الإعلانية"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>معاينة</span>
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteSchedule(sch.id, sch.media.title)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="حذف من جدول الشاشة"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Cloud Sync Status Note */}
            <div className="p-4 bg-neutral-50/70 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-600" />
                <span>المزامنة السحابية مفعلة: يتم تحديث جدول العرض تلقائياً على الشاشات المقترنة</span>
              </span>
              <span className="font-mono text-[11px] text-neutral-400">
                tamy.tech Cloud Protocol v2.4
              </span>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Upload Media Panel (4 Cols - Exact replica of Tamy booklet) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
            <h3 className="text-base font-black text-neutral-900 mb-1">
              Upload Media
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              رفع المواد الإعلانية وتحديد مواعيد وأيام العرض للشاشة
            </p>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              
              {/* Screen Selector Dropdown inside Form */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  الشاشة المستهدفة:
                </label>
                <select
                  value={currentScreen?.id || ''}
                  onChange={e => setActiveScreenId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  {screens.map(scr => (
                    <option key={scr.id} value={scr.id}>
                      {scr.name} ({scr.branch})
                    </option>
                  ))}
                </select>
              </div>

              {/* Choose File (Upload custom image/video or select from library) */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  اختيار الملف (Choose File):
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-200 hover:border-purple-500 bg-purple-50/30 hover:bg-purple-50/60 p-4 rounded-xl text-center cursor-pointer transition-colors group"
                >
                  <Upload className="w-6 h-6 mx-auto text-purple-600 group-hover:scale-110 transition-transform mb-1.5" />
                  <div className="text-xs font-bold text-purple-700">
                    {customFileUrl ? 'تم اختيار ملف بنجاح (انقر للتغيير)' : 'انقر لرفع صورة أو فيديو من جهازك'}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1">
                    يدعم MP4, WebM, JPG, PNG حتى 4K
                  </div>
                </div>

                {customFileUrl && (
                  <div className="mt-2">
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      عنوان الإعلان:
                    </label>
                    <input
                      type="text"
                      placeholder="عنوان العرض الإعلاني..."
                      value={mediaTitle}
                      onChange={e => setMediaTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>
                )}

                {/* Or enter direct URL */}
                {!customFileUrl && (
                  <div className="mt-2.5">
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      أو أدخل رابط ملف وسائط مباشر (Direct URL):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://... رابط صورة أو فيديو حقيقي"
                        value={directUrl}
                        onChange={e => setDirectUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                      <select
                        value={directUrlType}
                        onChange={e => setDirectUrlType(e.target.value as 'image' | 'video')}
                        className="px-2 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white font-bold text-neutral-700"
                      >
                        <option value="image">صورة</option>
                        <option value="video">فيديو</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Or choose from existing library */}
                {!customFileUrl && !directUrl && allMedia.length > 0 && (
                  <div className="mt-2.5">
                    <label className="block text-[11px] font-bold text-neutral-500 mb-1">
                      أو اختر من مكتبة وسائط {activeAccount.name}:
                    </label>
                    <select
                      value={selectedMediaId}
                      onChange={e => setSelectedMediaId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      {allMedia.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.title} ({m.type === 'video' ? 'فيديو' : 'صورة'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* USER DIRECTIVE:
                  "اضف خاصية لتحديد عدد ثواني العرض للصورة الواحدة والمقطع على عدد ثواني المقطع ذاتها"
                  Duration Settings: Custom Seconds for Image, Auto Natural Clip Duration for Video
              */}
              {activeScheduledType === 'image' ? (
                <div className="bg-purple-50/70 border border-purple-200/90 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-700" />
                      <span>تحديد عدد ثواني عرض الصورة:</span>
                    </label>
                    <span className="text-xs font-mono font-black text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                      {imageDurationSeconds} ثوانٍ
                    </span>
                  </div>

                  {/* Number Input & Fast Preset Pills */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={2}
                        max={300}
                        value={imageDurationSeconds}
                        onChange={e => setImageDurationSeconds(Math.max(2, Math.min(300, parseInt(e.target.value, 10) || 10)))}
                        className="w-20 px-2.5 py-1.5 text-xs font-black font-mono text-center rounded-lg border border-purple-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-2xs"
                      />
                      <span className="text-xs text-neutral-600 font-bold">ثانية</span>
                    </div>

                    <div className="flex items-center gap-1 mr-auto overflow-x-auto py-0.5">
                      {[5, 8, 10, 15, 20, 30].map(sec => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setImageDurationSeconds(sec)}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                            imageDurationSeconds === sec
                              ? 'bg-purple-600 text-white shadow-xs scale-105'
                              : 'bg-white hover:bg-purple-100 text-neutral-700 border border-neutral-200'
                          }`}
                        >
                          {sec} ث
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    ستعرض هذه الصورة على الشاشة لمدة <strong>{imageDurationSeconds} ثانية</strong> ثم يتم الانتقال تلقائياً للمادة التالية في الجدول.
                  </p>
                </div>
              ) : (
                <div className="bg-indigo-50/70 border border-indigo-200/90 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-indigo-700" />
                      <span>مدة عرض مقطع الفيديو:</span>
                    </label>
                    <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100/90 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-indigo-200">
                      <Check className="w-3 h-3 text-indigo-700" />
                      <span>كامل مدة المقطع تلقائياً</span>
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-700 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-indigo-100">
                    يتم تشغيل الفيديو كاملاً من بدايته حتى نهايته وفق{' '}
                    <strong className="text-indigo-900 font-black">عدد ثواني المقطع ذاتها</strong>
                    {detectedVideoDuration ? (
                      <span className="inline-block mx-1 font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                        ({detectedVideoDuration} ثانية)
                      </span>
                    ) : (
                      ' (المدة الطبيعية الكاملة للمقطع)'
                    )}
                    ، وفور اكتمال تشغيل الفيديو ينتقل البث مباشرة للمادة التالية في الجدولة.
                  </div>
                </div>
              )}

              {/* Days Checkboxes (Sunday through Saturday as in Tamy PDF) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-700">
                    أيام البث (Days):
                  </label>
                  <button
                    type="button"
                    onClick={selectAllDays}
                    className="text-[11px] text-purple-600 hover:text-purple-800 font-bold"
                  >
                    تحديد الكل
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200/60">
                  {ALL_DAYS.map(day => {
                    const isChecked = selectedDays.includes(day.id);
                    return (
                      <label
                        key={day.id}
                        className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                          isChecked
                            ? 'bg-purple-100/70 text-purple-900 font-bold'
                            : 'hover:bg-neutral-200/50 text-neutral-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDay(day.id)}
                          className="w-4 h-4 text-purple-600 rounded border-neutral-300 focus:ring-purple-500 cursor-pointer"
                        />
                        <span>{day.labelAr}</span>
                        <span className="text-[10px] text-neutral-400">({day.labelEn})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Time Fields & Forever Checkbox */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-700">
                    أوقات العرض (Time Window):
                  </label>

                  {/* Forever Checkbox matching PDF */}
                  <label className="flex items-center gap-2 text-xs font-bold text-purple-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isForever}
                      onChange={e => setIsForever(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded border-neutral-300 focus:ring-purple-500 cursor-pointer"
                    />
                    <span>طوال اليوم (Forever)</span>
                  </label>
                </div>

                {!isForever && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit / Cloud Broadcast Button matching PDF icon */}
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                <span>
                  {isUploading ? 'جاري البث إلى السحابة...' : 'حفظ وبث فوري للشاشة (Upload & Broadcast)'}
                </span>
              </button>

            </form>
          </div>
        </div>

      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4" dir="rtl">
          <div className="bg-neutral-900 text-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-700 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
              <div>
                <h4 className="font-bold text-sm">{previewMedia.title}</h4>
                <span className="text-xs text-neutral-400">معاينة البث عالي الدقة</span>
              </div>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative flex-1 min-h-0 bg-black flex items-center justify-center overflow-hidden p-2">
              {previewMedia.type === 'video' ? (
                <video src={previewMedia.url} controls autoPlay className="max-w-full max-h-[75vh] object-contain rounded-lg" />
              ) : (
                <img src={previewMedia.url} alt={previewMedia.title} className="max-w-full max-h-[75vh] object-contain rounded-lg" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Image Duration Modal */}
      {editingScheduleMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4" dir="rtl">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-md w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">تعديل مدة عرض الصورة</h4>
                  <p className="text-[11px] text-neutral-500 truncate max-w-[240px]">
                    {editingScheduleMedia.mediaTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingScheduleMedia(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  عدد ثواني العرض على الشاشة (ثانية):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={2}
                    max={300}
                    value={editModalSeconds}
                    onChange={e => setEditModalSeconds(Math.max(2, Math.min(300, parseInt(e.target.value, 10) || 10)))}
                    className="w-28 px-3 py-2 text-sm font-mono font-black text-center rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-purple-50/40 text-purple-900"
                  />
                  <span className="text-xs font-bold text-neutral-600">ثانية</span>
                </div>
              </div>

              {/* Preset buttons */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1.5">
                  أو اختر مدة سريعة:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[5, 8, 10, 15, 20, 30, 45, 60].map(sec => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setEditModalSeconds(sec)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        editModalSeconds === sec
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {sec} ثانية
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 text-[11px] text-purple-900 leading-relaxed">
                عند النقر على حفظ، سيتم تحديث شاشة العرض تلقائياً وبثها لحظياً عبر سحابة تامي دون الحاجة لإعادة تشغيل الشاشة.
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditingScheduleMedia(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-200/70 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveEditedDuration}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>حفظ وتحديث فوري</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Add Screen Modal */}
      {showAddScreenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-sans" dir="rtl">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-neutral-200 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Tv className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <h3 className="text-base font-bold">إضافة شاشة جديدة لحسابك</h3>
                  <div className="text-[11px] text-neutral-400">
                    متبقي لك {remainingSlots} من أصل {maxQuota} شاشات مصرحة
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAddScreenModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleClientAddScreen} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 space-y-4 flex-1 overflow-y-auto min-h-0">
                {screenModalError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{screenModalError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    اسم الشاشة *
                  </label>
                  <input
                    type="text"
                    required
                    value={newScreenName}
                    onChange={e => setNewScreenName(e.target.value)}
                    placeholder="مثال: شاشة الاستقبال، شاشة الكاشير، شاشة المنيو 1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    الفرع أو الموقع
                  </label>
                  <input
                    type="text"
                    value={newScreenBranch}
                    onChange={e => setNewScreenBranch(e.target.value)}
                    placeholder="مثال: الفرع الرئيسي، فرع التحلية..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    اتجاه العرض (Orientation)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewScreenOrientation('landscape')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        newScreenOrientation === 'landscape'
                          ? 'border-purple-600 bg-purple-50/60 text-purple-900 ring-1 ring-purple-600'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="w-10 h-6 border-2 border-current rounded-md flex items-center justify-center">
                        <span className="text-[9px]">16:9</span>
                      </div>
                      <span>أفقي (Landscape)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewScreenOrientation('portrait')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        newScreenOrientation === 'portrait'
                          ? 'border-purple-600 bg-purple-50/60 text-purple-900 ring-1 ring-purple-600'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="w-6 h-10 border-2 border-current rounded-md flex items-center justify-center">
                        <span className="text-[9px]">9:16</span>
                      </div>
                      <span>عمودي / طولي (Portrait)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    كود الشاشة (اختياري - يُنشأ تلقائياً)
                  </label>
                  <input
                    type="text"
                    value={newScreenCode}
                    onChange={e => setNewScreenCode(e.target.value)}
                    placeholder="مثال: screen-01 أو يُترك فارغاً للإنشاء التلقائي"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-hidden font-mono"
                    dir="ltr"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    يُستخدم هذا الكود لفتح شاشة العرض مباشرة عبر الرابط أو مشغل تامي.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddScreenModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-200/70 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>تأكيد وإضافة الشاشة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Manage Screens Modal */}
      {showManageScreensModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-sans" dir="rtl">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <h3 className="text-base font-bold">إدارة الشاشات التابعة لمنشأتك</h3>
                  <div className="text-[11px] text-neutral-400">
                    الحصة المستخدمة: {screensUsed} من أصل {maxQuota} شاشات مصرحة من الإدارة
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowManageScreensModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 flex-1 min-h-0 overflow-y-auto space-y-4">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                <div className="text-xs text-purple-900">
                  <strong>تنبيه الحصص:</strong> يمكنك حذف أي شاشة غير مستخدمة لتفريغ مكان لإضافة شاشة أخرى ضمن الحد الأقصى المسموح ({maxQuota} شاشات).
                </div>
                {!isQuotaFull && (
                  <button
                    onClick={() => {
                      setShowManageScreensModal(false);
                      setShowAddScreenModal(true);
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة شاشة</span>
                  </button>
                )}
              </div>

              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                {screens.map(scr => (
                  <div key={scr.id} className="p-4 bg-white hover:bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-neutral-900">{scr.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-neutral-100 text-neutral-600">
                          {scr.branch}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {scr.orientation === 'portrait' ? 'عمودي 9:16' : 'أفقي 16:9'}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 font-mono flex items-center gap-2">
                        <span>كود: {scr.code}</span>
                        <span>•</span>
                        <span>رمز الاقتران: <strong className="text-purple-700">{scr.pairingPin || 'TMY-1001'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onOpenPlayer(scr.code);
                        }}
                        className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold cursor-pointer transition-colors"
                        title="فتح شاشة العرض"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleClientDeleteScreen(scr.id, scr.name)}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold cursor-pointer transition-colors"
                        title="حذف الشاشة لتفريغ حصة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end shrink-0">
              <button
                onClick={() => setShowManageScreensModal(false)}
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
