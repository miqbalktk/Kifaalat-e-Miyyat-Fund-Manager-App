import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminDeleteModal } from './AdminDeleteModal';
import { Donation } from '../types';
import {
  HeartHandshake,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Sparkles,
  Award,
  Globe2,
  Trash2
} from 'lucide-react';

interface DonationsViewProps {
  onOpenDonateModal: () => void;
}

export const DonationsView: React.FC<DonationsViewProps> = ({ onOpenDonateModal }) => {
  const { donations, language, t, openReceiptModal, isAdminOrKhazanchi, currentUser } = useApp();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState<Donation | null>(null);

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const target = 300000;
  const progressPercent = Math.min(100, Math.round((totalDonations / target) * 100));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-urdu">
            {t.donations.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.donations.subtitle}
          </p>
        </div>

        {isAdminOrKhazanchi ? (
          <button
            onClick={onOpenDonateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>{t.donations.makeDonationBtn}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-semibold">
            <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === 'ur'
                ? 'صدقہ و زکوٰۃ اندراج صرف ایڈمنسٹریٹر/خزانچی کا اختیار ہے۔'
                : 'Sadqah entry is recorded by Admin/Treasurer only.'}
            </span>
          </div>
        )}
      </div>

      {/* Target Progress Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-emerald-200 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {language === 'ur' ? 'ماہانہ رفاہی تجہیز و تکفین فنڈ ہدف' : 'Monthly Destitute Burial Assistance Target'}
            </span>
            <h3 className="text-2xl font-bold font-urdu">
              {language === 'ur'
                ? 'نادار و بے سہارا افراد کی باوقار تدفین میں حصہ دار بنیں'
                : 'Sponsor Dignified Funerals & Shrouds for Underprivileged Families'}
            </h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              {language === 'ur'
                ? 'کسی غریب یا لاوارث میت کے کفن، غسل، قبر کی کھدائی اور ایمبولینس ٹرانسپورٹ کے تمام اخراجات فنڈ کے ذریعے 100 فیصد مفت ادا کیے جاتے ہیں۔'
                : '100% of your Zakat and Sadqah directly covers grave digging, shrouds, and transport for impoverished deceased.'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/15 min-w-[260px]">
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-[11px] text-emerald-200 block">{t.donations.raised}:</span>
                <span className="text-2xl font-black">Rs. {totalDonations.toLocaleString()}</span>
              </div>
              <span className="text-sm font-bold text-emerald-300">{progressPercent}%</span>
            </div>

            <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 text-[10px] text-emerald-200 text-right">
              {t.donations.target}: Rs. {target.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Impact Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">100% Shariah Compliant</h4>
            <p className="text-[11px] text-slate-500">Zakat & Sadqah funds kept in dedicated sub-accounts</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">Verified Digital Receipts</h4>
            <p className="text-[11px] text-slate-500">Immediate QR-verified receipt sent via email</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">Public Transparency</h4>
            <p className="text-[11px] text-slate-500">Every rupee accounted for in community ledger</p>
          </div>
        </div>
      </div>

      {/* Recent Philanthropic Contributions List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {t.donations.recentDonations}
          </h3>
          <span className="text-xs text-slate-500">
            {donations.length} {language === 'ur' ? 'عطیات درج شدہ' : 'contributions recorded'}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {donations.map(d => (
            <div key={d.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-3 rounded-xl transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {d.isAnonymous ? 'م' : d.donorName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
                    {d.donorName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span className="font-mono text-emerald-600 font-bold">{d.receiptNumber}</span>
                    <span>•</span>
                    <span>{t.categories[d.category as keyof typeof t.categories] || d.category}</span>
                    <span>•</span>
                    <span>{d.date}</span>
                  </div>
                  {d.dedicatedFor && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic">
                      "{d.dedicatedFor}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2">
                <span className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                  Rs. {d.amount.toLocaleString()}
                </span>
                <button
                  onClick={() => openReceiptModal('donation', d)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.contributions.printReceipt}</span>
                </button>
                {currentUser?.role === 'super_admin' && (
                  <button
                    onClick={() => {
                      setDonationToDelete(d);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                    title={language === 'ur' ? 'ریکارڈ ڈیلیٹ کریں (ایڈمن)' : 'Delete Record (Admin)'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Delete Confirmation Modal */}
      <AdminDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDonationToDelete(null);
        }}
        recordType="donation"
        recordId={donationToDelete?.id || ''}
        recordTitle={`${donationToDelete?.donorName || ''} - Rs. ${donationToDelete?.amount ? donationToDelete.amount.toLocaleString() : ''}`}
        recordSubtitle={`Receipt: ${donationToDelete?.receiptNumber || ''} | Date: ${donationToDelete?.date || ''}`}
      />
    </div>
  );
};
