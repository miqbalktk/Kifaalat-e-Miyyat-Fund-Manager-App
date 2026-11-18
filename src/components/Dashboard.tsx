import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  Users,
  HandCoins,
  FileHeart,
  TrendingUp,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Settings2,
  Send,
  Eye,
  HeartHandshake,
  DollarSign,
  CreditCard,
  Sparkles,
  Lock
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { MemberPaymentSubmissionModal } from './MemberPaymentSubmissionModal';
import {
  getCurrentYearMonth,
  getContributionInflowBreakdownForMonth
} from '../utils/contributionHelpers';

interface DashboardProps {
  onNavigate: (tab: NavTab) => void;
  onOpenFileClaimModal: () => void;
  onOpenRecordPayModal: () => void;
  onOpenNewMemberModal: () => void;
  onOpenDonateModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenFileClaimModal,
  onOpenRecordPayModal,
  onOpenNewMemberModal,
  onOpenDonateModal,
}) => {
  const {
    t,
    language,
    fundBalance,
    totalCollected,
    totalDisbursed,
    currentMonthInflow,
    monthlyTarget,
    members,
    claims,
    contributions,
    donations,
    widgets,
    setWidgets,
    openReceiptModal,
    sendPaymentReminder,
    userRole,
    isAdminOrKhazanchi
  } = useApp();

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [reminderToast, setReminderToast] = useState<string | null>(null);
  const [isPaymentSubmissionOpen, setIsPaymentSubmissionOpen] = useState(false);

  // All-time contributions summary per member for guest & public view
  const memberContributionSummary = members.map(m => {
    const memContribs = contributions.filter(c => c.memberId === m.id);
    const totalPaid = memContribs.reduce((sum, c) => sum + (c.amount || 0), 0);
    return {
      member: m,
      totalPaid,
      monthsPaid: memContribs.length
    };
  });

  const activeMembersCount = members.filter(m => m.status === 'active' || m.status === 'grace_period').length;
  const pendingClaims = claims.filter(c => c.status === 'under_review' || c.status === 'submitted');
  const overdueMembers = members.filter(m => m.overdueMonths > 0);
  const complianceRate = Math.round((currentMonthInflow / (activeMembersCount * 300 || 1)) * 100);

  // Dynamic Kafan Sponsorship Goal (Strictly as per entries made, starts from zero)
  const kafanTarget = 300000;
  const kafanRaised = donations
    .filter(d => d.category === 'kafan_burial_sponsorship' || d.category === 'underprivileged_aid')
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  const kafanPercent = Math.min(100, Math.round((kafanRaised / (kafanTarget || 1)) * 100));

  // Charity Fund & Monthly Inflow Breakdown Calculations (Strictly starts from zero and reflects recorded entries)
  const currentMonthKey = getCurrentYearMonth();
  let regularInflowThisMonth = 0;
  let advanceInflowThisMonth = 0;
  contributions.forEach(c => {
    const mem = members.find(m => m.id === c.memberId);
    const rate = mem?.monthlyPledgeAmount && mem.monthlyPledgeAmount > 0 ? mem.monthlyPledgeAmount : 300;
    const { regular, advance } = getContributionInflowBreakdownForMonth(c, currentMonthKey, rate);
    regularInflowThisMonth += regular;
    advanceInflowThisMonth += advance;
  });
  const thisMonthCharity = donations
    .filter(d => d.date && d.date.startsWith(currentMonthKey))
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  const overallCharityFund = donations
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const handleReminder = (memberId: string, memberName: string) => {
    sendPaymentReminder(memberId);
    setReminderToast(`${t.members.reminderSent} (${memberName})`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  const isWidgetVisible = (id: string) => {
    const w = widgets.find(item => item.id === id);
    return w ? w.visible : true;
  };

  const toggleWidget = (id: string) => {
    setWidgets(
      widgets.map(w => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Reminder Alert */}
      {reminderToast && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Top Welcome & Customization Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-6 text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-medium mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'امانت، دیانت، اور مکمل شفافیت' : 'Community Trust & Mutual Assistance'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-urdu">
            {t.appName}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl">
            {language === 'ur'
              ? 'کسی بھی معزز رکن یا ان کے اہل خانہ کے انتقال پر فوری تدفین اخراجات، کفن پیکج، اور پسماندگان تعزیتی امداد کی بلاتاخیر فراہمی۔'
              : 'Immediate financial consolation, shroud kits, and bereavement grants disbursed to member families upon the loss of loved ones.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{t.dashboard.customizeDashboard}</span>
          </button>
        </div>
      </div>

      {/* Customize Drawer Modal */}
      {isCustomizing && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              {t.dashboard.customizeDashboard}
            </h4>
            <button
              onClick={() => setIsCustomizing(false)}
              className="text-xs text-emerald-600 font-semibold"
            >
              {t.common.close}
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-3">{t.dashboard.customizeDesc}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {widgets.map(w => (
              <label
                key={w.id}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={w.visible}
                  onChange={() => toggleWidget(w.id)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {language === 'ur' ? w.labelUrdu : w.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Grid - Exact Layout Required by User (6 Cards):
          1: Total fund reserve
          2: Overall charity fund
          3: Current month in flow (in terms of monthly contribution)
          4: Total Charity this month
          5: Bereavement Aid Disbursed
          6: Enrolled Members
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Total Fund Reserve */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-urdu">
              {language === 'ur' ? '1: کل محفوظ فنڈ سرمایہ (Total Fund Reserve)' : '1: Total Fund Reserve'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[#004d30] dark:text-emerald-300 font-mono">
              {t.common.currency} {fundBalance.toLocaleString()}
            </span>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                {fundBalance > 0
                  ? (language === 'ur' ? 'محفوظ سرمایہ برائے تجہیز و تکفین' : 'Available Reserve Balance')
                  : (language === 'ur' ? 'صفر سے شروع' : 'Zero base reserve')}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Overall Charity Fund */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 font-urdu">
              {language === 'ur' ? '2: مجموعی فنڈ عطیات و زکوٰۃ (Overall Charity Fund)' : '2: Overall Charity Fund'}
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 font-mono">
              {t.common.currency} {overallCharityFund.toLocaleString()}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                {overallCharityFund > 0
                  ? `${donations.length} ${language === 'ur' ? 'درج شدہ عطیات' : 'recorded charity entries'}`
                  : (language === 'ur' ? 'صفر سے شروع (اندراج کے مطابق)' : 'Starts from zero')}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Current Month Inflow (Monthly Contribution) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-urdu">
              {language === 'ur' ? '3: رواں ماہ وصولی اقساط (Current Month Inflow)' : '3: Current Month Inflow'}
            </span>
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-teal-700 dark:text-teal-300 font-mono">
              {t.common.currency} {currentMonthInflow.toLocaleString()}
            </span>
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>{language === 'ur' ? `ہدف (${currentMonthKey})` : `Target (${currentMonthKey})`}</span>
                <span>{Math.round((currentMonthInflow / (monthlyTarget || 1)) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentMonthInflow / (monthlyTarget || 1)) * 100)}%` }}
                />
              </div>
              <div className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-1">
                <span>
                  {language === 'ur'
                    ? `ماہانہ اقساط: Rs. ${regularInflowThisMonth.toLocaleString()}`
                    : `Regular (${currentMonthKey}): Rs. ${regularInflowThisMonth.toLocaleString()}`}
                </span>
                {advanceInflowThisMonth > 0 && (
                  <span className="font-mono font-semibold text-teal-700 dark:text-teal-400">
                    {language === 'ur'
                      ? `پیشگی اقساط: Rs. ${advanceInflowThisMonth.toLocaleString()}`
                      : `Advances: Rs. ${advanceInflowThisMonth.toLocaleString()}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Total Charity This Month */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-emerald-500/40 dark:border-emerald-700/60 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 font-urdu">
              {language === 'ur' ? '4: اس ماہ کے کل عطیات (Total Charity This Month)' : '4: Total Charity This Month'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
              {t.common.currency} {thisMonthCharity.toLocaleString()}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {thisMonthCharity > 0
                  ? (language === 'ur' ? 'موصول شدہ عطیات' : 'Received this month')
                  : (language === 'ur' ? 'کوئی عطیہ درج نہیں ہوا (0 روپے)' : 'No charity entry this month')}
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Bereavement Aid Disbursed */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-urdu">
              {language === 'ur' ? '5: کفالت و تدفین ادائیگیاں (Bereavement Aid Disbursed)' : '5: Bereavement Aid Disbursed'}
            </span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400">
              <FileHeart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 font-mono">
              {t.common.currency} {totalDisbursed.toLocaleString()}
            </span>
            <p className="mt-1 text-[11px] text-slate-500">
              {claims.filter(c => c.status === 'disbursed').length} {language === 'ur' ? 'پسماندگان خاندانوں کی کفالت و تدفین' : 'families consoled & aided'}
            </p>
          </div>
        </div>

        {/* Card 6: Enrolled Members */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-urdu">
              {language === 'ur' ? '6: رجسٹرڈ اراکین (Enrolled Members)' : '6: Enrolled Members'}
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {activeMembersCount}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>{language === 'ur' ? 'کل 39 ممبران (ماہانہ 300 روپے فی فرد)' : '39 Registered Members (Rs. 300/mo)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Notices & Pending Claims Alert */}
      {isWidgetVisible('pending_claims') && pendingClaims.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-xl text-rose-700 dark:text-rose-300 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">
                  {t.dashboard.pendingClaims}: {pendingClaims.length} {language === 'ur' ? 'کلیمز جائزہ کے منتظر' : 'Claims Waiting Review'}
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                  {language === 'ur'
                    ? 'پسماندگان کو بروقت تجہیز و تکفین گرانٹ کی ترسیل کے لیے فوری توثیق فرمائیں۔'
                    : 'Prompt verification ensures bereaved member families receive funeral and condolence aid immediately.'}
                </p>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {pendingClaims.map(c => (
                    <div
                      key={c.id}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-2"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {c.claimNumber}: {c.deceasedName} ({c.deceasedRelation})
                      </span>
                      <span className="font-bold text-emerald-600">
                        Rs. {c.requestedAmount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('claims')}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
            >
              {language === 'ur' ? 'کلیمز کا جائزہ لیں' : 'Review Claims'}
            </button>
          </div>
        </div>
      )}

      {/* Overdue Members Alert */}
      {isWidgetVisible('overdue_members') && overdueMembers.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-xl text-amber-700 dark:text-amber-300">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                  {t.dashboard.overdueAlert} ({overdueMembers.length})
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  {language === 'ur'
                    ? 'رواں ماہ کی فیس کی آخری تاریخ گزر چکی ہے۔ خودکار واٹس ایپ یاد دہانی بھیجیں۔'
                    : 'Grace period nearing expiration. Dispatch automated payment reminders to ensure continuous bereavement coverage.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {overdueMembers.slice(0, 2).map(m => (
                <button
                  key={m.id}
                  onClick={() => handleReminder(m.id, m.fullName)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Send reminder"
                >
                  <Send className="w-3 h-3" />
                  <span>{m.fullName.split(' ')[0]}</span>
                </button>
              ))}
              <button
                onClick={() => onNavigate('contributions')}
                className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
              >
                {language === 'ur' ? 'سب دیکھیں' : 'View All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Buttons Grid */}
      {isWidgetVisible('quick_actions') && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isAdminOrKhazanchi ? (
            <>
              <button
                onClick={onOpenFileClaimModal}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs flex flex-col items-center text-center gap-2 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileHeart className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-urdu">
                  {t.dashboard.fileDeathClaim}
                </span>
              </button>

              <button
                onClick={onOpenRecordPayModal}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs flex flex-col items-center text-center gap-2 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HandCoins className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-urdu">
                  {t.dashboard.recordContribution}
                </span>
              </button>

              <button
                onClick={onOpenNewMemberModal}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs flex flex-col items-center text-center gap-2 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-urdu">
                  {t.dashboard.newMember}
                </span>
              </button>

              <button
                onClick={onOpenDonateModal}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs flex flex-col items-center text-center gap-2 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-urdu">
                  {t.dashboard.makeDonation}
                </span>
              </button>
            </>
          ) : userRole === 'guest' ? (
            // For Guest: Strictly removed "Submit Paid Receipt" and "How to Pay"!
            <>
              <button
                onClick={() => onNavigate('membershipRequest')}
                className="p-4 rounded-2xl bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-900 border-2 border-amber-400 dark:border-amber-700 hover:border-amber-500 shadow-xs flex flex-col items-center text-center gap-2 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200 font-urdu">
                  {language === 'ur' ? 'درخواست برائے رکنیت (شمولیت)' : 'Apply for Membership'}
                </span>
              </button>

              <button
                onClick={() => onNavigate('rules')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-xs flex flex-col items-center text-center gap-2 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-urdu">
                  {language === 'ur' ? 'قواعد و ضوابط (دستور)' : 'Rules & Regulations'}
                </span>
              </button>
            </>
          ) : (
            // For Member: Enabled "Submit Contribution Paid Details" button + Disabled admin buttons
            <>
              <button
                onClick={() => setIsPaymentSubmissionOpen(true)}
                className="p-4 rounded-2xl bg-gradient-to-b from-emerald-600 to-[#004d30] text-white border-2 border-emerald-400 shadow-md flex flex-col items-center text-center gap-2 transition-all group cursor-pointer hover:shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Send className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold font-urdu">
                  {language === 'ur' ? 'ادائیگی تفصیلات خزانچی کو بھیجیں' : 'Submit Paid Details to Khazanchi'}
                </span>
              </button>

              <button
                onClick={() => onNavigate('rules')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-xs flex flex-col items-center text-center gap-2 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-urdu">
                  {language === 'ur' ? 'قواعد و ضوابط (دستور)' : 'Rules & Regulations'}
                </span>
              </button>

              {/* Disabled Admin Actions for regular members */}
              <button
                disabled
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed flex flex-col items-center text-center gap-2"
                title="Only Khazanchi/Admin can file claim"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center relative">
                  <FileHeart className="w-5 h-5" />
                  <Lock className="w-3 h-3 absolute -top-1 -right-1 text-slate-500" />
                </div>
                <span className="text-[11px] font-medium text-slate-500 font-urdu">
                  {t.dashboard.fileDeathClaim} (خزانچی صرف)
                </span>
              </button>

              <button
                disabled
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed flex flex-col items-center text-center gap-2"
                title="Only Khazanchi/Admin can record official contribution"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center relative">
                  <HandCoins className="w-5 h-5" />
                  <Lock className="w-3 h-3 absolute -top-1 -right-1 text-slate-500" />
                </div>
                <span className="text-[11px] font-medium text-slate-500 font-urdu">
                  {t.dashboard.recordContribution} (خزانچی صرف)
                </span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Guest Welcome Banner & Quick Action (When logged in as guest) */}
      {userRole === 'guest' && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-[#003d26] text-white border-2 border-emerald-400/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-[11px] font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'مہمان صارف پورٹل وزٹ' : 'Guest Portal Access'}</span>
            </div>
            <h4 className="text-base font-bold font-urdu">
              {language === 'ur' ? 'کفالتِ میت فنڈ میں شمولیت اور قواعد کا مطالعہ' : 'Join Kifaalat-e-Miyyat Fund Society'}
            </h4>
            <p className="text-xs text-emerald-100/80 mt-0.5 max-w-xl">
              {language === 'ur'
                ? 'تمام اراکین کے نام، کل ادا شدہ اقساط اور صدقات کا شفاف ریکارڈ درج ذیل ہے۔ فنڈ میں شمولیت کے لیے واٹس ایپ درخواست فارم پُر فرمائیں۔'
                : 'Members and total contributions paid are displayed below. To join, submit the membership form.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('membershipRequest')}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>{language === 'ur' ? 'شمولیت فارم پُر کریں' : 'Join Society'}</span>
            </button>
            <button
              onClick={() => onNavigate('rules')}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold cursor-pointer"
            >
              {language === 'ur' ? 'قواعد و ضوابط' : 'Rules & Regulations'}
            </button>
          </div>
        </div>
      )}

      {/* Live Financial Ledger (Full Width, Transparent Community Record without Sadqaat Hadaf) */}
      {isWidgetVisible('recent_ledger') && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 font-urdu">
                {language === 'ur' ? 'شفاف عوامی کھاتہ و مالیاتی ریکارڈ' : 'Public Transparent Financial Ledger'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ur'
                  ? 'تمام اراکین کے نام، ادا شدہ اقساط، اور صدقات و عطیات کی تفصیلات'
                  : 'Names and contributions made by all members, plus sadqa & donations record'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('contributions')}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
              >
                {language === 'ur' ? 'تمام اقساط دیکھیں' : 'All Contributions'}
              </button>
              <button
                onClick={() => onNavigate('donations')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 text-xs font-bold transition-colors cursor-pointer"
              >
                {language === 'ur' ? 'تمام صدقات دیکھیں' : 'All Sadqas'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Member Contributions List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#004d30] dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>{language === 'ur' ? 'اراکین اور ان کی ادا شدہ اقساط' : 'Members & Contributions Made'}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {contributions.length} {language === 'ur' ? 'ادائیگیاں' : 'paid'}
                </span>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs max-h-96 overflow-y-auto">
                {userRole === 'guest' ? (
                  // For Guest: Show payments made by each member so guests see member total contributions and are encouraged to register
                  memberContributionSummary.map(({ member, totalPaid, monthsPaid }) => (
                    <div key={member.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{language === 'ur' && member.fullNameUrdu ? member.fullNameUrdu : member.fullName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold font-mono">
                            {member.membershipNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-urdu">
                          <span>{member.address}</span>
                          <span>•</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{monthsPaid} {language === 'ur' ? 'اقساط ادا شدہ' : 'months paid'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-[#004d30] dark:text-emerald-300 font-mono">
                          Rs. {totalPaid.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-emerald-600 font-bold">
                          {language === 'ur' ? 'کل ادا شدہ تعاون' : 'Total Contributed'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : contributions.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    {language === 'ur' ? 'ابھی کوئی ادا شدہ قسط درج نہیں ہے' : 'No contribution records entered yet'}
                  </div>
                ) : (
                  contributions.slice(0, 6).map(c => (
                    <div key={c.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {c.memberName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{c.receiptNumber}</span>
                          <span>•</span>
                          <span>{c.month}</span>
                          <span>•</span>
                          <span>{c.paidDate}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-[#004d30] dark:text-emerald-300 font-mono">
                          Rs. {c.amount.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-emerald-600 font-semibold uppercase">
                          {c.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Sadqa & Donations Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4" />
                  <span>{language === 'ur' ? 'صدقات و عطیات دہندگان' : 'Sadqa Donors & Amounts'}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {donations.length} {language === 'ur' ? 'عطیات' : 'donations'}
                </span>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {donations.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    {language === 'ur' ? 'ابھی کوئی صدقہ یا عطیہ درج نہیں ہے' : 'No donations recorded yet'}
                  </div>
                ) : (
                  donations.slice(0, 6).map(d => (
                    <div key={d.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {d.donorName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-emerald-600">{d.receiptNumber}</span>
                          <span>•</span>
                          <span>{t.categories[d.category as keyof typeof t.categories] || d.category}</span>
                          <span>•</span>
                          <span>{d.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-emerald-700 dark:text-emerald-400 font-mono">
                          Rs. {d.amount.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-amber-600 font-semibold">
                          {language === 'ur' ? 'صدقہ جاریہ' : 'Sadqah'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Payment Details Submission Modal */}
      <MemberPaymentSubmissionModal
        isOpen={isPaymentSubmissionOpen}
        onClose={() => setIsPaymentSubmissionOpen(false)}
      />
    </div>
  );
};
