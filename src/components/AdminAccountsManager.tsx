import React, { useState, useEffect } from 'react';
import { ClientAccount, ScreenDevice, InquiryRequest } from '../types';
import { StorageService } from '../services/storage';
import { AdminInquiriesManager } from './AdminInquiriesManager';
import { 
  Building2, 
  Tv, 
  Plus, 
  ShieldCheck, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Trash2,
  Edit2,
  Sliders,
  Layers,
  ArrowRight,
  Radio,
  Copy,
  Check,
  Key,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  MessageSquare,
  Sparkles,
  UserPlus,
  Clock,
  Calendar,
  CalendarPlus,
  AlertTriangle
} from 'lucide-react';

interface AdminAccountsManagerProps {
  accounts: ClientAccount[];
  screens: ScreenDevice[];
  onAccountsChange: () => void;
  onSelectAccountForDashboard: (account: ClientAccount) => void;
}

export const AdminAccountsManager: React.FC<AdminAccountsManagerProps> = ({
  accounts,
  screens,
  onAccountsChange,
  onSelectAccountForDashboard,
}) => {
  const [adminTab, setAdminTab] = useState<'accounts' | 'contacts' | 'subscriptions'>('accounts');
  const [inquiries, setInquiries] = useState<InquiryRequest[]>(() => StorageService.getInquiries());

  useEffect(() => {
    const unsub = StorageService.subscribe((msg) => {
      if (msg.type === 'INQUIRIES_UPDATED') {
        setInquiries(StorageService.getInquiries());
      }
    });
    return () => unsub();
  }, []);

  const contactRequests = inquiries.filter(i => i.type === 'contact');
  const subscriptionRequests = inquiries.filter(i => i.type === 'subscription');
  const newContactsCount = contactRequests.filter(i => i.status === 'new').length;
  const newSubscriptionsCount = subscriptionRequests.filter(i => i.status === 'new').length;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddScreenModal, setShowAddScreenModal] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<ClientAccount | null>(null);
  const [copiedLinkInfo, setCopiedLinkInfo] = useState<string | null>(null);

  const copyClientLink = (accountId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('portal', 'client');
    url.searchParams.set('account', accountId);
    navigator.clipboard.writeText(url.toString());
    setCopiedLinkInfo(`client_${accountId}`);
    setTimeout(() => setCopiedLinkInfo(null), 2500);
  };

  const copyScreenLink = (screenCode: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('portal', 'player');
    url.searchParams.set('screen', screenCode);
    navigator.clipboard.writeText(url.toString());
    setCopiedLinkInfo(`screen_${screenCode}`);
    setTimeout(() => setCopiedLinkInfo(null), 2500);
  };

  // Form State for New Account
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+966 ');
  const [accountPassword, setAccountPassword] = useState('tamy1234');
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [maxScreens, setMaxScreens] = useState<number>(5);
  const [notes, setNotes] = useState('');

  // Subscription Fields for Create / Edit Account
  const [subscriptionDays, setSubscriptionDays] = useState<number>(30);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  const handleDaysChange = (days: number) => {
    setSubscriptionDays(days);
    const d = new Date();
    d.setDate(d.getDate() + days);
    setSubscriptionExpiresAt(d.toISOString().split('T')[0]);
  };

  const handleDateChange = (dateStr: string) => {
    setSubscriptionExpiresAt(dateStr);
    const target = new Date(dateStr);
    const now = new Date();
    const diff = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    setSubscriptionDays(diff);
  };

  // Dedicated Subscription Extension Modal State
  const [extendingAccount, setExtendingAccount] = useState<ClientAccount | null>(null);
  const [extendMode, setExtendMode] = useState<'days' | 'date'>('days');
  const [extendDays, setExtendDays] = useState<number>(30);
  const [extendTargetDate, setExtendTargetDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [extendScreensQuota, setExtendScreensQuota] = useState<number>(5);

  const openExtendModal = (acc: ClientAccount) => {
    setExtendingAccount(acc);
    setExtendMode('days');
    setExtendDays(30);
    setExtendScreensQuota(acc.maxScreens);

    // Compute default target date
    const isExpired = StorageService.isAccountExpired(acc);
    const baseDate = (!isExpired && acc.subscriptionExpiresAt)
      ? new Date(acc.subscriptionExpiresAt)
      : new Date();
    baseDate.setDate(baseDate.getDate() + 30);
    setExtendTargetDate(baseDate.toISOString().split('T')[0]);
  };

  const handleExtendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendingAccount) return;

    let updated: ClientAccount | null = null;
    if (extendMode === 'days') {
      updated = StorageService.extendAccountSubscription(extendingAccount.id, {
        days: Number(extendDays),
      });
    } else {
      updated = StorageService.extendAccountSubscription(extendingAccount.id, {
        targetDate: extendTargetDate,
      });
    }

    if (updated && Number(extendScreensQuota) !== extendingAccount.maxScreens) {
      updated.maxScreens = Number(extendScreensQuota);
      StorageService.saveAccount(updated);
    }

    setExtendingAccount(null);
    onAccountsChange();
  };

  // Accounts Filter Tab
  const [accountFilter, setAccountFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');

  // Form State for Adding Screen to Account
  const [screenName, setScreenName] = useState('');
  const [screenBranch, setScreenBranch] = useState('');
  const [screenOrientation, setScreenOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [screenResolution, setScreenResolution] = useState('1920x1080 (Full HD)');
  const [screenError, setScreenError] = useState('');

  // Summary Metrics
  const totalScreensQuota = accounts.reduce((acc, a) => acc + a.maxScreens, 0);
  const totalActiveScreens = screens.length;
  const onlineScreensCount = screens.filter(s => s.status === 'online').length;

  const activeAccountsCount = accounts.filter(a => !StorageService.isAccountExpired(a)).length;
  const expiredAccountsCount = accounts.filter(a => StorageService.isAccountExpired(a)).length;
  const expiringSoonCount = accounts.filter(a => {
    const days = StorageService.getSubscriptionRemainingDays(a);
    return !StorageService.isAccountExpired(a) && days <= 7;
  }).length;

  const handleConvertInquiryToAccount = (inquiry: InquiryRequest) => {
    setEditingAccount(null);
    const shortCode = (inquiry.companyName || inquiry.name || 'CLIENT')
      .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '')
      .slice(0, 6)
      .toUpperCase();
    setName(shortCode || 'CLIENT');
    setCompanyName(inquiry.companyName || inquiry.name);
    setEmail(inquiry.email || `client_${Date.now()}@tamy.sa`);
    setPhone(inquiry.phone || '+966 ');
    setMaxScreens(Number(inquiry.screensCount) || 3);
    setNotes(`طلب ${inquiry.type === 'subscription' ? 'اشتراك' : 'تواصل'}: ${inquiry.planTitle || ''} - ${inquiry.notes || ''}`);
    
    // Check if inquiry contains hints of subscription duration
    const plan = (inquiry.planTitle || '').toLowerCase();
    let days = 30;
    if (plan.includes('سنة') || plan.includes('سنوي') || plan.includes('12')) days = 365;
    else if (plan.includes('6') || plan.includes('نصف')) days = 180;
    else if (plan.includes('3') || plan.includes('ربع')) days = 90;
    handleDaysChange(days);

    setShowAddModal(true);
    setAdminTab('accounts');
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !companyName || !email) return;

    const targetExpiresAt = subscriptionExpiresAt
      ? new Date(subscriptionExpiresAt + 'T23:59:59.999Z').toISOString()
      : new Date(Date.now() + subscriptionDays * 24 * 60 * 60 * 1000).toISOString();

    if (editingAccount) {
      StorageService.saveAccount({
        ...editingAccount,
        name,
        companyName,
        email,
        phone,
        password: accountPassword.trim() || editingAccount.password || '123456',
        maxScreens: Number(maxScreens),
        notes,
        subscriptionDays: Number(subscriptionDays),
        subscriptionExpiresAt: targetExpiresAt,
      });
      setEditingAccount(null);
    } else {
      const newAccount: ClientAccount = {
        id: `acc_${Date.now()}`,
        name: name.trim(),
        companyName: companyName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: accountPassword.trim() || 'tamy1234',
        maxScreens: Number(maxScreens) || 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        notes: notes.trim(),
        subscriptionDays: Number(subscriptionDays),
        subscriptionExpiresAt: targetExpiresAt,
        subscriptionStartedAt: new Date().toISOString(),
      };
      StorageService.saveAccount(newAccount);
    }

    // Reset Form
    setName('');
    setCompanyName('');
    setEmail('');
    setPhone('+966 ');
    setAccountPassword('tamy1234');
    setMaxScreens(5);
    setNotes('');
    handleDaysChange(30);
    setShowAddModal(false);
    onAccountsChange();
  };

  const handleAddScreenToAccount = (e: React.FormEvent, accountId: string) => {
    e.preventDefault();
    setScreenError('');
    if (!screenName) return;

    const code = screenName.toLowerCase().replace(/\s+/g, '-');
    const newScreen: ScreenDevice = {
      id: `scr_${Date.now()}`,
      code,
      name: screenName,
      branch: screenBranch || 'الفرع الرئيسي',
      accountId,
      status: 'online',
      lastPing: new Date().toISOString(),
      orientation: screenOrientation,
      resolution: screenResolution,
      pairingPin: `TMY-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    const res = StorageService.saveScreen(newScreen);
    if (!res.success) {
      setScreenError(res.error || 'تعذر إضافة الشاشة');
      return;
    }

    setScreenName('');
    setScreenBranch('');
    setShowAddScreenModal(null);
    onAccountsChange();
  };

  const handleToggleStatus = (account: ClientAccount) => {
    const updated: ClientAccount = {
      ...account,
      status: account.status === 'active' ? 'suspended' : 'active',
    };
    StorageService.saveAccount(updated);
    onAccountsChange();
  };

  const handleDeleteAccount = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف حساب "${name}" وجميع شاشاته ومحتواه؟`)) {
      StorageService.deleteAccount(id);
      onAccountsChange();
    }
  };

  const openEdit = (acc: ClientAccount) => {
    setEditingAccount(acc);
    setName(acc.name);
    setCompanyName(acc.companyName);
    setEmail(acc.email);
    setPhone(acc.phone);
    setAccountPassword(acc.password || '123456');
    setMaxScreens(acc.maxScreens);
    setNotes(acc.notes || '');
    const days = acc.subscriptionDays || 30;
    setSubscriptionDays(days);
    if (acc.subscriptionExpiresAt) {
      setSubscriptionExpiresAt(acc.subscriptionExpiresAt.split('T')[0]);
    } else {
      const d = new Date();
      d.setDate(d.getDate() + days);
      setSubscriptionExpiresAt(d.toISOString().split('T')[0]);
    }
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-neutral-900">
                لوحة الإدارة المركزية - نظام Tamy
              </h1>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              إدارة حسابات المطاعم والمكاتب، وتخصيص عدد الشاشات المسموح بها لكل عميل، ومراقبة البث السحابي
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingAccount(null);
                setName('');
                setCompanyName('');
                setEmail('');
                setPhone('+966 ');
                setMaxScreens(5);
                setNotes('');
                setShowAddModal(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء حساب عميل جديد</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div 
            onClick={() => setAdminTab('accounts')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              adminTab === 'accounts' ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-600/30' : 'bg-neutral-50 border-neutral-200/60 hover:bg-neutral-100/70'
            }`}
          >
            <div className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              <span>حسابات العملاء</span>
            </div>
            <div className="text-2xl font-black text-neutral-900 mt-1">
              {accounts.length}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">منشأة ومطعم مسجل</div>
          </div>

          <div 
            onClick={() => setAdminTab('accounts')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              adminTab === 'accounts' ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-600/30' : 'bg-neutral-50 border-neutral-200/60 hover:bg-neutral-100/70'
            }`}
          >
            <div className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-purple-600" />
              <span>الشاشات المربوطة</span>
            </div>
            <div className="text-2xl font-black text-neutral-900 mt-1">
              {totalActiveScreens}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">من {totalScreensQuota} شاشة مرخصة</div>
          </div>

          <div 
            onClick={() => setAdminTab('contacts')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              adminTab === 'contacts' ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-600/30' : 'bg-neutral-50 border-neutral-200/60 hover:bg-neutral-100/70'
            }`}
          >
            <div className="text-xs font-semibold text-neutral-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                <span>طلبات التواصل</span>
              </span>
              {newContactsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              )}
            </div>
            <div className="text-2xl font-black text-neutral-900 mt-1 flex items-baseline gap-2">
              <span>{contactRequests.length}</span>
              {newContactsCount > 0 && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  +{newContactsCount} جديد
                </span>
              )}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">استفسارات واستشارات</div>
          </div>

          <div 
            onClick={() => setAdminTab('subscriptions')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              adminTab === 'subscriptions' ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-600/30' : 'bg-neutral-50 border-neutral-200/60 hover:bg-neutral-100/70'
            }`}
          >
            <div className="text-xs font-semibold text-neutral-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>اهتمامات الاشتراك</span>
              </span>
              {newSubscriptionsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              )}
            </div>
            <div className="text-2xl font-black text-neutral-900 mt-1 flex items-baseline gap-2">
              <span>{subscriptionRequests.length}</span>
              {newSubscriptionsCount > 0 && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  +{newSubscriptionsCount} جديد
                </span>
              )}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">حجوزات وتراخيص شاشات</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60 col-span-2 sm:col-span-1">
            <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>المتصلة أونلاين</span>
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {onlineScreensCount}
            </div>
            <div className="text-[11px] text-emerald-700/80 mt-0.5">بث سحابي نشط لحظياً</div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4 mt-4">
          <button
            onClick={() => setAdminTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'accounts'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>حسابات العملاء والشاشات</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] ${adminTab === 'accounts' ? 'bg-purple-700 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
              {accounts.length}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('contacts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'contacts'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>طلبات التواصل</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] ${adminTab === 'contacts' ? 'bg-purple-700 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
              {contactRequests.length}
            </span>
            {newContactsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('subscriptions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'subscriptions'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>اهتمامات الاشتراك</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] ${adminTab === 'subscriptions' ? 'bg-purple-700 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
              {subscriptionRequests.length}
            </span>
            {newSubscriptionsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Accounts and Screens */}
      {adminTab === 'accounts' && (
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              قائمة حسابات العملاء والحصص المصرحة للشاشات
            </h2>
            <span className="text-xs text-neutral-500 font-medium">
              يقوم كل عميل بإضافة وإدارة شاشاته من داخل حسابه الخاص وفق الحد الأقصى ومدة الاشتراك المحددة له
            </span>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-200/60 shrink-0">
            إضافة الشاشات: مهمة العميل داخل حسابه
          </span>
        </div>

        {/* Filter Pills */}
        <div className="p-4 bg-neutral-50/70 border-b border-neutral-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-neutral-500 ml-2">فلترة الاشتراكات:</span>
          <button
            type="button"
            onClick={() => setAccountFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              accountFilter === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            جميع الحسابات ({accounts.length})
          </button>
          <button
            type="button"
            onClick={() => setAccountFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              accountFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>نشطة وسارية ({activeAccountsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setAccountFilter('expiring')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              accountFilter === 'expiring'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>تنتهي قريباً (≤ 7 أيام) ({expiringSoonCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setAccountFilter('expired')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              accountFilter === 'expired'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>منتهية ومقفلة ({expiredAccountsCount})</span>
          </button>
        </div>

        <div className="divide-y divide-neutral-100">
          {accounts.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-4">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto border border-purple-100">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-neutral-900">لا توجد حسابات مسجلة حالياً</h3>
                <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                  النظام جاهز وخالٍ من أي بيانات وهمية. ابدأ الآن بإنشاء أول حساب عميل (مطعم، مقهى، مكتب، شركة) وحدد عدد الشاشات المسموح بربطها ومدة الاشتراك.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingAccount(null);
                  setName('');
                  setCompanyName('');
                  setEmail('');
                  setPhone('+966 ');
                  setMaxScreens(5);
                  setNotes('');
                  handleDaysChange(30);
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ إنشاء أول حساب عميل</span>
              </button>
            </div>
          ) : (
            (() => {
              const displayedAccounts = accounts.filter(acc => {
                const isExpired = StorageService.isAccountExpired(acc);
                const days = StorageService.getSubscriptionRemainingDays(acc);
                if (accountFilter === 'active') return !isExpired;
                if (accountFilter === 'expiring') return !isExpired && days <= 7;
                if (accountFilter === 'expired') return isExpired;
                return true;
              });

              if (displayedAccounts.length === 0) {
                return (
                  <div className="py-12 px-4 text-center text-neutral-500 text-xs">
                    لا توجد حسابات تطابق الفلتر المحدد حالياً.
                  </div>
                );
              }

              return displayedAccounts.map(acc => {
                const accScreens = screens.filter(s => s.accountId === acc.id);
                const percentageUsed = Math.min(100, Math.round((accScreens.length / acc.maxScreens) * 100));
                const isExpired = StorageService.isAccountExpired(acc);
                const remainingDays = StorageService.getSubscriptionRemainingDays(acc);
                const expiryDateFormatted = acc.subscriptionExpiresAt
                  ? acc.subscriptionExpiresAt.split('T')[0]
                  : 'غير محدد';

                return (
                  <div key={acc.id} className="p-5 hover:bg-neutral-50/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Account Identity */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-black text-base flex items-center justify-center shrink-0">
                          {acc.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-neutral-900">{acc.companyName}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-neutral-100 text-neutral-700">
                              {acc.name}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                acc.status === 'active' && !isExpired
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {isExpired ? 'اشتراك منتهي (مقفل)' : acc.status === 'active' ? 'نشط' : 'موقوف'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-neutral-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-neutral-400" />
                              {acc.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-neutral-400" />
                              <span dir="ltr">{acc.phone}</span>
                            </span>
                            <span className="flex items-center gap-1.5 font-mono bg-purple-50/70 px-2 py-0.5 rounded-md text-[11px] text-purple-900 border border-purple-200">
                              <Key className="w-3 h-3 text-purple-600" />
                              <span className="font-sans font-bold">كلمة المرور:</span>
                              <span className="font-bold">{revealedPasswords[acc.id] ? (acc.password || '123456') : '••••••'}</span>
                              <button
                                type="button"
                                onClick={() => setRevealedPasswords(prev => ({ ...prev, [acc.id]: !prev[acc.id] }))}
                                className="text-purple-400 hover:text-purple-700 cursor-pointer p-0.5"
                                title={revealedPasswords[acc.id] ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                              >
                                {revealedPasswords[acc.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(acc.password || '123456');
                                  setCopiedLinkInfo(`pass_${acc.id}`);
                                  setTimeout(() => setCopiedLinkInfo(null), 2000);
                                }}
                                className="text-purple-400 hover:text-purple-700 cursor-pointer p-0.5 mr-0.5"
                                title="نسخ كلمة المرور للعميل"
                              >
                                {copiedLinkInfo === `pass_${acc.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </span>
                            {acc.notes && (
                              <span className="text-neutral-400">
                                • {acc.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Subscription Status & Extension Block */}
                      <div className="bg-neutral-50/90 p-3 rounded-xl border border-neutral-200/80 min-w-[240px]">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-bold text-neutral-600 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-purple-600" />
                            <span>مدة وصلاحية الاشتراك:</span>
                          </span>
                          {isExpired ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-rose-600" />
                              <span>منتهي ومقفل</span>
                            </span>
                          ) : remainingDays <= 7 ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>ينتهي قريباً</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>ساري ونشط</span>
                            </span>
                          )}
                        </div>

                        <div className="text-xs space-y-1">
                          <div className="flex items-center justify-between text-neutral-700">
                            <span className="text-neutral-500">الرصيد المتبقي:</span>
                            <span className={`font-bold ${isExpired ? 'text-rose-600' : remainingDays <= 7 ? 'text-amber-700' : 'text-emerald-700'}`}>
                              {isExpired
                                ? `منتهي (مضى ${Math.abs(remainingDays)} يوم)`
                                : `${remainingDays} يوماً`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-neutral-700">
                            <span className="text-neutral-500">تاريخ الانتهاء:</span>
                            <span className="font-mono font-bold text-neutral-800 text-[11px]" dir="ltr">
                              {expiryDateFormatted}
                            </span>
                          </div>
                        </div>

                        {/* Extend Subscription Action Button */}
                        <button
                          type="button"
                          onClick={() => openExtendModal(acc)}
                          className="w-full mt-2 py-1.5 px-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          title="تمديد أو زيادة مدة الاشتراك بالأيام أو التاريخ"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span>تمديد / تعديل مدة الاشتراك</span>
                        </button>
                      </div>

                      {/* Screen Quota Meter */}
                      <div className="flex items-center gap-4">
                        <div className="w-40">
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-neutral-600">الشاشات:</span>
                            <span className="text-purple-700 font-bold">
                              {accScreens.length} / {acc.maxScreens}
                            </span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                percentageUsed >= 100 ? 'bg-amber-500' : 'bg-purple-600'
                              }`}
                              style={{ width: `${percentageUsed}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          {/* Add Screen Button if quota allows */}
                          <button
                            onClick={() => {
                              setScreenError('');
                              setShowAddScreenModal(acc.id);
                            }}
                            disabled={accScreens.length >= acc.maxScreens}
                            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                              accScreens.length >= acc.maxScreens
                                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                            }`}
                            title={accScreens.length >= acc.maxScreens ? 'تم الوصول للحد الأقصى للشاشات' : 'إضافة شاشة'}
                          >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">شاشة</span>
                          </button>

                          {/* Copy Client Direct Portal Link */}
                          <button
                            onClick={() => copyClientLink(acc.id)}
                            className="p-2 text-neutral-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg border border-neutral-200 transition-colors cursor-pointer"
                            title="نسخ الرابط المباشر للعميل لدخول لوحة تحكمه"
                          >
                            {copiedLinkInfo === `client_${acc.id}` ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          {/* Go to Dashboard as this Client */}
                          <button
                            onClick={() => onSelectAccountForDashboard(acc)}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            title="الدخول للوحة تحكم شاشات هذا العميل"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">إدارة</span>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEdit(acc)}
                            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                            title="تعديل بيانات الحساب والحد الأقصى ومدة الاشتراك"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteAccount(acc.id, acc.companyName)}
                            className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف الحساب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>

                {/* Sub-list of screens for this account */}
                {accScreens.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-neutral-100/80 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-neutral-400">الشاشات المرتبطة:</span>
                    {accScreens.map(scr => (
                      <div
                        key={scr.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 text-xs border border-neutral-200/60"
                      >
                        <span className={`w-2 h-2 rounded-full ${scr.status === 'online' ? 'bg-emerald-500' : 'bg-neutral-400'}`}></span>
                        <span className="font-bold">{scr.name}</span>
                        <span className="text-[10px] text-neutral-500">({scr.branch})</span>
                        <span className="text-[10px] text-purple-600 font-mono">[{scr.code}]</span>
                        <button
                          type="button"
                          onClick={() => copyScreenLink(scr.code)}
                          className="text-neutral-400 hover:text-purple-600 transition-colors mr-1 cursor-pointer"
                          title="نسخ رابط شاشة العرض المباشر"
                        >
                          {copiedLinkInfo === `screen_${scr.code}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          });
        })()
          )}
        </div>
      </div>
      )}

      {/* Tab 2: Contact Requests */}
      {adminTab === 'contacts' && (
        <AdminInquiriesManager
          type="contact"
          inquiries={inquiries}
          onInquiriesChange={() => {
            setInquiries(StorageService.getInquiries());
            onAccountsChange();
          }}
          onConvertToAccount={handleConvertInquiryToAccount}
        />
      )}

      {/* Tab 3: Subscription Interests */}
      {adminTab === 'subscriptions' && (
        <AdminInquiriesManager
          type="subscription"
          inquiries={inquiries}
          onInquiriesChange={() => {
            setInquiries(StorageService.getInquiries());
            onAccountsChange();
          }}
          onConvertToAccount={handleConvertInquiryToAccount}
        />
      )}

      {/* MODAL: Create / Edit Account */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] shadow-2xl border border-neutral-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:px-6 sm:py-4 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="text-base sm:text-lg font-black text-neutral-900">
                  {editingAccount ? 'تعديل بيانات حساب العميل' : 'إنشاء حساب جديد وتعيين عدد الشاشات'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  حدد اسم المنشأة، البريد الإلكتروني، والحد الأقصى لعدد الشاشات المسموح به للعميل
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAccount(null);
                }}
                className="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg p-1.5 transition-colors cursor-pointer"
                title="إغلاق"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    الاسم التجاري / اسم المنشأة *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مقهى كونا (KONA Specialty Coffee)"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      الرمز المختصر للحساب *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: KONA"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      الحد الأقصى للشاشات (يضيفها العميل من حسابه) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={maxScreens}
                      onChange={e => setMaxScreens(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600 font-bold text-purple-700"
                    />
                    <span className="text-[10px] text-neutral-400">العميل يضيف شاشاته بحرية حتى هذا الحد</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      البريد الإلكتروني للإدارة *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="kona@tamy.tech"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      رقم الهاتف / الواتساب
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                {/* Password Assignment by Admin */}
                <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-purple-700" />
                      <span>تعيين كلمة مرور حساب العميل *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const generated = 'tamy' + Math.floor(1000 + Math.random() * 9000);
                        setAccountPassword(generated);
                      }}
                      className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-purple-200 shadow-2xs"
                    >
                      <RefreshCw className="w-3 h-3 text-purple-600" />
                      <span>توليد تلقائي</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showModalPassword ? 'text' : 'password'}
                      required
                      value={accountPassword}
                      onChange={e => setAccountPassword(e.target.value)}
                      placeholder="مثال: tamy1234"
                      className="w-full pr-9 pl-9 py-2 text-sm rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono bg-white text-neutral-900"
                    />
                    <Lock className="w-4 h-4 text-purple-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer p-0.5"
                      title={showModalPassword ? 'إخفاء' : 'إظهار'}
                    >
                      {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-purple-800/80 mt-1.5">
                    يستخدم العميل هذه الكلمة لتسجيل الدخول في بوابة الدخول الموحدة للوصول إلى لوحة تحكم شاشاته.
                  </p>
                </div>

                {/* Subscription Duration & Expiration Setup */}
                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <CalendarPlus className="w-4 h-4 text-emerald-700" />
                      <span>مدة الاشتراك وتاريخ الانتهاء *</span>
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                      قفل تلقائي للشاشات عند الانتهاء
                    </span>
                  </div>

                  {/* Quick presets */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {[
                      { label: '30 يوم (شهر)', days: 30 },
                      { label: '90 يوم (3 أشهر)', days: 90 },
                      { label: '180 يوم (6 أشهر)', days: 180 },
                      { label: '365 يوم (سنة كاملة)', days: 365 },
                    ].map(preset => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => handleDaysChange(preset.days)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          subscriptionDays === preset.days
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100/60'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        المدة المحددة (بالأيام)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="3650"
                        required
                        value={subscriptionDays}
                        onChange={e => handleDaysChange(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-emerald-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        تاريخ انتهاء الاشتراك
                      </label>
                      <input
                        type="date"
                        required
                        value={subscriptionExpiresAt}
                        onChange={e => handleDateChange(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-neutral-800 bg-white"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-emerald-900/80 mt-2">
                    عند انتهاء هذه المدة، ستتوقف شاشات العميل فوراً وتظهر شاشة "الاشتراك منتهي" إلى أن يتم تمديده من قبل الإدارة.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    ملاحظات أو مواقع الفروع
                  </label>
                  <textarea
                    rows={2}
                    placeholder="مثال: فرع البساتين، فرع التحلية..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  ></textarea>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 p-4 sm:px-6 sm:py-3.5 border-t border-neutral-100 bg-neutral-50 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingAccount(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-200/70 rounded-xl cursor-pointer transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  {editingAccount ? 'حفظ التعديلات' : 'إنشاء وتأكيد الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Extend Subscription by Days or Date */}
      {extendingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] shadow-2xl border border-neutral-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between border-b border-neutral-100 p-4 sm:px-6 sm:py-4 shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900">
                    تمديد وتحديث اشتراك العميل
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {extendingAccount.companyName} ({extendingAccount.name})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExtendingAccount(null)}
                className="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg p-1.5 transition-colors cursor-pointer"
                title="إغلاق"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleExtendSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Current Status Overview */}
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600 font-medium">حالة الاشتراك الحالية:</span>
                    {StorageService.isAccountExpired(extendingAccount) ? (
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-rose-600" />
                        <span>منتهي ومقفل (انتهى {extendingAccount.subscriptionExpiresAt ? extendingAccount.subscriptionExpiresAt.split('T')[0] : ''})</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>نشط وساري (متبقي {StorageService.getSubscriptionRemainingDays(extendingAccount)} يوماً)</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600 font-medium">تاريخ الانتهاء المسجل:</span>
                    <span className="font-mono font-bold text-neutral-800" dir="ltr">
                      {extendingAccount.subscriptionExpiresAt ? extendingAccount.subscriptionExpiresAt.split('T')[0] : 'غير محدد'}
                    </span>
                  </div>
                </div>

                {/* Extension Method Selector */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    اختر طريقة التمديد:
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setExtendMode('days')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        extendMode === 'days'
                          ? 'bg-white text-purple-700 shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>زيادة المدة بالأيام</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExtendMode('date')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        extendMode === 'date'
                          ? 'bg-white text-purple-700 shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>التحديد المباشر بالتاريخ</span>
                    </button>
                  </div>
                </div>

                {/* Mode 1: Extend by Days */}
                {extendMode === 'days' && (
                  <div className="space-y-3 bg-purple-50/50 p-3.5 rounded-xl border border-purple-200">
                    <label className="block text-xs font-bold text-purple-900">
                      اختر عدد الأيام المراد إضافتها لرصيد العميل:
                    </label>
                    
                    {/* Preset quick buttons */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {[
                        { label: '+7 أيام', days: 7 },
                        { label: '+15 يوم', days: 15 },
                        { label: '+30 يوم (شهر)', days: 30 },
                        { label: '+60 يوم (شهران)', days: 60 },
                        { label: '+90 يوم (3 أشهر)', days: 90 },
                        { label: '+180 يوم (6 أشهر)', days: 180 },
                        { label: '+365 يوم (سنة)', days: 365 },
                      ].map(p => (
                        <button
                          key={p.days}
                          type="button"
                          onClick={() => setExtendDays(p.days)}
                          className={`text-xs font-bold py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                            extendDays === p.days
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100/60'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        أو أدخل عدد الأيام يدوياً:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="3650"
                        required
                        value={extendDays}
                        onChange={e => setExtendDays(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600 font-bold text-purple-900 bg-white"
                      />
                    </div>

                    {/* Live calculation preview */}
                    <div className="p-2.5 bg-white rounded-lg border border-purple-200 text-xs space-y-1">
                      <div className="text-neutral-600 font-medium">
                        {StorageService.isAccountExpired(extendingAccount)
                          ? 'نظراً لأن الاشتراك منتهي حالياً، سيبدأ الاحتساب من اليوم وتكون النتيجة:'
                          : 'سيتم إضافة الأيام إلى رصيد الاشتراك الساري الحالي وتكون النتيجة:'}
                      </div>
                      <div className="flex items-center justify-between font-bold text-purple-900 pt-1 border-t border-purple-100">
                        <span>تاريخ الانتهاء الجديد:</span>
                        <span className="font-mono text-sm" dir="ltr">
                          {(() => {
                            const isExpired = StorageService.isAccountExpired(extendingAccount);
                            const base = (!isExpired && extendingAccount.subscriptionExpiresAt)
                              ? new Date(extendingAccount.subscriptionExpiresAt)
                              : new Date();
                            base.setDate(base.getDate() + Number(extendDays || 0));
                            return base.toISOString().split('T')[0];
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode 2: Set by Specific Date */}
                {extendMode === 'date' && (
                  <div className="space-y-3 bg-purple-50/50 p-3.5 rounded-xl border border-purple-200">
                    <label className="block text-xs font-bold text-purple-900 mb-1">
                      حدد تاريخ انتهاء الاشتراك الجديد المطلوب:
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={extendTargetDate}
                      onChange={e => setExtendTargetDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600 font-bold text-neutral-800 bg-white"
                    />

                    {/* Live calculation preview */}
                    {extendTargetDate && (
                      <div className="p-2.5 bg-white rounded-lg border border-purple-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-purple-900">
                          <span>المدة المحسوبة من اليوم:</span>
                          <span>
                            {Math.max(1, Math.ceil((new Date(extendTargetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} يوماً
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Adjustment of Max Screens quota in the same modal as requested */}
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    الحد الأقصى لعدد الشاشات المسموح بها للعميل:
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={extendScreensQuota}
                      onChange={e => setExtendScreensQuota(Number(e.target.value))}
                      className="w-32 px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600 font-bold text-purple-700 bg-white"
                    />
                    <span className="text-xs text-neutral-500">
                      (الحالي: {extendingAccount.maxScreens} شاشات)
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    عند حفظ التمديد، سيتم تنشيط الحساب تلقائياً، وإلغاء قفل شاشات العميل فوراً وبث التحديث لحظياً.
                  </span>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex items-center justify-end gap-2.5 p-4 sm:px-6 sm:py-3.5 border-t border-neutral-100 bg-neutral-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setExtendingAccount(null)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-200/70 rounded-xl cursor-pointer transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>حفظ وتفعيل التمديد فوراً</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Screen to Account */}
      {showAddScreenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] sm:max-h-[88vh] shadow-2xl border border-neutral-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:px-6 sm:py-4 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="text-base sm:text-lg font-black text-neutral-900">
                  إضافة شاشة جديدة للحساب
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  إضافة شاشة عرض إعلانية ذكية وتوليد رمز ربط تلقائي
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddScreenModal(null)}
                className="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg p-1.5 transition-colors cursor-pointer"
                title="إغلاق"
              >
                ✕
              </button>
            </div>

            <form onSubmit={e => handleAddScreenToAccount(e, showAddScreenModal)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {screenError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{screenError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    اسم أو كود الشاشة *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: albasatin 003 أو Reception Screen"
                    value={screenName}
                    onChange={e => setScreenName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    موقع الفرع / الموقع الدقيق للشاشة
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: فرع البساتين - شاشة العروض الجانبية"
                    value={screenBranch}
                    onChange={e => setScreenBranch(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      اتجاه الشاشة
                    </label>
                    <select
                      value={screenOrientation}
                      onChange={e => setScreenOrientation(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="landscape">أفقي (Landscape 16:9)</option>
                      <option value="portrait">عمودي (Portrait 9:16)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      دقة العرض
                    </label>
                    <select
                      value={screenResolution}
                      onChange={e => setScreenResolution(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="1920x1080 (Full HD)">1920x1080 (FHD)</option>
                      <option value="3840x2160 (4K UHD)">3840x2160 (4K)</option>
                      <option value="1080x1920 (Vertical)">1080x1920 (عمودي)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 p-4 sm:px-6 sm:py-3.5 border-t border-neutral-100 bg-neutral-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddScreenModal(null)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-200/70 rounded-xl cursor-pointer transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  إضافة الشاشة وتأكيد الحصة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
