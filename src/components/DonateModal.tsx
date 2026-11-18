import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DonationCategory, PaymentMethod } from '../types';
import { HeartHandshake, X, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const { makeDonation, language, t } = useApp();

  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [amount, setAmount] = useState<number>(5000);
  const [category, setCategory] = useState<DonationCategory>('kafan_burial_sponsorship');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [dedicatedFor, setDedicatedFor] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const quickAmounts = [1000, 2500, 5000, 10000, 25000, 50000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Small simulated gateway processing latency
      await new Promise(r => setTimeout(r, 600));

      await makeDonation({
        donorName: isAnonymous ? 'Anonymous Philanthropist (محسن)' : (donorName || 'Respected Donor'),
        donorEmail: donorEmail || 'donor@community.org',
        donorPhone: donorPhone || '+92 300 0000000',
        isAnonymous,
        amount,
        category,
        paymentMethod,
        dedicatedFor: dedicatedFor || (category === 'kafan_burial_sponsorship' ? 'Burial kit & Kafan sponsorship for destitute deceased' : undefined),
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#f59e0b']
        });
      } catch (err) {
        // ignore
      }

      setIsProcessing(false);
      onClose();
    } catch (err) {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto max-h-[92vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-urdu">
                {t.donations.makeDonationBtn}
              </h3>
              <p className="text-[11px] text-slate-500">
                Secure Charity & Zakat Gateway for Underprivileged Bereavement
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Category Choice */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Purpose / Fund Category:
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as DonationCategory)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            >
              <option value="kafan_burial_sponsorship">{t.categories.kafan_burial_sponsorship}</option>
              <option value="zakat">{t.categories.zakat}</option>
              <option value="sadqah">{t.categories.sadqah}</option>
              <option value="ambulance_fuel">{t.categories.ambulance_fuel}</option>
              <option value="underprivileged_aid">{t.categories.underprivileged_aid}</option>
              <option value="general_fund">{t.categories.general_fund}</option>
            </select>
          </div>

          {/* Quick Amount Pills */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Select Donation Amount (PKR):
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
              {quickAmounts.map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    amount === val
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Rs. {val.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3 rtl:left-auto rtl:right-3 top-2.5 font-bold text-slate-400">
                PKR
              </span>
              <input
                type="number"
                required
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                placeholder="Or enter custom amount"
                className="w-full pl-12 pr-4 rtl:pl-4 rtl:pr-12 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-base text-emerald-700 dark:text-emerald-400 font-mono"
              />
            </div>
          </div>

          {/* Donor Information */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Donor Details (for Official Receipt)
              </span>
              <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="font-medium text-[11px]">{t.donations.anonymous}</span>
              </label>
            </div>

            {!isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required={!isAnonymous}
                  value={donorName}
                  onChange={e => setDonorName(e.target.value)}
                  placeholder="Your Full Name"
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <input
                  type="email"
                  value={donorEmail}
                  onChange={e => setDonorEmail(e.target.value)}
                  placeholder="Email (for PDF Receipt)"
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <input
                  type="text"
                  value={donorPhone}
                  onChange={e => setDonorPhone(e.target.value)}
                  placeholder="Phone / WhatsApp"
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Payment Method:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`p-2.5 rounded-xl border text-center cursor-pointer transition-colors ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="pmethod"
                  className="hidden"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={() => setPaymentMethod('bank_transfer')}
                />
                <span className="text-[11px] font-medium block">HBL Bank / Raast</span>
              </label>

              <label
                className={`p-2.5 rounded-xl border text-center cursor-pointer transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="pmethod"
                  className="hidden"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                />
                <span className="text-[11px] font-medium block">Cash In Hand</span>
              </label>

              <label
                className={`p-2.5 rounded-xl border text-center cursor-pointer transition-colors ${
                  paymentMethod === 'cheque'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="pmethod"
                  className="hidden"
                  checked={paymentMethod === 'cheque'}
                  onChange={() => setPaymentMethod('cheque')}
                />
                <span className="text-[11px] font-medium block">Cheque / Pay Order</span>
              </label>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Optional Dedication / Dua Note:
            </label>
            <input
              type="text"
              value={dedicatedFor}
              onChange={e => setDedicatedFor(e.target.value)}
              placeholder="e.g. In loving memory of my beloved mother"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md cursor-pointer"
            >
              {isProcessing ? 'Processing...' : `Confirm & Donate Rs. ${amount.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
