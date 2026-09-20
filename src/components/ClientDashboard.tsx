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
  Sparkles
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
  if (!activeAccount) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-neutral-200 shadow-xs max-w-xl mx-auto space-y-4 my-8">
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

  if (screens.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-neutral-200 shadow-xs max-w-xl mx-auto space-y-4 my-8">
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto border border-purple-100">
          <Tv className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">لا توجد شاشات مفعلة لحساب «{activeAccount.name}» حالياً</h3>
          <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
            الحصة المصرحة لحسابك هي ({activeAccount.maxScreens} شاشات). يرجى التواصل مع مسؤول النظام لتفعيل وربط الشاشات التابعة لمنشأتك.
          </p>
        </div>
      </div>
    );
  }

  const currentScreen = screens.find(s => s.id === activeScreenId) || screens[0];
  const allMedia = activeAccount ? StorageService.getMedia(activeAccount.id) : [];
  const currentSchedules = currentScreen ? StorageService.getSchedules(currentScreen.id) : [];

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
  const [selectedMediaId, setSelectedMediaId] = useState<string>(allMedia[0]?.id || '');
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

  const copyCurrentScreenLink = () => {
    if (!currentScreen) return;
    const url = new URL(window.location.href);
    url.searchParams.set('portal', 'player');
    url.searchParams.set('screen', currentScreen.code);
    navigator.clipboard.writeText(url.toString());
    setCopiedScreenLink(true);
    setTimeout(() => setCopiedScreenLink(false), 2500);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

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

      {/* Screen Selection Bar & Quick Controls */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Screen Selector matching the Tamy mockup */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500">الشاشة الحالية:</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-neutral-900 text-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-neutral-700">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">{previewMedia.title}</h4>
                <span className="text-xs text-neutral-400">معاينة البث عالي الدقة</span>
              </div>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {previewMedia.type === 'video' ? (
                <video src={previewMedia.url} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <img src={previewMedia.url} alt={previewMedia.title} className="w-full h-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Image Duration Modal */}
      {editingScheduleMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-200">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
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

            <div className="p-5 space-y-4">
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

            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2">
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

    </div>
  );
};
