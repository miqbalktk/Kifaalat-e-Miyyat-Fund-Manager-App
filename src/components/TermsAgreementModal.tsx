import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fundRules, importantNote } from '../data/rules';
import { BrandLogo } from './BrandLogo';
import {
  ScrollText,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  ChevronDown,
  BookOpen
} from 'lucide-react';

interface TermsAgreementModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const TermsAgreementModal: React.FC<TermsAgreementModalProps> = ({ isOpen, onAccept }) => {
  const { language, currentUser } = useApp();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signatureName, setSignatureName] = useState(currentUser.name || '');

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 30) {
      setHasScrolledToBottom(true);
    }
  };

  const handleConfirm = () => {
    if (agreed) {
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border-2 border-emerald-600 overflow-hidden text-slate-800 dark:text-emerald-50 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white shrink-0 border-b border-emerald-700/60 flex items-center gap-3">
          <BrandLogo size={48} className="shrink-0" />
          <div className="flex-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block">
              {language === 'ur' ? 'لازمی اقرار نامہ برائے ممبران' : 'Mandatory Member Agreement'}
            </span>
            <h3 className="font-extrabold text-base sm:text-lg font-urdu leading-tight">
              {language === 'ur' ? 'کفالتِ میت فنڈ قواعد و ضوابط کی منظوری' : 'Acceptance of Kifaalat e Miyyat Fund Bylaws'}
            </h3>
            <p className="text-[11px] text-emerald-200 font-urdu mt-0.5">
              {language === 'ur'
                ? 'ہر ممبر کے لیے لاگ ان پر قواعد و ضوابط پڑھنا اور قبول کرنا لازمی ہے۔'
                : 'Every member must read and formally accept these terms to proceed.'}
            </p>
          </div>
        </div>

        {/* Highlight Notice */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 border-b border-emerald-100 dark:border-emerald-800/80 text-xs flex items-center justify-between text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold font-urdu">
              {language === 'ur' ? 'ماہانہ قسط: 300 روپے فی فرد | ہر ماہ کی 10 تاریخ تک' : 'Monthly Due: 300 PKR per individual | By 10th of every month'}
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 font-urdu">
            {language === 'ur' ? 'کل 19 قواعد' : '19 Rules Total'}
          </span>
        </div>

        {/* Scrollable Rules Container */}
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs bg-slate-50/50 dark:bg-emerald-950/50"
        >
          {fundRules.map(r => (
            <div
              key={r.id}
              className="p-3.5 rounded-xl bg-white dark:bg-emerald-900/60 border border-emerald-100 dark:border-emerald-800/60 shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs font-urdu">
                  {language === 'ur' ? r.titleUrdu : r.titleEn}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 font-bold text-emerald-700">
                  #{r.id}
                </span>
              </div>
              <p className="text-slate-700 dark:text-emerald-100 font-urdu leading-relaxed">
                {language === 'ur' ? r.contentUrdu : r.contentEn}
              </p>
            </div>
          ))}

          {/* Important note */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 font-urdu">
            <span className="font-bold block mb-1">اہم نوٹ:</span>
            {importantNote.urdu}
          </div>
        </div>

        {/* Acceptance Confirmation Footer */}
        <div className="p-4 bg-white dark:bg-emerald-950 border-t border-emerald-100 dark:border-emerald-900/80 shrink-0 space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 font-urdu leading-relaxed">
              {language === 'ur'
                ? 'میں حلفاً اقرار کرتا ہوں کہ میں نے کفالتِ میت فنڈ کے تمام 19 قواعد و ضوابط بغور پڑھ لیے ہیں اور ان کی مکمل پاسداری کا پابند رہوں گا۔'
                : 'I hereby solemnly affirm that I have read and understood all 19 rules & regulations of Kifaalat e Miyyat Fund and pledge to abide by them.'}
            </span>
          </label>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate-500 dark:text-emerald-400">
              {language === 'ur' ? 'رکن کا نام:' : 'Member Name:'} <strong className="text-slate-800 dark:text-white">{currentUser.name}</strong>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!agreed}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-urdu"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{language === 'ur' ? 'قواعد قبول ہیں اور آگے بڑھیں' : 'Accept Terms & Enter App'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
