import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Member, Dependent } from '../types';
import { EditMemberModal } from './EditMemberModal';
import { AdminDeleteModal } from './AdminDeleteModal';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Send,
  CreditCard,
  Eye,
  Plus,
  Trash2,
  X,
  Edit,
  DollarSign,
  KeyRound,
  Lock
} from 'lucide-react';

interface MembersViewProps {
  onOpenNewMemberModal: () => void;
  onOpenRecordPayModal: (memberId?: string) => void;
  onOpenCredentialsModal?: (memberId?: string) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  onOpenNewMemberModal,
  onOpenRecordPayModal,
  onOpenCredentialsModal
}) => {
  const { members, language, t, sendPaymentReminder, contributions, claims, isAdminOrKhazanchi, currentUser, userRole } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [villageFilter, setVillageFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Edit Member Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  // Delete Member State (Admin only)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (m.fullNameUrdu && m.fullNameUrdu.includes(search)) ||
      m.membershipNumber.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      (m.whatsapp && m.whatsapp.includes(search)) ||
      (m.address && m.address.toLowerCase().includes(search.toLowerCase())) ||
      (m.addressUrdu && m.addressUrdu.includes(search)) ||
      m.nationalId.includes(search);

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;

    const matchesVillage =
      villageFilter === 'all' ||
      (m.address && m.address.includes(villageFilter)) ||
      (m.addressUrdu && m.addressUrdu.includes(villageFilter));

    return matchesSearch && matchesStatus && matchesVillage;
  });

  const handleSendReminder = (member: Member) => {
    sendPaymentReminder(member.id);
    setReminderToast(`Payment reminder generated for ${member.fullName}`);
    setTimeout(() => setReminderToast(null), 3000);
  };

  const handleOpenEdit = (m: Member) => {
    setMemberToEdit(m);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Toast Alert */}
      {reminderToast && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 bg-[#004d30] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-urdu">
            {t.members.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ur'
              ? 'کل 39 اراکین، رابطہ نمبرز، CNIC، واٹس ایپ اور اقساط کا سرکاری ریکارڈ'
              : t.members.subtitle}
          </p>
        </div>

        {isAdminOrKhazanchi ? (
          <div className="flex items-center gap-2">
            {onOpenCredentialsModal && (
              <button
                onClick={() => onOpenCredentialsModal()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 text-xs font-bold transition-colors cursor-pointer border border-amber-300 dark:border-amber-800"
              >
                <KeyRound className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                <span>{language === 'ur' ? 'اراکین لاگ ان و پاس ورڈ انتظام' : 'Member Logins & Rights'}</span>
              </button>
            )}

            <button
              onClick={onOpenNewMemberModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'ur' ? 'نیا ممبر شامل کریں' : t.members.addMemberBtn}</span>
            </button>
          </div>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.members.viewOnlyBadge}</span>
          </div>
        )}
      </div>

      {!isAdminOrKhazanchi && (
        <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{t.auth.viewOnlyNotice}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={language === 'ur' ? 'نام، گاؤں (سپین کانہ، اضاخیل، رسالپور، کاکا صاحب)، فون یا CNIC...' : t.members.searchPlaceholder}
              className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-emerald-500 font-urdu"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <option value="all">{language === 'ur' ? `تمام اراکین (${members.length})` : `All Statuses (${members.length})`}</option>
              <option value="active">{t.status.active}</option>
              <option value="grace_period">{t.status.grace_period}</option>
              <option value="suspended">{t.status.suspended}</option>
            </select>
          </div>
        </div>

        {/* Village / Khandan Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
          <span className="text-[11px] text-slate-400 font-medium shrink-0 font-urdu">
            {language === 'ur' ? 'خاندان / گاؤں:' : 'Village:'}
          </span>
          {[
            { id: 'all', labelUrdu: `تمام (${members.length})`, labelEn: `All (${members.length})` },
            { id: 'سپین کانہ', labelUrdu: 'سپین کانہ کلان', labelEn: 'Spin Kana' },
            { id: 'کاکا صاحب', labelUrdu: 'کاکا صاحب', labelEn: 'Kaka Sahib' },
            { id: 'اضاخیل', labelUrdu: 'اضاخیل بالا', labelEn: 'Azakhel' },
            { id: 'رسالپور', labelUrdu: 'رسالپور', labelEn: 'Risalpur' },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setVillageFilter(v.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                villageFilter === v.id
                  ? 'bg-[#004d30] text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {language === 'ur' ? v.labelUrdu : v.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map(m => {
          const isOverdue = m.overdueMonths > 0;
          return (
            <div
              key={m.id}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-xs flex flex-col justify-between ${
                isOverdue
                  ? 'border-amber-300 dark:border-amber-900/60'
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500'
              }`}
            >
              <div>
                {/* Header ID and Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md">
                    {m.membershipNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : m.status === 'grace_period'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {t.status[m.status]}
                  </span>
                </div>

                {/* Member Names */}
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {m.fullName}
                </h3>
                {m.fullNameUrdu && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-urdu mt-0.5 font-bold">
                    {m.fullNameUrdu}
                  </p>
                )}

                {/* Contact info: Location, Calling Phone, WhatsApp, CNIC */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-medium text-emerald-900 dark:text-emerald-200">
                      {m.addressUrdu && language === 'ur' ? m.addressUrdu : m.address}
                    </span>
                  </div>

                  {userRole === 'guest' ? (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 flex items-center gap-1.5 font-urdu">
                      <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{language === 'ur' ? 'رابطہ نمبر و CNIC مخفی ہے (صرف تصدیق شدہ اراکین)' : 'Contact & CNIC protected (Hidden for Guest)'}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono">{m.phone}</span>
                        </div>
                        {m.whatsapp && (
                          <a
                            href={`https://wa.me/${m.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WA</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-mono">CNIC: {m.nationalId || 'Not Recorded'}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Overdue alert pill */}
                {isOverdue && (
                  <div className="mt-3 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {m.overdueMonths} {language === 'ur' ? 'ماہ واجب الادا' : 'month(s) overdue'}
                    </span>
                    <button
                      onClick={() => handleSendReminder(m)}
                      className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-[10px] font-bold hover:bg-amber-300 transition-colors cursor-pointer"
                    >
                      {language === 'ur' ? 'یاد دہانی' : 'Remind'}
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.members.monthlyPledge}:</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {m.monthlyPledgeAmount === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">فی سبیل اللہ (مرحوم)</span>
                    ) : (
                      `Rs. ${m.monthlyPledgeAmount} / ${language === 'ur' ? 'ماہ' : 'mo'}`
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Member Login & Password Management: Admin only */}
                  {isAdminOrKhazanchi && onOpenCredentialsModal && (
                    <button
                      onClick={() => onOpenCredentialsModal(m.id)}
                      className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-colors cursor-pointer"
                      title={language === 'ur' ? 'یوزر نیم و پاس ورڈ بنائیں یا تبدیل کریں' : 'Manage Member Login & Password'}
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                  )}

                  {/* Edit button: Admin & Khazanchi only */}
                  {isAdminOrKhazanchi && (
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 hover:bg-blue-100 transition-colors cursor-pointer"
                      title={language === 'ur' ? 'معلومات میں ترمیم کریں' : 'Edit Member Details'}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}

                  {/* Record Payment button: Admin & Khazanchi only */}
                  {isAdminOrKhazanchi && (
                    <button
                      onClick={() => onOpenRecordPayModal(m.id)}
                      className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors cursor-pointer"
                      title={t.members.recordPay}
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                  )}

                  {/* Super Admin Delete Button */}
                  {currentUser?.role === 'super_admin' && (
                    <button
                      onClick={() => {
                        setMemberToDelete(m);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                      title={language === 'ur' ? 'ممبر ریکارڈ ڈیلیٹ کریں (ایڈمن)' : 'Delete Member (Admin)'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedMember(m)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {t.members.viewProfile}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Details Drawer Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  {selectedMember.membershipNumber}
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedMember.fullName}
                  </h3>
                  {selectedMember.fullNameUrdu && (
                    <p className="text-xs text-slate-500 font-urdu">{selectedMember.fullNameUrdu}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {userRole === 'guest' ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs text-slate-500 font-urdu flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                  <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{language === 'ur' ? 'رابطہ نمبرز و CNIC برائے اراکین و ایڈمن محفوظ ہیں (مہمان صارف کے لیے مخفی)' : 'Contact details & CNIC protected (Hidden for Guest)'}</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div>
                    <span className="text-slate-400 block">Calling Phone:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{selectedMember.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">WhatsApp:</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300 font-mono">
                      {selectedMember.whatsapp || selectedMember.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">National ID / CNIC:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{selectedMember.nationalId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Location:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedMember.addressUrdu ? `${selectedMember.addressUrdu} (${selectedMember.address})` : selectedMember.address}
                    </span>
                  </div>
                </div>
              )}

              {/* Dependents Section */}
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2">
                  {t.members.dependentsList} ({selectedMember.dependents.length})
                </h4>
                {selectedMember.dependents.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">No dependents registered.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedMember.dependents.map(dep => (
                      <div
                        key={dep.id}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {dep.fullName}
                          </span>
                          <span className="text-slate-400 text-[11px] capitalize">
                            {t.relations[dep.relation as keyof typeof t.relations] || dep.relation}
                          </span>
                        </div>
                        <span className="font-mono text-slate-500 text-[11px]">
                          {userRole === 'guest' ? '•••••••••••••' : dep.cnicOrDob}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment History for this member */}
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2">
                  {language === 'ur' ? 'حالیہ فیس و چندہ تاریخچہ' : 'Recent Payment History'}
                </h4>
                {contributions.filter(c => c.memberId === selectedMember.id).length === 0 ? (
                  <p className="text-slate-400 text-xs italic">No contributions recorded yet for this member.</p>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {contributions.filter(c => c.memberId === selectedMember.id).map(c => (
                      <div key={c.id} className="p-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-emerald-600">{c.receiptNumber}</span>
                          <span className="text-slate-500 ml-2">Month: {c.month}</span>
                          {c.notes && <span className="text-slate-400 text-[10px] block">{c.notes}</span>}
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                          Rs. {c.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              {currentUser?.role === 'super_admin' && (
                <button
                  onClick={() => {
                    const m = selectedMember;
                    setSelectedMember(null);
                    setMemberToDelete(m);
                    setIsDeleteModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer mr-auto rtl:mr-0 rtl:ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'ڈیلیٹ ممبر' : 'Delete Member'}</span>
                </button>
              )}

              {isAdminOrKhazanchi && (
                <button
                  onClick={() => {
                    const m = selectedMember;
                    setSelectedMember(null);
                    handleOpenEdit(m);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'ترمیم کریں' : 'Edit Details'}</span>
                </button>
              )}

              {isAdminOrKhazanchi && (
                <button
                  onClick={() => {
                    const mId = selectedMember.id;
                    setSelectedMember(null);
                    onOpenRecordPayModal(mId);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{t.members.recordPay}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setMemberToEdit(null);
        }}
        member={memberToEdit}
      />

      {/* Admin Delete Confirmation Modal */}
      <AdminDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMemberToDelete(null);
        }}
        recordType="member"
        recordId={memberToDelete?.id || ''}
        recordTitle={`${memberToDelete?.fullName || ''} (${memberToDelete?.membershipNumber || ''})`}
        recordSubtitle={`Location: ${memberToDelete?.address || ''} | CNIC: ${memberToDelete?.nationalId || ''}`}
      />
    </div>
  );
};
