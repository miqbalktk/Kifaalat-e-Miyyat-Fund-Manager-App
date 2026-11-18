import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fundRules, importantNote, RuleItem } from '../data/rules';
import {
  ScrollText,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Printer,
  ShieldCheck,
  Users,
  Coins,
  FileHeart,
  HelpCircle,
  Share2
} from 'lucide-react';

export const RulesRegulationsView: React.FC = () => {
  const { language, t, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredRules = fundRules.filter(r => {
    const matchesSearch =
      r.titleUrdu.includes(search) ||
      r.contentUrdu.includes(search) ||
      r.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      r.contentEn.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-emerald-700/50 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-semibold mb-2">
              <ScrollText className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'باضابطہ دستوری دستاویز' : 'Official Constitution & Bylaws'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-urdu tracking-tight">
              {language === 'ur' ? 'کفالتِ میت فنڈ قواعد و ضوابط' : 'Kifaalat e Miyyat Fund Rules & Regulations'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl font-urdu">
              {language === 'ur'
                ? 'باہمی تعاون، امداد اور فلاحی نظم و ضبط کے لیے ضوابط (کل 19 قواعد)'
                : 'Regulations for mutual cooperation, bereavement aid, and welfare governance (19 Rules)'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'ur' ? 'پرنٹ قواعد' : 'Print Rules'}</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Pill Bar */}
        <div className="mt-6 pt-4 border-t border-emerald-700/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-black/20">
            <span className="text-emerald-300 block text-[10px]">ماہانہ قسط (قاعدہ 4)</span>
            <span className="font-bold text-white text-sm">300 روپے فی فرد</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/20">
            <span className="text-emerald-300 block text-[10px]">چھوٹے نابالغ امداد (قاعدہ 7)</span>
            <span className="font-bold text-white text-sm">15,000 روپے</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/20">
            <span className="text-emerald-300 block text-[10px]">بالغ فرد امداد (قاعدہ 8)</span>
            <span className="font-bold text-white text-sm">50,000 روپے</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/20">
            <span className="text-emerald-300 block text-[10px]">ادائیگی کی مدت (قاعدہ 9)</span>
            <span className="font-bold text-white text-sm">سوئم سے پہلے</span>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-emerald-950/80 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={language === 'ur' ? 'قواعد میں تلاش کریں (مثلاً: 300 روپے، نابالغ، قسط، شادی)...' : 'Search rules (e.g. 300, minor, death grant, marriage)...'}
            className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-xs text-slate-800 dark:text-emerald-100 focus:outline-emerald-500 font-urdu"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', labelUrdu: 'تمام 19 قواعد', labelEn: 'All 19 Rules' },
            { id: 'membership', labelUrdu: 'رکنیت و خاندان', labelEn: 'Membership' },
            { id: 'contributions', labelUrdu: 'ماہانہ قسط و فیس', labelEn: 'Dues' },
            { id: 'aid', labelUrdu: 'کفالت و امداد', labelEn: 'Death Aid' },
            { id: 'general', labelUrdu: 'نظم و ضبط', labelEn: 'Governance' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                  : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {language === 'ur' ? c.labelUrdu : c.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Print-Only Official Constitution Header */}
      <div className="hidden print-only mb-6 text-center border-b-2 border-slate-900 pb-4">
        <h1 className="text-2xl font-black text-slate-950 font-urdu">
          دستور و باضابطہ قواعد و ضوابط — کفالتِ میت فنڈ ویلفیئر سوسائٹی
        </h1>
        <p className="text-xs text-slate-700 font-bold mt-1">
          سپین کانہ کلان، ڈاکخانہ چراٹ، تحصیل و ضلع نوشہرہ (خیبر پختونخوا) | رجسٹرڈ فلاحی تنظیم
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          مجموعی 19 قواعد و ضوابط برائے باہمی تعاون، تجہیز و تکفین، اور تعزیتی کفالت
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1 print:gap-3">
        {filteredRules.map(rule => (
          <div
            key={rule.id}
            className="rule-print-card p-5 rounded-2xl bg-white dark:bg-emerald-950/80 border-2 border-emerald-200 dark:border-emerald-900/60 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between print:border-slate-400 print:p-4 print:shadow-none"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200 print:bg-slate-200 print:text-black">
                  {language === 'ur' ? `قاعدہ نمبر ${rule.id}` : `Rule #${rule.id}`}
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 print:text-slate-700">
                  {rule.category}
                </span>
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-100 font-urdu mb-2 print:text-black">
                {language === 'ur' ? rule.titleUrdu : rule.titleEn}
              </h3>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-emerald-200/90 leading-relaxed font-urdu font-medium print:text-slate-950">
                {language === 'ur' ? rule.contentUrdu : rule.contentEn}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-100/60 dark:border-emerald-900/50 flex items-center justify-between text-[11px] text-slate-500 print:border-slate-300">
              <span className="flex items-center gap-1 text-emerald-800 dark:text-emerald-400 font-bold print:text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'پاسداری لازمی ہے' : 'Mandatory Compliance'}</span>
              </span>
              <span className="font-mono text-[10px] font-bold">§{rule.id}.KMF</span>
            </div>
          </div>
        ))}
      </div>

      {/* Important Note (اہم نوٹ) Banner */}
      <div className="rule-print-card p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30 print:border-slate-400 print:bg-white print:p-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 print:bg-slate-800">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-base text-emerald-950 dark:text-emerald-100 font-urdu mb-1 print:text-black">
              {language === 'ur' ? 'اہم نوٹ برائے ممبران:' : 'Important Note for All Members:'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-emerald-200/90 leading-relaxed font-urdu font-semibold print:text-slate-950">
              {language === 'ur' ? importantNote.urdu : importantNote.en}
            </p>
          </div>
        </div>
      </div>

      {/* Print-Only Official Attestation Footer */}
      <div className="hidden print-only mt-8 pt-4 border-t-2 border-slate-900 flex justify-between items-center text-xs">
        <div>
          <p className="font-bold">دستخط و مہر خزانچی فنڈ</p>
          <p className="font-mono text-slate-600">محمد اقبال خٹک (0346-9100998)</p>
        </div>
        <div className="text-right">
          <p className="font-bold">کفالتِ میت فنڈ باضابطہ تصدیق</p>
          <p className="text-slate-500 text-[10px]">نوشہرہ، کے پی کے، پاکستان</p>
        </div>
      </div>
    </div>
  );
};
