import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Contribution } from '../types';
import { AdminDeleteModal } from './AdminDeleteModal';
import { getCurrentYearMonth, doesContributionCoverMonth } from '../utils/contributionHelpers';
import {
  CreditCard,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  Mail,
  Send,
  Calendar,
  AlertCircle,
  Building2,
  MessageCircle,
  Phone,
  Copy,
  UserCheck,
  AlertTriangle,
  Trash2
} from 'lucide-react';

interface ContributionsViewProps {
  onOpenRecordPayModal: (memberId?: string) => void;
}

export const ContributionsView: React.FC<ContributionsViewProps> = ({
  onOpenRecordPayModal
}) => {
  const { contributions, members, language, t, openReceiptModal, sendPaymentReminder, isAdminOrKhazanchi, currentUser, userRole } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [batchReminderSent, setBatchReminderSent] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contributionToDelete, setContributionToDelete] = useState<Contribution | null>(null);

  // Reference dynamic current month
  const currentMonth = getCurrentYearMonth();

  // Group members into Paid, Pending, Overdue for current month (including multi-month advance contributions)
  const currentMonthPaidMemberIds = new Set(
    contributions
      .filter(c => {
        const mem = members.find(m => m.id === c.memberId);
        const rate = mem?.monthlyPledgeAmount && mem.monthlyPledgeAmount > 0 ? mem.monthlyPledgeAmount : 300;
        return doesContributionCoverMonth(c, currentMonth, rate);
      })
      .map(c => c.memberId)
  );

  // 1. Paid Only: members whose payment for current month is done
  const paidMembers = members.filter(m => currentMonthPaidMemberIds.has(m.id));

  // 2. Pending only: members whose payment of current month is STILL NOT entered in app
  const pendingMembers = members.filter(m => !currentMonthPaidMemberIds.has(m.id));

  // 3. Overdue only: members who have not paid current month contribution till 10th of current month
  // (Deadline is 10th of each month; all unpaid or overdueMonths > 0)
  const overdueMembers = members.filter(m => {
    const isUnpaidThisMonth = !currentMonthPaidMemberIds.has(m.id);
    return isUnpaidThisMonth && (m.overdueMonths > 0 || new Date().getDate() >= 10);
  });

  const filteredContributions = contributions.filter(c => {
    return (
      c.memberName.toLowerCase().includes(search.toLowerCase()) ||
      c.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.month.includes(search)
    );
  });

  // Calculate overdue count for batch reminder
  const overdueCount = overdueMembers.length;

  const handleBatchReminder = () => {
    overdueMembers.forEach(m => {
      sendPaymentReminder(m.id);
    });
    setBatchReminderSent(true);
    setTimeout(() => setBatchReminderSent(false), 3500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {batchReminderSent && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 bg-[#004d30] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>
            {language === 'ur'
              ? 'تمام واجب الادا اراکین کو واٹس ایپ و ایس ایم ایس یاد دہانی ارسال کر دی گئی!'
              : 'Automated payment deadline notifications dispatched to all overdue members!'}
          </span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-urdu">
            {t.contributions.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ur'
              ? `ماہانہ اقساط فنڈ (موجودہ مہینہ: ${currentMonth}) | کل 39 اراکین، فیس 300 روپے فی کس`
              : t.contributions.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdminOrKhazanchi && overdueCount > 0 && (
            <button
              onClick={handleBatchReminder}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? `تمام بقایا جات یاد دہانی (${overdueCount})` : `Remind All Overdue (${overdueCount})`}</span>
            </button>
          )}

          {isAdminOrKhazanchi ? (
            <button
              onClick={() => onOpenRecordPayModal()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.contributions.recordNewPayment}</span>
            </button>
          ) : (
            <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-amber-900 dark:text-amber-200">
              {t.contributions.viewOnlyBadge}
            </div>
          )}
        </div>
      </div>

      {/* Official HBL Account Quick Card for Payments */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-[#eef7f0] dark:from-emerald-950/70 dark:via-teal-950/40 dark:to-emerald-900/40 border-2 border-emerald-500/40 dark:border-emerald-700 shadow-xs text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#004d30] text-amber-300 font-black flex items-center justify-center shrink-0 shadow-sm border border-emerald-400/40">
            <Building2 className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-[#004d30] dark:text-emerald-200 text-sm">
                Habib Bank Limited (HBL)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#004d30] text-amber-300">
                Official Account
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700 dark:text-slate-200">
              <span><strong>Title:</strong> Muhammad Iqbal</span>
              <span><strong>Acc No:</strong> <code className="font-mono font-bold text-[#004d30] dark:text-amber-300 text-xs">11815901035603</code></span>
              <span><strong>IBAN:</strong> <code className="font-mono text-[11px] text-slate-800 dark:text-slate-300">PK49HABB0011815901035603</code></span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-emerald-300/80 font-medium mt-1 font-urdu">
              {language === 'ur'
                ? 'رقم صرف حبیب بینک، آن لائن بینکنگ، راست یا HBL ایپ کے ذریعے منتقل کر کے رسید واٹس ایپ پر ارسال فرمائیں۔'
                : 'Transfer via HBL Mobile App, 1Link IBAN or Raast and dispatch screenshot to Treasurer on WhatsApp.'}
            </div>
          </div>
        </div>

        {userRole !== 'guest' && currentUser.role !== 'guest' && (
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <a
              href="https://wa.me/923469100998?text=السلام%20علیکم،%20میں%20نے%20کفالتِ%20میت%20فنڈ%20کی%20ماہانہ%20قسط%20ادا%20کر%20دی%20ہے،%20رسید%20منسلک%20ہے۔"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform hover:scale-102 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp (0346-9100998)</span>
            </a>
            <a
              href="tel:03349100998"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>0334</span>
            </a>
          </div>
        )}
      </div>

      {/* Deadline Notice Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-4 rounded-xl flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
        <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="flex-1">
          <span className="font-bold">
            {language === 'ur'
              ? 'اہم ہدایت: ہر ماہ کی 10 تاریخ تک ماہانہ قسط (300 روپے) جمع کروانا لازمی ہے۔ 10 تاریخ کے بعد رکن کا نام Overdue لسٹ میں شامل ہو جاتا ہے۔'
              : 'Official Rule: Monthly contribution (PKR 300) must be cleared by the 10th of every month. Unpaid accounts past the 10th are marked Overdue.'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={language === 'ur' ? 'رکن کا نام، رسید نمبر یا فون تلاش کریں...' : t.members.searchPlaceholder}
            className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-emerald-500 font-urdu"
          />
        </div>

        {/* Dropdown with exact required options */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 hidden sm:inline">
            {language === 'ur' ? 'فلٹر لسٹ:' : 'Filter:'}
          </label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500/40 dark:border-emerald-700 text-xs text-slate-800 dark:text-slate-200 font-bold cursor-pointer focus:outline-emerald-600"
          >
            <option value="all">
              {language === 'ur' ? `تمام اراکین (${members.length})` : `All Members (${members.length})`}
            </option>
            <option value="paid">
              {language === 'ur'
                ? `Paid Only (${paidMembers.length}) - موجودہ ماہ فیس ادا شدہ اراکین`
                : `Paid Only (${paidMembers.length}) - Current Month Paid`}
            </option>
            <option value="pending">
              {language === 'ur'
                ? `Pending only (${pendingMembers.length}) - موجودہ ماہ فیس تاحال غیر درج شدہ اراکین`
                : `Pending only (${pendingMembers.length}) - Current Month Not Entered in App`}
            </option>
            <option value="overdue">
              {language === 'ur'
                ? `Overdue only (${overdueMembers.length}) - 10 تاریخ تک غیر ادا شدہ اراکین`
                : `Overdue only (${overdueMembers.length}) - Unpaid Till 10th of Current Month`}
            </option>
          </select>
        </div>
      </div>

      {/* Filter Info Pill Banner */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          {language === 'ur' ? 'منتخب لسٹ:' : 'Current Filter:'}
        </span>
        {statusFilter === 'paid' && (
          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
            ✓ Paid Only ({paidMembers.length}): {language === 'ur' ? 'موجودہ ماہ کی ادائیگی مکمل کرنے والے اراکین کے نام' : 'Members whose payment for current month contribution is done'}
          </span>
        )}
        {statusFilter === 'pending' && (
          <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
            ⏳ Pending only ({pendingMembers.length}): {language === 'ur' ? 'وہ تمام اراکین جن کی موجودہ ماہ کی ادائیگی تاحال ایپ میں درج نہیں ہوئی' : 'Members whose payment of current month is still not entered in app'}
          </span>
        )}
        {statusFilter === 'overdue' && (
          <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-800">
            ⚠️ Overdue only ({overdueMembers.length}): {language === 'ur' ? 'وہ تمام اراکین جنہوں نے موجودہ ماہ 10 تاریخ تک قسط جمع نہیں کروائی' : 'Members who have not paid current month contribution till 10th of the current month'}
          </span>
        )}
        {statusFilter === 'all' && (
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
            All Records: {language === 'ur' ? 'تمام 39 اراکین اور مالیاتی ریکارڈ' : 'All 39 Society Members & Ledger'}
          </span>
        )}
      </div>

      {/* Main Table: Displaying Selected List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="px-4 py-3.5">{language === 'ur' ? 'ممبر شپ نمبر' : 'Membership #'}</th>
                <th className="px-4 py-3.5">{language === 'ur' ? 'رکن کا نام' : 'Member Name'}</th>
                <th className="px-4 py-3.5">{language === 'ur' ? 'گاؤں / علاقہ' : 'Village / Location'}</th>
                <th className="px-4 py-3.5">{language === 'ur' ? 'رابطہ نمبر' : 'Phone'}</th>
                <th className="px-4 py-3.5">{language === 'ur' ? 'مہینہ' : 'Month'}</th>
                <th className="px-4 py-3.5">{language === 'ur' ? 'رقم' : 'Amount'}</th>
                <th className="px-4 py-3.5">{language === 'ur' ? 'حالت' : 'Status'}</th>
                <th className="px-4 py-3.5 text-right rtl:text-left">{language === 'ur' ? 'اقدامات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* If Paid Only Selected */}
              {statusFilter === 'paid' && (
                paidMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      {language === 'ur' ? 'موجودہ ماہ کی کوئی ادائیگی درج نہیں ہوئی۔' : 'No payments entered for current month yet.'}
                    </td>
                  </tr>
                ) : (
                  paidMembers
                    .filter(m =>
                      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
                      (m.fullNameUrdu && m.fullNameUrdu.includes(search)) ||
                      m.membershipNumber.toLowerCase().includes(search.toLowerCase()) ||
                      m.phone.includes(search)
                    )
                    .map(m => {
                      const contributionRecord = contributions.find(
                        c => c.memberId === m.id && doesContributionCoverMonth(c, currentMonth)
                      );
                      return (
                        <tr key={m.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {m.membershipNumber}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                            <div>{m.fullName}</div>
                            {m.fullNameUrdu && <div className="text-[11px] text-slate-500 font-urdu">{m.fullNameUrdu}</div>}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                            {language === 'ur' ? (m.addressUrdu || m.address) : m.address}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                            {m.phone}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                            {currentMonth}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-emerald-700 dark:text-emerald-400">
                            Rs. {contributionRecord?.amount || m.monthlyPledgeAmount || 300}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{language === 'ur' ? 'ادا شدہ (Paid)' : 'Paid'}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right rtl:text-left">
                            {contributionRecord ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openReceiptModal('contribution', contributionRecord)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold transition-colors cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{language === 'ur' ? 'رسید دیکھیں' : 'View Receipt'}</span>
                                </button>
                                {currentUser?.role === 'super_admin' && (
                                  <button
                                    onClick={() => {
                                      setContributionToDelete(contributionRecord);
                                      setIsDeleteModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                                    title={language === 'ur' ? 'قسط ڈیلیٹ کریں (ایڈمن)' : 'Delete Contribution'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                )
              )}

              {/* If Pending Only Selected */}
              {statusFilter === 'pending' && (
                pendingMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-emerald-600 font-bold">
                      {language === 'ur' ? 'ماشاءاللہ! تمام اراکین کی ادائیگی درج ہو چکی ہے۔ کوئی اندراج باقی نہیں۔' : 'All members have paid! No pending entries.'}
                    </td>
                  </tr>
                ) : (
                  pendingMembers
                    .filter(m =>
                      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
                      (m.fullNameUrdu && m.fullNameUrdu.includes(search)) ||
                      m.membershipNumber.toLowerCase().includes(search.toLowerCase()) ||
                      m.phone.includes(search)
                    )
                    .map(m => (
                      <tr key={m.id} className="hover:bg-amber-50/40 dark:hover:bg-amber-950/30 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-amber-700 dark:text-amber-400">
                          {m.membershipNumber}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                          <div>{m.fullName}</div>
                          {m.fullNameUrdu && <div className="text-[11px] text-slate-500 font-urdu">{m.fullNameUrdu}</div>}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                          {language === 'ur' ? (m.addressUrdu || m.address) : m.address}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                          {m.phone}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                          {currentMonth}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                          Rs. {m.monthlyPledgeAmount || 300}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{language === 'ur' ? 'اندراج باقی (Pending)' : 'Not Entered'}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right rtl:text-left">
                          {isAdminOrKhazanchi ? (
                            <button
                              onClick={() => onOpenRecordPayModal(m.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white font-bold transition-colors cursor-pointer shadow-xs"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>{language === 'ur' ? 'فیس کا اندراج کریں' : 'Record Payment'}</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">{language === 'ur' ? 'صرف مطالعہ' : 'View-Only'}</span>
                          )}
                        </td>
                      </tr>
                    ))
                )
              )}

              {/* If Overdue Only Selected */}
              {statusFilter === 'overdue' && (
                overdueMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-emerald-600 font-bold">
                      {language === 'ur' ? 'الحمد للہ! 10 تاریخ تک کوئی واجب الادا رکن نہیں ہے۔' : 'No overdue members found!'}
                    </td>
                  </tr>
                ) : (
                  overdueMembers
                    .filter(m =>
                      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
                      (m.fullNameUrdu && m.fullNameUrdu.includes(search)) ||
                      m.membershipNumber.toLowerCase().includes(search.toLowerCase()) ||
                      m.phone.includes(search)
                    )
                    .map(m => (
                      <tr key={m.id} className="hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-rose-700 dark:text-rose-400">
                          {m.membershipNumber}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                          <div>{m.fullName}</div>
                          {m.fullNameUrdu && <div className="text-[11px] text-slate-500 font-urdu">{m.fullNameUrdu}</div>}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                          {language === 'ur' ? (m.addressUrdu || m.address) : m.address}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                          {m.phone}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                          {currentMonth} (10 تاریخ ڈیڈ لائن)
                        </td>
                        <td className="px-4 py-3.5 font-bold text-rose-700 dark:text-rose-400">
                          Rs. {m.monthlyPledgeAmount || 300}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>{language === 'ur' ? 'واجب الادا (Overdue)' : 'Overdue'}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right rtl:text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => sendPaymentReminder(m.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold transition-colors cursor-pointer"
                              title="Send Reminder"
                            >
                              <Send className="w-3 h-3 text-amber-700" />
                              <span>{language === 'ur' ? 'یاد دہانی' : 'Remind'}</span>
                            </button>
                            {isAdminOrKhazanchi && (
                              <button
                                onClick={() => onOpenRecordPayModal(m.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white font-bold transition-colors cursor-pointer shadow-xs"
                              >
                                <PlusCircle className="w-3 h-3" />
                                <span>{language === 'ur' ? 'وصولی' : 'Collect'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                )
              )}

              {/* If All Selected: Show all recorded contributions */}
              {statusFilter === 'all' && (
                filteredContributions.length === 0 ? (
                  // If contributions empty, show all members summary
                  members.map(m => {
                    const isPaid = currentMonthPaidMemberIds.has(m.id);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {m.membershipNumber}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                          <div>{m.fullName}</div>
                          {m.fullNameUrdu && <div className="text-[11px] text-slate-500 font-urdu">{m.fullNameUrdu}</div>}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                          {language === 'ur' ? (m.addressUrdu || m.address) : m.address}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                          {m.phone}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                          {currentMonth}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                          Rs. {m.monthlyPledgeAmount || 300}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {isPaid ? (language === 'ur' ? 'ادا شدہ' : 'Paid') : (language === 'ur' ? 'اندراج باقی' : 'Pending')}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right rtl:text-left">
                          {isAdminOrKhazanchi ? (
                            <button
                              onClick={() => onOpenRecordPayModal(m.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer"
                            >
                              <PlusCircle className="w-3 h-3" />
                              <span>{language === 'ur' ? 'اندراج' : 'Record'}</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  filteredContributions.map((c: Contribution) => {
                    const isPaid = c.status === 'paid';
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {c.receiptNumber}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                          {c.memberName}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                          Official
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                          -
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                          {c.month}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                          Rs. {c.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {t.status[c.status as keyof typeof t.status] || c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right rtl:text-left">
                          {isPaid ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openReceiptModal('contribution', c)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{t.contributions.printReceipt}</span>
                              </button>
                              {currentUser?.role === 'super_admin' && (
                                <button
                                  onClick={() => {
                                    setContributionToDelete(c);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                                  title={language === 'ur' ? 'قسط ڈیلیٹ کریں (ایڈمن)' : 'Delete Contribution'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => sendPaymentReminder(c.memberId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold transition-colors cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>{language === 'ur' ? 'یاد دہانی' : 'Remind'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Delete Record Confirmation Modal */}
      <AdminDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setContributionToDelete(null);
        }}
        recordType="contribution"
        recordId={contributionToDelete?.id || ''}
        recordTitle={`${contributionToDelete?.memberName || ''} - Rs. ${contributionToDelete?.amount ? contributionToDelete.amount.toLocaleString() : ''}`}
        recordSubtitle={`Receipt: ${contributionToDelete?.receiptNumber || ''} | Month: ${contributionToDelete?.month || ''}`}
      />
    </div>
  );
};
