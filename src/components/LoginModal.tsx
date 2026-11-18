import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import {
  Lock,
  User,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Users
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, language, t, allCredentials, currentUser } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successUser, setSuccessUser] = useState<string | null>(null);
  const [showQuickList, setShowQuickList] = useState(true);
  const [quickTab, setQuickTab] = useState<'management' | 'members'>('management');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) {
      setError(language === 'ur' ? 'براہ کرم یوزر نیم درج کریں' : language === 'ar' ? 'يرجى إدخال اسم المستخدم' : 'Please enter username or membership ID');
      return;
    }
    if (!password.trim()) {
      setError(language === 'ur' ? 'براہ کرم پاس ورڈ درج کریں' : language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter password');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      setSuccessUser(username);
      setTimeout(() => {
        setSuccessUser(null);
        onClose();
      }, 1000);
    } else {
      setError(result.message || t.auth.invalidCredentials);
    }
  };

  const handleSelectCredential = (cred: typeof allCredentials[0]) => {
    setUsername(cred.username);
    setPassword(cred.password);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border-2 border-emerald-500/30 dark:border-emerald-700/50 p-5 sm:p-6 text-slate-800 dark:text-emerald-50 my-6 overflow-hidden">
        
        {/* Islamic Ornament Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-emerald-200 hover:bg-slate-100 dark:hover:bg-emerald-900 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-4 border-b border-emerald-100 dark:border-emerald-900/60">
          <div className="inline-flex items-center justify-center mb-2">
            <BrandLogo size={56} />
          </div>
          <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100 font-urdu">
            {t.auth.loginTitle}
          </h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
            {t.auth.loginSubtitle}
          </p>
        </div>

        {/* Success Alert */}
        {successUser && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 text-xs flex items-center gap-2 font-semibold animate-pulse">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              {t.auth.loginSuccess} <strong className="underline">{successUser}</strong>!
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              {t.auth.username}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-emerald-600 absolute left-3 rtl:left-auto rtl:right-3 top-2.5" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. khazanchi, admin, kmf1001"
                className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-emerald-100 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              {t.auth.password}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-600 absolute left-3 rtl:left-auto rtl:right-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={language === 'ur' ? 'پاس ورڈ درج کریں' : 'Enter password'}
                className="w-full pl-9 pr-10 rtl:pl-10 rtl:pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-emerald-100 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : t.auth.login}</span>
          </button>
        </form>

        {/* Roles & Permissions Explanation Notice */}
        <div className="mt-4 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-800 dark:text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>{language === 'ur' ? 'اختیارات کی اہم وضاحت (RBAC)' : language === 'ar' ? 'توضيح الصلاحيات الهام' : 'Role Permissions Policy'}</span>
          </div>
          <p>
            {language === 'ur'
              ? 'صرف ایڈمن اور خزانچی (محمد اقبال خٹک) کو ممبران اور اقساط میں ترمیم اور اندراج کا اختیار حاصل ہے۔ عام ممبر صرف رپورٹس اور کھاتہ دیکھ سکتا ہے۔'
              : language === 'ar'
              ? 'الصلاحية للتعديل والإضافة محصورة بالمدير وأمين الصندوق (محمد إقبال ختك). الأعضاء لديهم صلاحية قراءة واطلاع فقط.'
              : 'Admin & Treasurer (Khazanchi Muhammad Iqbal Khattak) hold editing and creation access. Members have view-only access to transparent ledgers.'}
          </p>
        </div>

        {/* Admin Account Quick Fill & Member Privacy Notice */}
        <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-900/60 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1.5 font-urdu">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ur' ? 'سرکاری ایڈمنسٹریٹر لاگ ان' : 'Official Administrator Account'}</span>
            </span>
          </div>


          {/* Admin Account Card */}
          <div
            onClick={() => {
              setUsername('admin');
              setError(null);
            }}
            className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 cursor-pointer transition-all flex items-center justify-between shadow-xs"
          >
            <div>
              <div className="font-bold text-xs text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5 font-urdu">
                <span>{language === 'ur' ? 'محمد اقبال خٹک' : 'Muhammad Iqbal Khattak'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-700 text-white">
                  Super Admin
                </span>
              </div>
              <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-mono mt-1 flex items-center gap-2">
                <span>User: <strong className="text-emerald-950 dark:text-emerald-100">admin</strong></span>
                <span>•</span>
                <span className="text-slate-500 dark:text-emerald-300/80 font-sans italic">
                  {language === 'ur' ? 'پاس ورڈ: محفوظ / خفیہ' : 'Password: Protected'}
                </span>
              </div>
            </div>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold underline cursor-pointer">
              {language === 'ur' ? 'منتخب کریں' : 'Select'}
            </span>
          </div>

          {/* Member Privacy Notice - Members must approach Admin */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
            <Users className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-100 font-urdu text-[11px]">
                {language === 'ur'
                  ? 'اراکین کے اکاؤنٹس اور پاس ورڈز کی رازداری'
                  : 'Member Accounts & Privacy Policy'}
              </p>
              <p className="text-[11px] leading-relaxed">
                {language === 'ur'
                  ? 'سیکیورٹی اور رازداری کے پیش نظر دیگر تمام اراکین کے پاس ورڈز کو خفیہ رکھا گیا ہے۔ معزز اراکین اپنا مخصوص یوزر نیم، پاس ورڈ اور مطلوبہ اختیارات حاصل کرنے کے لیے ایڈمنسٹریٹر محمد اقبال خٹک (0346-9100998) سے رابطہ فرما سکتے ہیں۔'
                  : 'For privacy and system security, individual member credentials are kept confidential. Members may approach Admin Muhammad Iqbal Khattak (0346-9100998) to receive their username, password, and required access permissions.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
