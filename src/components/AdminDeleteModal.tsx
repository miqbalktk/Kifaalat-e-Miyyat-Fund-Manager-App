import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Trash2, X, Lock } from 'lucide-react';

export type DeleteRecordType = 'member' | 'contribution' | 'donation';

interface AdminDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordType: DeleteRecordType;
  recordId: string;
  recordTitle: string;
  recordSubtitle?: string;
}

export const AdminDeleteModal: React.FC<AdminDeleteModalProps> = ({
  isOpen,
  onClose,
  recordType,
  recordId,
  recordTitle,
  recordSubtitle,
}) => {
  const { language, deleteMember, deleteContribution, deleteDonation, currentUser } = useApp();
  const [deletionCode, setDeletionCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (currentUser.role !== 'super_admin') {
      setError(
        language === 'ur'
          ? 'صرف ایڈمنسٹریٹر کو ریکارڈ ڈیلیٹ کرنے کا اختیار حاصل ہے۔'
          : 'Only Super Administrator has permission to delete records.'
      );
      return;
    }

    if (deletionCode.trim() !== '0000') {
      setError(
        language === 'ur'
          ? 'غلط ڈیلیشن کوڈ! ڈیفالٹ کوڈ 0000 درج فرمائیں۔'
          : 'Invalid deletion code. Please enter the default code 0000.'
      );
      return;
    }

    try {
      setIsDeleting(true);
      let res: { success: boolean; message?: string } = { success: false };

      if (recordType === 'member') {
        res = await deleteMember(recordId, deletionCode.trim());
      } else if (recordType === 'contribution') {
        res = await deleteContribution(recordId, deletionCode.trim());
      } else if (recordType === 'donation') {
        res = await deleteDonation(recordId, deletionCode.trim());
      }

      if (res.success) {
        setDeletionCode('');
        onClose();
      } else {
        setError(res.message || 'Deletion failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Error deleting record');
    } finally {
      setIsDeleting(false);
    }
  };

  const typeLabels = {
    member: {
      en: 'Member Record',
      ur: 'رکن / ممبر کا ریکارڈ',
    },
    contribution: {
      en: 'Contribution Payment',
      ur: 'ماہانہ قسط کی ادائیگی',
    },
    donation: {
      en: 'Sadqah / Donation Record',
      ur: 'صدقہ و زکوٰۃ کا ریکارڈ',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-rose-500/40 p-6 text-slate-900 dark:text-white overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-rose-100 dark:border-rose-950/60">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              {typeLabels[recordType][language === 'ur' ? 'ur' : 'en']}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-urdu mt-0.5">
              {language === 'ur' ? 'ریکارڈ ڈیلیٹ کرنے کی توثیق' : 'Confirm Record Deletion'}
            </h3>
          </div>
        </div>

        {/* Target Confirmation Question */}
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold mb-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-urdu text-sm">
              {language === 'ur'
                ? 'do you want to delete the record? (کیا آپ واقعی یہ ریکارڈ ڈیلیٹ کرنا چاہتے ہیں؟)'
                : 'Do you want to delete the record?'}
            </span>
          </div>

          <div className="mt-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900 text-slate-800 dark:text-slate-200">
            <div className="font-bold text-xs font-urdu">{recordTitle}</div>
            {recordSubtitle && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {recordSubtitle}
              </div>
            )}
          </div>

          <p className="text-[11px] text-rose-700 dark:text-rose-300/90 mt-2 leading-relaxed">
            {language === 'ur'
              ? 'یہ کارروائی مستقل ہے اور ڈیٹا بیس اور سرور سے ریکارڈ حذف کر دے گی۔'
              : 'This action is permanent and will delete the record from database and server.'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-100 text-rose-900 dark:bg-rose-900/80 dark:text-rose-100 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form with Deletion Code 0000 */}
        <form onSubmit={handleDelete} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ur'
                ? 'ڈیلیشن کوڈ درج فرمائیں (ڈیفالٹ: 0000):'
                : 'Enter Deletion Code (Default: 0000):'}
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={8}
                value={deletionCode}
                onChange={e => setDeletionCode(e.target.value)}
                placeholder="0000"
                autoFocus
                className="w-full px-3.5 py-2.5 pl-9 rtl:pl-3.5 rtl:pr-9 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-rose-300 dark:border-rose-800 focus:border-rose-600 font-mono text-center tracking-widest text-sm font-bold text-slate-900 dark:text-white outline-hidden"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-center">
              {language === 'ur' ? 'ایڈمن سکیورٹی کوڈ: 0000' : 'Admin Security Passcode: 0000'}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isDeleting || !deletionCode}
              className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{language === 'ur' ? 'ہاں، ڈیلیٹ کریں' : 'Yes, Delete'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
