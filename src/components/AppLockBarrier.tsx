import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  User,
  MessageCircle,
  Globe,
  UserCheck
} from 'lucide-react';

interface AppLockBarrierProps {
  children: React.ReactNode;
}

export const AppLockBarrier: React.FC<AppLockBarrierProps> = ({ children }) => {
  const { language, setLanguage, isAuthenticated, login, t, currentUser } = useApp();

  // App lock state: Locked if not authenticated on startup, or manually locked
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    try {
      const manualLocked = sessionStorage.getItem('kmf_app_is_locked') === 'true';
      const authSession =
        sessionStorage.getItem('kmf_authenticated_session') === 'true' ||
        localStorage.getItem('kmf_authenticated_session') === 'true';
      const hasUser = !!localStorage.getItem('kmf_user_session');
      return manualLocked || !authSession || !hasUser;
    } catch {
      return true;
    }
  });

  // Require users to explicitly enter their credentials (no auto-login, passwords hidden)
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlockSuccess, setUnlockSuccess] = useState(false);

  // Listen for manual lock triggers from the top taskbar or menu
  useEffect(() => {
    const handleLockEvent = () => {
      try {
        sessionStorage.setItem('kmf_app_is_locked', 'true');
      } catch {}
      setIsLocked(true);
      setError(null);
      setUnlockSuccess(false);
    };

    window.addEventListener('kmf_lock_app', handleLockEvent);
    return () => window.removeEventListener('kmf_lock_app', handleLockEvent);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = usernameInput.trim();
    const cleanPass = passwordInput.trim();

    if (!cleanUser || !cleanPass) {
      setError(
        language === 'ur'
          ? 'براہ کرم یوزر نیم اور پاس ورڈ دونوں درج فرمائیں۔'
          : 'Please enter both username and password.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(cleanUser, cleanPass);
      if (res.success) {
        setUnlockSuccess(true);
        setTimeout(() => {
          try {
            sessionStorage.removeItem('kmf_app_is_locked');
            sessionStorage.setItem('kmf_authenticated_session', 'true');
            localStorage.setItem('kmf_authenticated_session', 'true');
          } catch {}
          setIsLocked(false);
          setUnlockSuccess(false);
          setError(null);
        }, 500);
      } else {
        setError(res.message || (
          language === 'ur'
            ? 'غلط یوزر نیم یا پاس ورڈ! رسائی نامنظور ہے۔'
            : 'Invalid credentials. Access restricted.'
        ));
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If authenticated and not locked, render app data layout
  if (isAuthenticated && !isLocked) {
    return <>{children}</>;
  }

  // Full-screen Portal Startup Authentication & Security Gate
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-[#003d26] via-[#022c1b] to-[#011a10] text-white overflow-y-auto animate-fadeIn">
      {/* Decorative Glow */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl border-4 border-emerald-600/60 p-6 sm:p-8 my-6 overflow-hidden">
        
        {/* Top Islamic Accent */}
        <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="text-xs font-serif text-[#004d30] dark:text-amber-400 font-bold tracking-widest font-urdu mb-2">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>

          <div className="inline-flex items-center justify-center p-1 rounded-full bg-gradient-to-tr from-amber-400 to-[#004d30] shadow-md ring-2 ring-emerald-500/30 mb-2">
            <BrandLogo size={56} className="w-14 h-14" />
          </div>

          <h2 className="text-xl font-bold font-urdu text-[#004d30] dark:text-emerald-100">
            {language === 'ur' ? 'کفالتِ میت فنڈ ویلفیئر سوسائٹی' : 'Kifaalat e Miyyat Fund Welfare Society'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {language === 'ur'
              ? 'سیکیورٹی لاگ ان: یوزر نیم اور پاس ورڈ درج فرمائیں (لاگ ان معلومات ایڈمن سے حاصل کریں)'
              : 'Secure Portal Login: Enter assigned username & password.'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="mt-5 space-y-3.5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-tight">{error}</div>
            </div>
          )}

          {unlockSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'ur' ? 'کامیاب تصدیق! پورٹل کھل رہا ہے...' : 'Verified! Opening portal data...'}</span>
            </div>
          )}

          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ur' ? 'یوزر نیم (Username):' : 'Username:'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                placeholder="guest, admin, khazanchi, or member username"
                className="w-full px-3.5 py-2.5 pl-9 rtl:pl-3.5 rtl:pr-9 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-600 dark:focus:border-emerald-500 font-medium text-slate-900 dark:text-white text-xs outline-hidden transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {language === 'ur' ? 'یوزر نیم درج کریں (ایڈمن، خزانچی، ممبر یا مہمان)' : 'Enter username (admin, khazanchi, member, or guest)'}
            </p>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'ur' ? 'پاس ورڈ (Password):' : 'Password:'}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? (language === 'ur' ? 'چھپائیں' : 'Hide') : (language === 'ur' ? 'دیکھیں' : 'Show')}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pl-9 rtl:pl-3.5 rtl:pr-9 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-600 dark:focus:border-emerald-500 font-mono text-slate-900 dark:text-white text-sm outline-hidden transition-all"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || unlockSuccess}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#004d30] via-[#023e27] to-[#012819] hover:from-[#023e27] hover:to-[#001f13] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Unlock className="w-4 h-4 text-amber-300" />
            )}
            <span>
              {isSubmitting
                ? (language === 'ur' ? 'تصدیق ہو رہی ہے...' : 'Authenticating...')
                : (language === 'ur' ? 'لاگ ان کریں اور پورٹل کھولیں' : 'Sign In & Open Portal')}
            </span>
          </button>
        </form>

        {/* Member Assistance Card */}
        <div className="mt-4 p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 font-urdu">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{language === 'ur' ? 'اراکین کے لیے اہم ہدایت:' : 'Member Access Instructions:'}</span>
          </div>
          <p className="leading-relaxed">
            {language === 'ur'
              ? 'اراکین اپنے یوزر نیم، پاس ورڈ اور حقوق کے حصول کے لیے ایڈمنسٹریٹر محمد اقبال خٹک (0346-9100998) سے رابطہ فرمائیں۔ ایڈمن کے جاری کردہ یوزر اور پاس ورڈ کے ذریعے آپ لاگ ان ہو سکتے ہیں۔'
              : 'Society members: please approach Administrator Muhammad Iqbal Khattak (0346-9100998) to receive your login credentials and view your contributions.'}
          </p>
          <div className="pt-1 flex items-center gap-2">
            <a
              href="https://wa.me/923469100998?text=السلام%20علیکم،%20مجھے%20کفالتِ%20میت%20فنڈ%20پورٹل%20کے%20لیے%20یوزر%20نیم%20اور%20پاس%20ورڈ%20درکار%20ہے۔"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp Admin (0346-9100998)</span>
            </a>
          </div>
        </div>

        {/* Trilingual Language Selector at bottom */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>زبان / Language:</span>
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setLanguage('ur')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${language === 'ur' ? 'bg-[#004d30] text-white' : 'text-slate-600 dark:text-slate-300'}`}
            >
              اردو
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${language === 'en' ? 'bg-[#004d30] text-white' : 'text-slate-600 dark:text-slate-300'}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${language === 'ar' ? 'bg-[#004d30] text-white' : 'text-slate-600 dark:text-slate-300'}`}
            >
              العربية
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
