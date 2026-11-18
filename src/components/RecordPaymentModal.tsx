import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { HandCoins, X, Calendar, Layers, CheckCircle2 } from 'lucide-react';
import { PaymentMethod } from '../types';
import { getCurrentYearMonth } from '../utils/contributionHelpers';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMemberId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultMemberId
}) => {
  const { members, recordContribution, language, t } = useApp();

  const [memberId, setMemberId] = useState(defaultMemberId || members[0]?.id || '');
  const [startMonth, setStartMonth] = useState(() => getCurrentYearMonth());
  const [monthsCount, setMonthsCount] = useState<number>(1);
  const [amount, setAmount] = useState<number>(300);
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');

  // Sync selected member & defaults every time modal opens or target member changes
  useEffect(() => {
    if (!isOpen) return;
    const targetMember =
      (defaultMemberId ? members.find(m => m.id === defaultMemberId) : undefined) ||
      members[0];
    const targetId = targetMember?.id || '';
    const baseRate = targetMember?.monthlyPledgeAmount && targetMember.monthlyPledgeAmount > 0
      ? targetMember.monthlyPledgeAmount
      : 300;
    setMemberId(targetId);
    setStartMonth(getCurrentYearMonth());
    setMonthsCount(1);
    setAmount(baseRate);
    setMethod('bank_transfer');
    setReferenceNo('');
    setNotes('');
  }, [isOpen, defaultMemberId, members]);

  if (!isOpen) return null;

  const selectedMember = members.find(m => m.id === memberId) || members[0];
  const monthlyRate = selectedMember?.monthlyPledgeAmount && selectedMember.monthlyPledgeAmount > 0
    ? selectedMember.monthlyPledgeAmount
    : 300;

  const handleMonthsChange = (mCount: number) => {
    const validCount = Math.max(1, Math.min(60, mCount));
    setMonthsCount(validCount);
    setAmount(validCount * monthlyRate);
  };

  const handleAmountChange = (newAmt: number) => {
    setAmount(newAmt);
    if (monthlyRate > 0 && newAmt >= monthlyRate && newAmt % monthlyRate === 0) {
      const inferred = Math.round(newAmt / monthlyRate);
      if (inferred >= 1 && inferred <= 60) {
        setMonthsCount(inferred);
      }
    }
  };

  const calculatePeriodNote = () => {
    if (monthsCount <= 1) return `Month: ${startMonth}`;
    const [yearStr, monthStr] = startMonth.split('-');
    const y = parseInt(yearStr);
    const m = parseInt(monthStr);
    const endDate = new Date(y, m - 1 + monthsCount - 1, 1);
    const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;
    return `Advance for ${monthsCount} months (${startMonth} to ${endStr})`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;

    const periodNote = calculatePeriodNote();
    const finalNotes = notes ? `${notes} | ${periodNote}` : periodNote;

    await recordContribution({
      memberId,
      month: startMonth,
      amount,
      method,
      referenceNo,
      notes: finalNotes,
      monthsCount,
      advancePeriodNote: periodNote,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-[#004d30] dark:text-emerald-400">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-urdu">
                {t.contributions.recordNewPayment}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'ur'
                  ? 'رقم کا اندراج فرمائیں۔ پیشگی اقساط کی صورت میں مہینوں کی تعداد منتخب کریں۔'
                  : 'Record member dues with advance multi-month option.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Member Selection */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {t.contributions.member}:
            </label>
            <select
              value={memberId}
              onChange={e => {
                setMemberId(e.target.value);
                const mem = members.find(m => m.id === e.target.value);
                const rate = mem?.monthlyPledgeAmount && mem.monthlyPledgeAmount > 0 ? mem.monthlyPledgeAmount : 300;
                setAmount(monthsCount * rate);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium cursor-pointer"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.membershipNumber} - {m.fullName} ({m.phone}) {m.overdueMonths > 0 ? `[Overdue ${m.overdueMonths} mo]` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Advance Months & Starting Month */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center justify-between">
                <span>{language === 'ur' ? 'مہینوں کی تعداد (پیشگی)' : 'Number of Months'}:</span>
                <span className="text-[10px] text-emerald-600 font-bold">Advance</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={monthsCount}
                  onChange={e => handleMonthsChange(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 font-mono font-bold text-center text-sm"
                />
                {/* Quick advance pills */}
                <div className="flex items-center gap-1">
                  {[1, 3, 6, 12].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleMonthsChange(m)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                        monthsCount === m
                          ? 'bg-[#004d30] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {m}M
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'ur' ? 'ابتدائی مہینہ' : 'Start Month'}:
              </label>
              <input
                type="month"
                required
                value={startMonth}
                onChange={e => setStartMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>
          </div>

          {/* Amount Calculation Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {t.contributions.amount} (PKR):
              </label>
              <span className="text-[11px] text-slate-400">
                {monthsCount} mo × Rs. {monthlyRate}
              </span>
            </div>
            <input
              type="number"
              required
              value={amount}
              onChange={e => handleAmountChange(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold font-mono text-base text-[#004d30] dark:text-emerald-400"
            />
          </div>

          {/* Period Covered Note Banner */}
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>{language === 'ur' ? 'مدتِ ادائیگی:' : 'Period Covered:'}</strong> {calculatePeriodNote()}
            </span>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {t.contributions.method}:
            </label>
            <select
              value={method}
              onChange={e => setMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium cursor-pointer"
            >
              <option value="bank_transfer">{t.paymentMethods.bank_transfer}</option>
              <option value="cash">{t.paymentMethods.cash}</option>
              <option value="cheque">{t.paymentMethods.cheque}</option>
            </select>
          </div>

          {/* Reference ID / Trx ID */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {language === 'ur' ? 'ٹرانزیکشن ID یا رسید نمبر:' : 'Transaction ID / Ref No:'}
            </label>
            <input
              type="text"
              value={referenceNo}
              onChange={e => setReferenceNo(e.target.value)}
              placeholder="e.g. TXN-2026-01 / Ref No"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white font-bold transition-colors cursor-pointer"
            >
              {language === 'ur' ? 'ادائیگی محفوظ کریں' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
