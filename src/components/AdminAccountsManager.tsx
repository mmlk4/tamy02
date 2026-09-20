import React, { useState } from 'react';
import { ClientAccount, ScreenDevice } from '../types';
import { StorageService } from '../services/storage';
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
  RefreshCw
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

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !companyName || !email) return;

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
            {accounts.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من رغبتك في حذف جميع الحسابات والشاشات والوسائط بشكل نهائي؟')) {
                    StorageService.clearAllData();
                    onAccountsChange();
                  }
                }}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-neutral-100 hover:bg-rose-50 text-neutral-600 hover:text-rose-600 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-neutral-200"
                title="حذف جميع البيانات وتفريغ النظام"
              >
                <Trash2 className="w-4 h-4" />
                <span>مسح كافة البيانات</span>
              </button>
            )}

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
            <div className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              <span>إجمالي الحسابات</span>
            </div>
            <div className="text-2xl font-black text-neutral-900 mt-1">
              {accounts.length}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">حسابات نشطة ومسجلة</div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
            <div className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-purple-600" />
              <span>الشاشات المربوطة</span>
            </div>
            <div className="text-2xl font-black text-neutral-900 mt-1">
              {totalActiveScreens}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">من أصل {totalScreensQuota} شاشة مرخصة</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
            <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>الشاشات المتصلة الآن</span>
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {onlineScreensCount}
            </div>
            <div className="text-[11px] text-emerald-600/80 mt-0.5">بث سحابي نشط لحظياً</div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/60">
            <div className="text-xs font-semibold text-purple-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>نظام التحديث</span>
            </div>
            <div className="text-sm font-black text-purple-900 mt-2">
              سحابي لحظي (Live Push)
            </div>
            <div className="text-[11px] text-purple-700/80 mt-0.5">tamy.tech 2024</div>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900">
            قائمة حسابات العملاء والحصص المصرحة للشاشات
          </h2>
          <span className="text-xs text-neutral-500 font-medium">
            تخصيص الشاشات وإدارتها لكل منشأة
          </span>
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
                  النظام جاهز وخالٍ من أي بيانات وهمية. ابدأ الآن بإنشاء أول حساب عميل (مطعم، مقهى، مكتب، شركة) وحدد عدد الشاشات المسموح بربطها.
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
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ إنشاء أول حساب عميل</span>
              </button>
            </div>
          ) : (
            accounts.map(acc => {
            const accScreens = screens.filter(s => s.accountId === acc.id);
            const percentageUsed = Math.min(100, Math.round((accScreens.length / acc.maxScreens) * 100));

            return (
              <div key={acc.id} className="p-5 hover:bg-neutral-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Account Identity */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-black text-base flex items-center justify-center shrink-0">
                      {acc.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-bold text-neutral-900">{acc.companyName}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-neutral-100 text-neutral-700">
                          {acc.name}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            acc.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {acc.status === 'active' ? 'نشط' : 'موقوف'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-neutral-500 mt-1.5">
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

                  {/* Screen Quota Meter */}
                  <div className="flex items-center gap-6">
                    <div className="w-48">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-neutral-600">الشاشات المخصصة:</span>
                        <span className="text-purple-700 font-bold">
                          {accScreens.length} / {acc.maxScreens} شاشات
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
                    <div className="flex items-center gap-2">
                      {/* Add Screen Button if quota allows */}
                      <button
                        onClick={() => {
                          setScreenError('');
                          setShowAddScreenModal(acc.id);
                        }}
                        disabled={accScreens.length >= acc.maxScreens}
                        className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                          accScreens.length >= acc.maxScreens
                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                        }`}
                        title={accScreens.length >= acc.maxScreens ? 'تم الوصول للحد الأقصى للشاشات' : 'إضافة شاشة'}
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة شاشة</span>
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
                        <span>إدارة الشاشات</span>
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => openEdit(acc)}
                        className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                        title="تعديل بيانات الحساب والحد الأقصى"
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
          }))}
        </div>
      </div>

      {/* MODAL: Create / Edit Account */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
            <h3 className="text-lg font-black text-neutral-900 mb-1">
              {editingAccount ? 'تعديل بيانات حساب العميل' : 'إنشاء حساب جديد وتعيين عدد الشاشات'}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              حدد اسم المنشأة، البريد الإلكتروني، والحد الأقصى لعدد الشاشات المسموح به
            </p>

            <form onSubmit={handleCreateAccount} className="space-y-4">
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
                    الحد الأقصى لعدد الشاشات *
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

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingAccount(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-xs cursor-pointer"
                >
                  {editingAccount ? 'حفظ التعديلات' : 'إنشاء وتأكيد الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Screen to Account */}
      {showAddScreenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <h3 className="text-lg font-black text-neutral-900 mb-1">
              إضافة شاشة جديدة للحساب
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              إضافة شاشة عرض إعلانية ذكية وتوليد رمز ربط تلقائي
            </p>

            {screenError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{screenError}</span>
              </div>
            )}

            <form onSubmit={e => handleAddScreenToAccount(e, showAddScreenModal)} className="space-y-4">
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

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddScreenModal(null)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-xs cursor-pointer"
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
