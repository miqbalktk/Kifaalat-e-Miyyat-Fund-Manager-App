import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Moon,
  Sun,
  Globe,
  Cloud,
  CloudOff,
  RefreshCw,
  Bell,
  HeartHandshake,
  ShieldAlert,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  CheckCheck,
  Info,
  Lock,
  HardDrive
} from 'lucide-react';
import { GoogleDriveRestoreModal } from './GoogleDriveRestoreModal';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onOpenDonateModal: () => void;
  onOpenAboutModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, onOpenDonateModal, onOpenAboutModal }) => {
  const {
    language,
    setLanguage,
    t,
    isDark,
    toggleDarkMode,
    currentUser,
    userRole,
    switchRole,
    syncStatus,
    triggerCloudSync,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    setIsLoginModalOpen,
    logout,
    isGoogleDriveConnected
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setShowRoleMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-emerald-950/95 backdrop-blur-md border-b border-emerald-100 dark:border-emerald-900/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 focus:outline-hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative flex items-center justify-center rounded-full p-0.5 bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 shadow-sm ring-1 ring-emerald-500/20">
              <BrandLogo size={40} className="w-9 h-9 sm:w-10 sm:h-10" />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base md:text-lg text-emerald-950 dark:text-emerald-100 leading-tight font-urdu tracking-tight whitespace-nowrap">
                {t.appName}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-400 font-medium hidden sm:block truncate max-w-xs">
                {t.appSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">

          {/* PWA Offline Install Button */}
          <div className="hidden sm:block">
            <PWAInstallButton compact />
          </div>

          {/* Sync & Cloud Status */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={triggerCloudSync}
              disabled={syncStatus.isSyncing}
              title={syncStatus.isOnline ? `Server & Local Disk Synced: ${syncStatus.lastSyncedAt}` : 'Offline Mode (Local Storage Active)'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                syncStatus.isOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
              }`}
            >
              {syncStatus.isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : syncStatus.isOnline ? (
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <CloudOff className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span className="hidden md:inline">
                {syncStatus.isSyncing
                  ? t.security.syncing
                  : syncStatus.isOnline
                  ? `${t.common.online}`
                  : `${t.common.offline} (${syncStatus.pendingChangesCount})`}
              </span>
            </button>

            {/* Google Drive Auto-Backup Button */}
            <button
              onClick={() => setShowDriveModal(true)}
              title={isGoogleDriveConnected ? 'Google Drive Connected: Daily Backups Active' : 'Connect Google Drive for Daily Backups'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                isGoogleDriveConnected
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
                  : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden lg:inline">
                {isGoogleDriveConnected ? 'Drive Backup' : 'Connect Drive'}
              </span>
            </button>
          </div>

          {/* Mobile Portrait Mode Taskbar User Badge */}
          <div className="flex md:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-300/80 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 max-w-[115px] xs:max-w-[145px] shrink truncate shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span className="font-bold text-[11px] truncate leading-none font-urdu">
              {currentUser.nameUrdu && language === 'ur' ? currentUser.nameUrdu : currentUser.name}
            </span>
          </div>

          {/* Quick Donate Button - Admin / Khazanchi Only */}
          {userRole !== 'member' && userRole !== 'guest' && (
            <button
              onClick={onOpenDonateModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-all cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span className="hidden xs:inline">{language === 'ur' ? 'عطیہ دیں' : 'Donate'}</span>
            </button>
          )}

          {/* Screen Lock Button (Always Accessible) */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('kmf_lock_app'));
            }}
            className="p-2 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/60 border border-amber-300 dark:border-amber-800 transition-colors cursor-pointer shrink-0"
            title={language === 'ur' ? 'ایپ لاک کریں (سکیورٹی)' : 'Lock App (Security Passcode)'}
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle - Hidden on mobile, moved to sidebar */}
          <div className="hidden md:flex">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
              title={isDark ? t.common.lightMode : t.common.darkMode}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-700" />}
            </button>
          </div>

          {/* Notifications Dropdown - Hidden on mobile, moved to sidebar */}
          <div className="hidden md:flex relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-lg text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                    {t.dashboard.urgentNotices}
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3" />
                      {language === 'ur' ? 'سب پڑھ لیں' : 'Mark all read'}
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-slate-400 text-center">No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                          !n.read ? 'bg-emerald-50/40 dark:bg-emerald-950/20 font-medium' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {language === 'ur' ? n.titleUrdu : n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.date}</span>
                        </div>
                        <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-300">
                          {language === 'ur' ? n.messageUrdu : n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher & Menu Dropdown - Hidden on mobile, moved to sidebar */}
          <div className="hidden md:flex relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-900/60 hover:bg-emerald-100 text-emerald-950 dark:text-emerald-100 text-xs font-medium border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span className="hidden md:inline font-semibold">
                {currentUser.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200/80 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold">
                {userRole === 'super_admin' ? 'Admin' : userRole === 'finance_secretary' ? (language === 'ur' ? 'خزانچی' : language === 'ar' ? 'أمين الصندوق' : 'Khazanchi') : userRole === 'audit_inspector' ? 'Audit' : (language === 'ur' ? 'ممبر' : language === 'ar' ? 'عضو' : 'Member')}
              </span>
              <ChevronDown className="w-3 h-3 text-emerald-600" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                {/* Active user details */}
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                    {userRole === 'finance_secretary'
                      ? (language === 'ur' ? 'خزانچی (مکمل اختیارات)' : language === 'ar' ? 'أمين الصندوق (صلاحية كاملة)' : 'Treasurer / Khazanchi (Full Edit Access)')
                      : userRole === 'super_admin'
                      ? 'Super Admin (Full Access)'
                      : (language === 'ur' ? 'ممبر (صرف مطالعہ رسائی)' : language === 'ar' ? 'عضو (صلاحية قراءة فقط)' : 'Member (View-Only Access)')}
                  </div>
                </div>

                {/* Secure Authentication Actions */}
                <div className="p-2 space-y-1.5">
                  {(userRole === 'super_admin' || userRole === 'finance_secretary') ? (
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        logout();
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200 dark:border-rose-900"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{language === 'ur' ? 'ایڈمن سے لاگ آؤٹ کریں (صرف مطالعہ ممبر موڈ)' : 'Logout to Member View'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{language === 'ur' ? 'ایڈمن لاگ ان (پاس ورڈ درج کریں)' : 'Admin Login (Enter Password)'}</span>
                    </button>
                  )}

                  {/* Security Notice regarding other accounts */}
                  <div className="p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[10px] text-amber-900 dark:text-amber-200 leading-tight">
                    <p className="font-semibold mb-0.5">
                      {language === 'ur' ? 'اکاؤنٹس اور رازداری پالیسی:' : 'Accounts Policy:'}
                    </p>
                    <p>
                      {language === 'ur'
                        ? 'دیگر تمام اراکین کے اکاؤنٹس سیکیورٹی کے تحت خفیہ ہیں۔ ممبران یوزر نیم، پاس ورڈ اور حقوق کے لیے ایڈمن محمد اقبال خٹک (0346-9100998) سے رابطہ فرمائیں۔'
                        : 'Other accounts are hidden until Admin provides details. Members may approach Admin (0346-9100998) for login and access rights.'}
                    </p>
                  </div>
                </div>

                {/* Trilingual Language Selector */}
                <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.common.language} / زبان / اللغة
                  </div>

                  <div className="grid grid-cols-3 gap-1 px-2 pb-1">
                    <button
                      onClick={() => {
                        setLanguage('en');
                        setShowRoleMenu(false);
                      }}
                      className={`py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                        language === 'en'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('ur');
                        setShowRoleMenu(false);
                      }}
                      className={`py-1 rounded-md text-[11px] font-bold font-urdu transition-colors cursor-pointer ${
                        language === 'ur'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50'
                      }`}
                    >
                      اردو
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('ar');
                        setShowRoleMenu(false);
                      }}
                      className={`py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                        language === 'ar'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50'
                      }`}
                    >
                      العربية
                    </button>
                  </div>

                  {/* Lock App Mobile Security Trigger */}
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      window.dispatchEvent(new CustomEvent('kmf_lock_app'));
                    }}
                    className="w-full text-left rtl:text-right px-3 py-2 text-xs flex items-center justify-between text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === 'ur' ? 'ایپ لاک کریں (سکیورٹی)' : 'Lock App (Security)'}</span>
                    </span>
                  </button>

                  {/* About App / Developer Info Trigger */}
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onOpenAboutModal();
                    }}
                    className="w-full text-left rtl:text-right px-3 py-2 text-xs flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <Info className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.nav.aboutApp}</span>
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      <GoogleDriveRestoreModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
      />
    </header>
  );
};
