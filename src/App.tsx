/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MembersView } from './components/MembersView';
import { ContributionsView } from './components/ContributionsView';
import { BereavementClaimsView } from './components/BereavementClaimsView';
import { DonationsView } from './components/DonationsView';
import { ReportsView } from './components/ReportsView';
import { AuditLogsView } from './components/AuditLogsView';
import { SecuritySyncView } from './components/SecuritySyncView';
import { RulesRegulationsView } from './components/RulesRegulationsView';
import { TermsAgreementModal } from './components/TermsAgreementModal';
import { ReceiptModal } from './components/ReceiptModal';
import { NewClaimModal } from './components/NewClaimModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { NewMemberModal } from './components/NewMemberModal';
import { DonateModal } from './components/DonateModal';
import { AboutModal } from './components/AboutModal';
import { PaymentAccountGuideView } from './components/PaymentAccountGuideView';
import { MembershipRequestForm } from './components/MembershipRequestForm';
import { LoginModal } from './components/LoginModal';
import { AppLockBarrier } from './components/AppLockBarrier';
import { MemberCredentialsModal } from './components/MemberCredentialsModal';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileHeart,
  HeartHandshake,
  UserPlus
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { requireTermsModal, acceptTerms, isLoginModalOpen, setIsLoginModalOpen, userRole, language } = useApp();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal triggers
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isRecordPayModalOpen, setIsRecordPayModalOpen] = useState(false);
  const [defaultPayMemberId, setDefaultPayMemberId] = useState<string | undefined>(undefined);
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [defaultCredentialMemberId, setDefaultCredentialMemberId] = useState<string | undefined>(undefined);

  const handleOpenRecordPay = (memberId?: string) => {
    setDefaultPayMemberId(memberId);
    setIsRecordPayModalOpen(true);
  };

  const handleOpenCredentialsModal = (memberId?: string) => {
    setDefaultCredentialMemberId(memberId);
    setIsCredentialsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 dark:bg-emerald-950/70 text-slate-900 dark:text-emerald-50 flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Main App Content View (isolated and hidden during receipt printing) */}
      <div id="app-main-view" className="flex flex-col flex-1">
        {/* Top Fixed Navigation */}
        <Navbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenDonateModal={() => setIsDonateModalOpen(true)}
          onOpenAboutModal={() => setIsAboutModalOpen(true)}
        />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Responsive Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenAbout={() => setIsAboutModalOpen(true)}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-hidden pb-20 md:pb-8">
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigate={setCurrentTab}
              onOpenFileClaimModal={() => setIsClaimModalOpen(true)}
              onOpenRecordPayModal={() => handleOpenRecordPay()}
              onOpenNewMemberModal={() => setIsNewMemberModalOpen(true)}
              onOpenDonateModal={() => setIsDonateModalOpen(true)}
            />
          )}

          {currentTab === 'members' && (
            <MembersView
              onOpenNewMemberModal={() => setIsNewMemberModalOpen(true)}
              onOpenRecordPayModal={handleOpenRecordPay}
              onOpenCredentialsModal={handleOpenCredentialsModal}
            />
          )}

          {currentTab === 'contributions' && (
            <ContributionsView
              onOpenRecordPayModal={handleOpenRecordPay}
            />
          )}

          {currentTab === 'claims' && (
            <BereavementClaimsView
              onOpenFileClaimModal={() => setIsClaimModalOpen(true)}
            />
          )}

          {currentTab === 'donations' && (
            <DonationsView
              onOpenDonateModal={() => setIsDonateModalOpen(true)}
            />
          )}

          {currentTab === 'reports' && <ReportsView />}

          {currentTab === 'audit' && <AuditLogsView />}

          {currentTab === 'security' && <SecuritySyncView />}

          {currentTab === 'rules' && <RulesRegulationsView />}

          {currentTab === 'accountGuide' && (
            userRole !== 'guest' ? (
              <PaymentAccountGuideView />
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="font-bold text-lg font-urdu text-amber-900 dark:text-amber-200">
                  {language === 'ur' ? 'یہ صفحہ صرف باضابطہ اراکین کے لیے دستیاب ہے' : 'This section is restricted to registered members'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {language === 'ur'
                    ? 'مہمان صارفین فنڈ کے قواعد و ضوابط اور شمولیت کا فارم ملاحظہ فرما سکتے ہیں۔'
                    : 'Guest users can explore the society constitution & rules or apply for membership.'}
                </p>
                <button
                  onClick={() => setCurrentTab('rules')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  {language === 'ur' ? 'قواعد و ضوابط دیکھیں' : 'View Rules'}
                </button>
              </div>
            )
          )}

          {currentTab === 'membershipRequest' && (
            <MembershipRequestForm onOpenRules={() => setCurrentTab('rules')} />
          )}
        </main>
      </div>

      {/* Mobile Sticky Quick Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold cursor-pointer ${
            currentTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>{language === 'ur' ? 'ڈیش بورڈ' : 'Dashboard'}</span>
        </button>

        <button
          onClick={() => setCurrentTab('members')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold cursor-pointer ${
            currentTab === 'members' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>{language === 'ur' ? 'اراکین' : 'Members'}</span>
        </button>

        <button
          onClick={() => setCurrentTab('contributions')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold cursor-pointer ${
            currentTab === 'contributions' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>{language === 'ur' ? 'اقساط' : 'Dues'}</span>
        </button>

        {userRole === 'super_admin' || userRole === 'finance_secretary' ? (
          <>
            <button
              onClick={() => setCurrentTab('claims')}
              className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold cursor-pointer ${
                currentTab === 'claims' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'
              }`}
            >
              <FileHeart className="w-5 h-5" />
              <span>{language === 'ur' ? 'کلیمز' : 'Claims'}</span>
            </button>

            <button
              onClick={() => setIsDonateModalOpen(true)}
              className="flex flex-col items-center gap-1 p-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer"
            >
              <HeartHandshake className="w-5 h-5" />
              <span>{language === 'ur' ? 'عطیہ' : 'Donate'}</span>
            </button>
          </>
        ) : userRole === 'guest' ? (
          <>
            <button
              onClick={() => setCurrentTab('rules')}
              className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold cursor-pointer ${
                currentTab === 'rules' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'
              }`}
            >
              <Users className="w-5 h-5 text-emerald-600" />
              <span>{language === 'ur' ? 'دستور و قواعد' : 'Rules'}</span>
            </button>

            <button
              onClick={() => setCurrentTab('membershipRequest')}
              className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold cursor-pointer ${
                currentTab === 'membershipRequest' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              <span>{language === 'ur' ? 'رکنیت فارم' : 'Join'}</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setCurrentTab('accountGuide')}
              className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold cursor-pointer ${
                currentTab === 'accountGuide' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'
              }`}
            >
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>{language === 'ur' ? 'طریقہ ادائیگی' : 'Pay 300'}</span>
            </button>

            <button
              onClick={() => setCurrentTab('membershipRequest')}
              className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold cursor-pointer ${
                currentTab === 'membershipRequest' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              <span>{language === 'ur' ? 'رکنیت فارم' : 'Join'}</span>
            </button>
          </>
        )}
      </div>
      </div>

      {/* Modals */}
      <ReceiptModal />
      
      <NewClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
      />

      <RecordPaymentModal
        isOpen={isRecordPayModalOpen}
        onClose={() => {
          setIsRecordPayModalOpen(false);
          setDefaultPayMemberId(undefined);
        }}
        defaultMemberId={defaultPayMemberId}
      />

      <NewMemberModal
        isOpen={isNewMemberModalOpen}
        onClose={() => setIsNewMemberModalOpen(false)}
      />

      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <MemberCredentialsModal
        isOpen={isCredentialsModalOpen}
        onClose={() => {
          setIsCredentialsModalOpen(false);
          setDefaultCredentialMemberId(undefined);
        }}
        defaultMemberId={defaultCredentialMemberId}
      />

      <TermsAgreementModal
        isOpen={requireTermsModal}
        onAccept={acceptTerms}
      />
    </div>
  );
};

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('AppErrorBoundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-emerald-950 text-white text-center">
          <div className="max-w-md p-6 bg-slate-900 rounded-3xl border-2 border-emerald-500 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold font-urdu text-amber-300">کفالتِ میت فنڈ ویلفیئر سوسائٹی</h2>
            <p className="text-xs text-slate-300">
              عارضی ڈسپلے کا مسئلہ پیش آیا ہے۔ دوبارہ لوڈ کرنے کے لیے نیچے بٹن پر کلک فرمائیں۔
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              ایپ ریفریش کریں (Reload Application)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppProvider>
        <AppLockBarrier>
          <AppContent />
        </AppLockBarrier>
      </AppProvider>
    </AppErrorBoundary>
  );
}
