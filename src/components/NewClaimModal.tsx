import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DependentRelation } from '../types';
import { FileHeart, X, AlertCircle } from 'lucide-react';

interface NewClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewClaimModal: React.FC<NewClaimModalProps> = ({ isOpen, onClose }) => {
  const { members, fileClaim, language, t } = useApp();

  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [deceasedName, setDeceasedName] = useState('');
  const [deceasedRelation, setDeceasedRelation] = useState<DependentRelation>('father');
  const [dateOfDeath, setDateOfDeath] = useState(new Date().toISOString().split('T')[0]);
  const [causeOfDeath, setCauseOfDeath] = useState('Natural Causes');
  const [hospitalOrBurialPlace, setHospitalOrBurialPlace] = useState('');
  const [requestedAmount, setRequestedAmount] = useState(50000);
  const [recipientName, setRecipientName] = useState('');
  const [recipientContact, setRecipientContact] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'bank_transfer' | 'cash' | 'cheque'>('bank_transfer');
  const [proofDocumentNote, setProofDocumentNote] = useState('Hospital death slip and Union council certification verified.');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find(m => m.id === memberId);
    if (!member || !deceasedName) return;

    await fileClaim({
      memberId,
      memberName: member.fullName,
      deceasedName,
      deceasedRelation,
      dateOfDeath,
      causeOfDeath,
      hospitalOrBurialPlace: hospitalOrBurialPlace || 'Local Community Graveyard',
      requestedAmount,
      recipientName: recipientName || member.fullName,
      recipientContact: recipientContact || member.phone,
      payoutMethod,
      proofDocumentNote,
      burialKitIncluded: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600">
              <FileHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-urdu">
                {t.claims.fileNewClaim}
              </h3>
              <p className="text-[11px] text-slate-500">
                Immediate solace & burial assistance grant registration
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Member (Head of Family):
            </label>
            <select
              value={memberId}
              onChange={e => {
                setMemberId(e.target.value);
                const mem = members.find(m => m.id === e.target.value);
                if (mem) {
                  setRecipientName(mem.fullName);
                  setRecipientContact(mem.phone);
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.membershipNumber} - {m.fullName} ({m.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.claims.deceasedName}:
              </label>
              <input
                type="text"
                required
                value={deceasedName}
                onChange={e => setDeceasedName(e.target.value)}
                placeholder="Name of deceased person"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.claims.relation}:
              </label>
              <select
                value={deceasedRelation}
                onChange={e => setDeceasedRelation(e.target.value as DependentRelation)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="father">{t.relations.father}</option>
                <option value="mother">{t.relations.mother}</option>
                <option value="spouse">{t.relations.spouse}</option>
                <option value="child">{t.relations.child}</option>
                <option value="brother">{t.relations.brother}</option>
                <option value="sister">{t.relations.sister}</option>
                <option value="other">{t.relations.other}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.claims.dateOfDeath}:
              </label>
              <input
                type="date"
                required
                value={dateOfDeath}
                onChange={e => setDateOfDeath(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.claims.requestedAmount} (PKR):
              </label>
              <input
                type="number"
                value={requestedAmount}
                onChange={e => setRequestedAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Burial Location / Graveyard / Hospital:
            </label>
            <input
              type="text"
              required
              value={hospitalOrBurialPlace}
              onChange={e => setHospitalOrBurialPlace(e.target.value)}
              placeholder="e.g. Wadi-e-Hussain Graveyard / City Hospital"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Recipient / Nominee Name:
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Disbursement Method:
              </label>
              <select
                value={payoutMethod}
                onChange={e => setPayoutMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="bank_transfer">{t.paymentMethods.bank_transfer}</option>
                <option value="cash">{t.paymentMethods.cash}</option>
                <option value="cheque">{t.paymentMethods.cheque}</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-[11px]">
            ✓ Full Kafan burial shroud kit and emergency condolence allowance automatically allocated.
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
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
            >
              Submit Bereavement Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
