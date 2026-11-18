import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BereavementClaim } from '../types';
import {
  FileHeart,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  ShieldCheck,
  Eye,
  FileCheck,
  Banknote,
  Send,
  X
} from 'lucide-react';

interface BereavementClaimsViewProps {
  onOpenFileClaimModal: () => void;
}

export const BereavementClaimsView: React.FC<BereavementClaimsViewProps> = ({
  onOpenFileClaimModal
}) => {
  const { claims, language, t, approveClaim, disburseClaim, openReceiptModal, userRole } = useApp();
  const [selectedClaim, setSelectedClaim] = useState<BereavementClaim | null>(null);
  const [confirmApprove, setConfirmApprove] = useState<string | null>(null);

  const handleApprove = async (claimId: string, amount: number) => {
    await approveClaim(claimId, amount);
    setConfirmApprove(null);
    if (selectedClaim && selectedClaim.id === claimId) {
      setSelectedClaim(prev => prev ? { ...prev, status: 'approved', approvedAmount: amount } : null);
    }
  };

  const handleDisburse = async (claimId: string) => {
    await disburseClaim(claimId);
    if (selectedClaim && selectedClaim.id === claimId) {
      setSelectedClaim(prev => prev ? { ...prev, status: 'disbursed' } : null);
    }
  };

  const canApprove = userRole === 'super_admin' || userRole === 'finance_secretary';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-urdu">
            {t.claims.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.claims.subtitle}
          </p>
        </div>

        {canApprove ? (
          <button
            onClick={onOpenFileClaimModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.claims.fileNewClaim}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 font-semibold">
            <FileHeart className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              {language === 'ur'
                ? 'وفات کلیم اندراج صرف ایڈمنسٹریٹر/خزانچی کا اختیار ہے۔ فوری تعزیتی رابطہ: 0346-9100998'
                : 'Death claim registration is handled by Admin/Treasurer. Emergency Contact: 0346-9100998'}
            </span>
          </div>
        )}
      </div>

      {/* Burial Package Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/20 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-xs text-rose-900 dark:text-rose-200">
        <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <span className="font-bold">{t.claims.burialPackageNotice}</span>
        </div>
      </div>

      {/* Claims List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {claims.map(c => {
          const isPending = c.status === 'submitted' || c.status === 'under_review';
          const isApproved = c.status === 'approved';
          const isDisbursed = c.status === 'disbursed';

          return (
            <div
              key={c.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-xs flex flex-col justify-between ${
                isPending
                  ? 'border-rose-300 dark:border-rose-900'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Header ID and Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-md">
                    {c.claimNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isDisbursed
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : isApproved
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {t.status[c.status]}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                    {language === 'ur' ? 'مرحوم فرد' : 'Deceased Person'}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Late {c.deceasedName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t.relations[c.deceasedRelation as keyof typeof t.relations] || c.deceasedRelation} of {c.memberName}
                  </p>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 block">{t.claims.dateOfDeath}:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{c.dateOfDeath}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{language === 'ur' ? 'تدفین گاہ / ہسپتال' : 'Burial Location'}:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">
                      {c.hospitalOrBurialPlace}
                    </span>
                  </div>
                </div>

                {/* Shroud Kit Tag */}
                {c.burialKitIncluded && (
                  <div className="mt-3 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded text-[11px] text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'ur' ? 'کفن پیکج و ایمبولینس مہیا کی گئی' : 'Shroud kit & transport provided'}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.claims.requestedAmount}:</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    Rs. {(c.approvedAmount || c.requestedAmount).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedClaim(c)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {t.claims.viewDetails}
                  </button>

                  {isDisbursed && (
                    <button
                      onClick={() => openReceiptModal('claim', c)}
                      className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors cursor-pointer"
                      title="View Voucher"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Claim Detail & Approval Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded">
                  {selectedClaim.claimNumber}
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Bereavement Grant Claim
                </h3>
              </div>
              <button onClick={() => setSelectedClaim(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <span className="text-slate-400 block">{t.claims.deceasedName}:</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Late {selectedClaim.deceasedName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t.claims.relation}:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {t.relations[selectedClaim.deceasedRelation as keyof typeof t.relations] || selectedClaim.deceasedRelation}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Member Filing:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedClaim.memberName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t.claims.dateOfDeath}:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedClaim.dateOfDeath}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Burial Location / Graveyard:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedClaim.hospitalOrBurialPlace}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Verification Documents:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    {selectedClaim.proofDocumentNote || 'Nadra death certificate verified by committee.'}
                  </span>
                </div>
              </div>

              {/* Status & Approvals */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Grant Amount Authorized:</span>
                  <span className="text-lg font-extrabold text-emerald-800 dark:text-emerald-400">
                    Rs. {selectedClaim.approvedAmount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {t.status[selectedClaim.status]}
                  </span>
                </div>
              </div>

              {/* Action Buttons inside Modal */}
              <div className="pt-2 flex flex-wrap gap-2 justify-end">
                {selectedClaim.status === 'submitted' || selectedClaim.status === 'under_review' ? (
                  canApprove ? (
                    <button
                      onClick={() => handleApprove(selectedClaim.id, selectedClaim.requestedAmount)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>{t.claims.approveClaim}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-amber-600 italic">
                      Requires Admin or Finance approval
                    </span>
                  )
                ) : null}

                {selectedClaim.status === 'approved' && (
                  <button
                    onClick={() => handleDisburse(selectedClaim.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    <Banknote className="w-4 h-4" />
                    <span>{t.claims.disburseFunds}</span>
                  </button>
                )}

                {selectedClaim.status === 'disbursed' && (
                  <button
                    onClick={() => {
                      const clm = selectedClaim;
                      setSelectedClaim(null);
                      openReceiptModal('claim', clm);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Official Grant Voucher</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
