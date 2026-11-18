import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileHeart,
  HeartHandshake,
  BarChart3,
  ShieldCheck,
  KeyRound,
  X,
  Globe,
  Info,
  Phone,
  UserCheck,
  ScrollText,
  Sun,
  Moon,
  Bell,
  Lock,
  LogOut,
  CheckCheck,
  UserPlus
} from 'lucide-react';

export type NavTab = 'dashboard' | 'members' | 'contributions' | 'claims' | 'donations' | 'reports' | 'audit' | 'security' | 'rules' | 'accountGuide' | 'membershipRequest';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenAbout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  onOpenAbout
}) => {
  const {
    t,
    language,
    setLanguage,
    claims,
    members,
    userRole,
    setIsLoginModalOpen,
    currentUser,
    isDark,
    toggleDarkMode,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    logout
  } = useApp();

  const [showMobileNotifs, setShowMobileNotifs] = useState(false);
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const pendingClaimsCount = claims.filter(c => c.status === 'under_review' || c.status === 'submitted').length;
  const overdueMembersCount = members.filter(m => m.overdueMonths > 0).length;

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: t.nav.dashboard,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'members' as NavTab,
      label: t.nav.members,
      icon: Users,
      badge: overdueMembersCount > 0 ? `${overdueMembersCount}` : null,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      id: 'contributions' as NavTab,
      label: t.nav.contributions,
      icon: CreditCard,
      badge: null,
    },
    {
      id: 'accountGuide' as NavTab,
      label: t.nav.accountGuide,
      icon: CreditCard,
      badge: null,
    },
    {
      id: 'claims' as NavTab,
      label: t.nav.claims,
      icon: FileHeart,
      badge: pendingClaimsCount > 0 ? `${pendingClaimsCount}` : null,
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    },
    {
      id: 'donations' as NavTab,
      label: t.nav.donations,
      icon: HeartHandshake,
      badge: null,
    },
    {
      id: 'reports' as NavTab,
      label: t.nav.reports,
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'audit' as NavTab,
      label: t.nav.audit,
      icon: ShieldCheck,
      badge: null,
    },
    {
      id: 'security' as NavTab,
      label: t.nav.securitySync,
      icon: KeyRound,
      badge: null,
    },
    {
      id: 'rules' as NavTab,
      label: language === 'ur' ? 'قواعد و ضوابط (دستور)' : language === 'ar' ? 'القواعد واللوائح' : 'Rules & Regulations',
      icon: ScrollText,
      badge: '19',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold',
    },
    {
      id: 'membershipRequest' as NavTab,
      label: language === 'ur' ? 'درخواست برائے رکنیت' : language === 'ar' ? 'طلب العضوية' : 'Membership Application',
      icon: UserPlus,
      badge: 'Join',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold',
    },
  ];

  const visibleNavItems = navItems.filter(item => {
    if (userRole === 'guest') {
      // Strictly disabled "Accounts and Payment guide" for Guest user
      return ['dashboard', 'members', 'contributions', 'donations', 'rules', 'membershipRequest'].includes(item.id);
    }
    if (userRole === 'member') {
      return item.id !== 'audit' && item.id !== 'security';
    }
    return true;
  });

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const content = (
    <div className="h-full flex flex-col justify-between p-4 bg-white/95 dark:bg-emerald-950/90 backdrop-blur-xs border-r border-emerald-100 dark:border-emerald-900/60 transition-colors overflow-y-auto">
      <div className="space-y-1">
        <div className="px-3 py-2 mb-2 flex items-center justify-between md:hidden">
          <span className="font-bold text-sm text-emerald-950 dark:text-emerald-100 font-urdu">
            {t.appName}
          </span>
          <button onClick={onCloseMobile} className="p-1 rounded text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Quick Action Hub (Adjusted from taskbar on mobile to eliminate blank space) */}
        <div className="md:hidden pb-3 mb-2 border-b border-emerald-100 dark:border-emerald-900/60 space-y-2">
          {/* User Status Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/70 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 dark:text-emerald-100 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                    {userRole === 'super_admin' ? 'Admin' : userRole === 'finance_secretary' ? 'Treasurer (خزانچی)' : userRole === 'guest' ? 'Guest (مہمان صارف)' : 'Member (صرف مطالعہ)'}
                  </div>
                </div>
              </div>

              {userRole !== 'guest' ? (
                <button
                  onClick={() => {
                    logout();
                    onCloseMobile();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>{language === 'ur' ? 'لاگ آؤٹ' : 'Logout'}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onCloseMobile();
                    setIsLoginModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                >
                  {language === 'ur' ? 'لاگ ان' : 'Login'}
                </button>
              )}
            </div>
          </div>

          {/* Quick Icons Row (Light Mode, Notification, Screen Lock) */}
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-slate-800 dark:text-emerald-200 font-semibold text-[11px]"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-700" />}
              <span>{isDark ? (language === 'ur' ? 'لائٹ موڈ' : 'Light') : (language === 'ur' ? 'ڈارک موڈ' : 'Dark')}</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => setShowMobileNotifs(!showMobileNotifs)}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-slate-800 dark:text-emerald-200 font-semibold text-[11px]"
            >
              <div className="relative">
                <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                    {unreadNotifsCount}
                  </span>
                )}
              </div>
              <span>{language === 'ur' ? 'نوٹس' : 'Notices'}</span>
            </button>

            {/* Lock Screen */}
            <button
              onClick={() => {
                onCloseMobile();
                window.dispatchEvent(new CustomEvent('kmf_lock_app'));
              }}
              className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-amber-900 dark:text-amber-200 font-semibold text-[11px]"
            >
              <Lock className="w-4 h-4 text-amber-600" />
              <span>{language === 'ur' ? 'ایپ لاک' : 'Lock'}</span>
            </button>
          </div>

          {/* Expandable Mobile Notifications Panel */}
          {showMobileNotifs && (
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-[11px] text-slate-800 dark:text-slate-100 pb-1 border-b border-slate-100 dark:border-slate-800">
                <span>{t.dashboard.urgentNotices}</span>
                {unreadNotifsCount > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[10px] text-emerald-600 font-medium"
                  >
                    {language === 'ur' ? 'سب پڑھ لیں' : 'Mark all read'}
                  </button>
                )}
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <p className="text-center text-slate-400 py-2">No notices</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className="py-1.5 cursor-pointer text-[11px]"
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {language === 'ur' ? n.titleUrdu : n.title}
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        {language === 'ur' ? n.messageUrdu : n.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Menu Navigation Items */}
        <nav className="space-y-1.5">
          {visibleNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/30 font-bold'
                    : 'text-slate-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                  <span className={language === 'ur' ? 'font-urdu' : ''}>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Trilingual Language Switcher in Menu */}
        <div className="pt-3 mt-2 border-t border-emerald-100 dark:border-emerald-900/60">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.common.language} / زبان / اللغة</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-emerald-50/80 dark:bg-emerald-900/40 p-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <button
              onClick={() => setLanguage('en')}
              className={`py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-emerald-300 hover:bg-emerald-100/50'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ur')}
              className={`py-1 rounded-lg text-[11px] font-bold font-urdu transition-all cursor-pointer ${
                language === 'ur'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-emerald-300 hover:bg-emerald-100/50'
              }`}
            >
              اردو
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                language === 'ar'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-emerald-300 hover:bg-emerald-100/50'
              }`}
            >
              العربية
            </button>
          </div>
        </div>

        {/* Member / Role Status Banner */}
        <div className="pt-2">
          <button
            onClick={() => {
              onCloseMobile();
              setIsLoginModalOpen(true);
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800 hover:border-emerald-400 transition-all cursor-pointer text-left rtl:text-right"
          >
            <div className="flex items-center gap-2 truncate">
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800 dark:text-emerald-100 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-emerald-400">
                  {userRole === 'finance_secretary'
                    ? (language === 'ur' ? 'خزانچی (ترمیم مجاز)' : 'Treasurer (Editor)')
                    : userRole === 'super_admin'
                    ? 'Admin (Full)'
                    : (language === 'ur' ? 'ممبر (صرف مطالعہ)' : 'Member (View-Only)')}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 underline shrink-0">
              {language === 'ur' ? 'لاگ ان' : 'Switch'}
            </span>
          </button>
        </div>
      </div>

      {/* Offline Install Button */}
      <div className="pt-2">
        <PWAInstallButton />
      </div>

      {/* Developer & Officer Note in Menu */}
      <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-900/60 space-y-2">
        <button
          onClick={() => {
            onCloseMobile();
            onOpenAbout();
          }}
          className="w-full text-left rtl:text-right p-3.5 rounded-2xl bg-gradient-to-br from-[#004d30] via-[#023b26] to-[#002e1c] border-2 border-emerald-400/50 hover:border-amber-400 shadow-md hover:shadow-lg transition-all cursor-pointer group text-white"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-urdu">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{language === 'ur' ? 'تعارفِ ایپ و ڈویلپر' : 'About this App'}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 group-hover:bg-amber-400 group-hover:text-emerald-950 transition-colors">
              {language === 'ur' ? 'تفصیل' : 'View'}
            </span>
          </div>
          <div className="font-extrabold text-sm text-white tracking-wide truncate">
            Muhammad Iqbal Khattak
          </div>
          <div className="text-xs text-emerald-200 font-semibold truncate mt-0.5">
            {language === 'ur' ? 'خزانچی و ڈویلپر (KMF)' : 'Khazanchi & Developer (KMF)'}
          </div>
          <div className="mt-2.5 pt-2 border-t border-emerald-700/60 text-xs font-mono space-y-1">
            <div className="flex items-center justify-between text-slate-100">
              <span className="text-emerald-300 font-sans font-bold">Call:</span>
              <span className="font-black text-white tracking-wider">0334-9100998</span>
            </div>
            <div className="flex items-center justify-between text-slate-100">
              <span className="text-emerald-300 font-sans font-bold">WhatsApp:</span>
              <span className="font-black text-emerald-300 tracking-wider">0346-9100998</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="no-print hidden md:block w-64 h-[calc(100vh-4rem)] sticky top-16 shrink-0">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-xs flex">
          <div className="w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left">
            {content}
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
};
