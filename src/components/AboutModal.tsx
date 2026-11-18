import React from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import {
  User,
  Phone,
  Mail,
  Award,
  ShieldCheck,
  Heart,
  X,
  MessageCircle,
  Sparkles,
  BookOpen,
  Calendar,
  Building2,
  CheckCircle2,
  CreditCard
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      {/* Islamic Arched Container with Rich Texture */}
      <div className="relative w-full max-w-xl bg-[#fcfaf6] dark:bg-emerald-950 rounded-3xl shadow-2xl border-4 border-amber-500/80 my-6 overflow-hidden text-slate-900 dark:text-emerald-50">
        
        {/* Islamic Star / Geometric Texture Pattern (SVG) */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L37 15L52 8L45 23L60 30L45 37L52 52L37 45L30 60L23 45L8 52L15 37L0 30L15 23L8 8L23 15Z' fill='%23004d30' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Top Header Islamic Arch (Mihrab Design) in Rich Emerald & Gold */}
        <div className="relative bg-gradient-to-b from-[#004d30] via-[#024028] to-[#003820] text-white pt-7 pb-6 px-6 text-center border-b-4 border-amber-400">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 rounded-full text-emerald-100 hover:text-white hover:bg-white/20 transition-colors z-20 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Bismillah Calligraphy */}
          <div className="text-base sm:text-lg font-serif text-amber-300 font-bold tracking-widest font-urdu drop-shadow-md mb-2">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>

          {/* Logo with Gold Ring Accent */}
          <div className="inline-flex items-center justify-center p-1 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-emerald-400 shadow-xl ring-4 ring-amber-400/50 mb-2.5">
            <BrandLogo size={68} className="w-16 h-16 sm:w-18 sm:h-18" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white font-urdu tracking-wide">
            {language === 'ur'
              ? 'کفالتِ میت فنڈ کمیٹی'
              : language === 'ar'
              ? 'صندوق كفالة الميت الخيري'
              : 'Kifaalat e Miyyat Fund'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium font-urdu mt-1 max-w-md mx-auto">
            {language === 'ur'
              ? 'انجمنِ باہمی امداد برائے تجہیز و تکفین، جنازہ و کفالتِ پسماندگان'
              : language === 'ar'
              ? 'جمعية التكافل التبادلي للجنائز وتجهيز الموتى وكفالة أسرهم'
              : 'Mutual Bereavement Support & Funeral Charity Society'}
          </p>
        </div>

        {/* Modal Body with High Contrast Clear Typography */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Section 1: Official Developer & Khazanchi Card (Prominently featuring Muhammad Iqbal) */}
          <div className="rounded-2xl bg-white dark:bg-emerald-900/60 border-2 border-emerald-700/40 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b-2 border-amber-400/80 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#004d30] text-amber-300 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#004d30] dark:text-emerald-200">
                    {language === 'ur'
                      ? 'نگراں، ڈویلپر و خزانچی تفصیلات'
                      : 'App Developer & Designated Treasurer'}
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-emerald-300 font-semibold">
                    Kifaalat e Miyyat Fund Committee (Pakistan)
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#004d30] text-amber-300 border border-amber-400">
                Official
              </span>
            </div>

            {/* Officer Details List */}
            <div className="space-y-3 text-xs">
              
              {/* Name */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800">
                <span className="text-slate-700 dark:text-emerald-200 flex items-center gap-2 font-semibold">
                  <User className="w-4 h-4 text-[#004d30] dark:text-emerald-400" />
                  <span>{language === 'ur' ? 'نام نگراں و خزانچی:' : 'Treasurer & Developer:'}</span>
                </span>
                <span className="font-extrabold text-[#004d30] dark:text-amber-300 text-sm">
                  Muhammad Iqbal
                </span>
              </div>

              {/* WhatsApp Contact for Correspondence */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800">
                <span className="text-slate-700 dark:text-emerald-200 flex items-center gap-2 font-semibold">
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'ur' ? 'واٹس ایپ برائے خط و کتابت (پاکستان):' : 'WhatsApp Correspondence (PK):'}</span>
                </span>
                <a
                  href="https://wa.me/923469100998"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-black text-emerald-700 dark:text-emerald-300 hover:underline text-sm flex items-center gap-1"
                >
                  <span>0346-9100998</span>
                  <span className="text-[10px] text-emerald-600 font-bold">(+92)</span>
                </a>
              </div>

              {/* Calling Phone */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800">
                <span className="text-slate-700 dark:text-emerald-200 flex items-center gap-2 font-semibold">
                  <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'ur' ? 'براہِ راست کالنگ رابطہ:' : 'Direct Calling Contact:'}</span>
                </span>
                <a
                  href="tel:03349100998"
                  className="font-mono font-black text-slate-900 dark:text-white hover:underline text-sm"
                >
                  0334-9100998
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800">
                <span className="text-slate-700 dark:text-emerald-200 flex items-center gap-2 font-semibold">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>{language === 'ur' ? 'ای میل ایڈریس:' : 'Official Email:'}</span>
                </span>
                <a
                  href="mailto:miqbalktk@gmail.com"
                  className="font-mono font-bold text-slate-800 dark:text-emerald-200 hover:underline"
                >
                  miqbalktk@gmail.com
                </a>
              </div>

              {/* Official HBL Bank Account */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#004d30] to-[#024028] text-white">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Habib Bank Limited (HBL)</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-200">Official Account</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-200 block text-[10px]">Title:</span>
                    <strong className="text-white">Muhammad Iqbal</strong>
                  </div>
                  <div>
                    <span className="text-emerald-200 block text-[10px]">Account No:</span>
                    <strong className="font-mono text-amber-300">11815901035603</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-emerald-600/40">
                    <span className="text-emerald-200 block text-[10px]">IBAN:</span>
                    <strong className="font-mono text-[11px] text-white break-all">PK49HABB0011815901035603</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Action Contact Buttons */}
            <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-800 flex items-center gap-2.5">
              <a
                href="https://wa.me/923469100998?text=السلام%20علیکم%20محمد%20اقبال%20صاحب،%20کفالتِ%20میت%20فنڈ%20کے%20حوالے%20سے%20رابطہ%20کرنا%20مطلوب%20ہے۔"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-101 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp (0346-9100998)</span>
              </a>
              <a
                href="tel:03349100998"
                className="px-4 py-2.5 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call (0334)</span>
              </a>
            </div>
          </div>

          {/* Section 2: Core Purpose & Principles */}
          <div className="rounded-2xl bg-white dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 p-4 space-y-3 text-xs">
            <h4 className="font-bold text-[#004d30] dark:text-emerald-200 flex items-center gap-2 text-sm font-urdu">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ur' ? 'فنڈ کے اغراض و مقاصد اور طریقہ کار' : 'Core Objectives & Structure'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-900">
                <span className="font-bold text-[#004d30] dark:text-amber-300 block mb-1">
                  {language === 'ur' ? 'ماہانہ قسط اور پیشگی سہولت:' : 'Monthly & Advance Dues:'}
                </span>
                <p className="text-slate-700 dark:text-emerald-200 leading-relaxed">
                  {language === 'ur'
                    ? '300 روپے فی ممبر، ہر ماہ کی 10 تاریخ تک واجب الادا ہے۔ اراکین متعدد مہینوں کی اقساط پیشگی بھی جمع کروا سکتے ہیں۔'
                    : 'PKR 300 per member household, due by 10th of every month. Members can pay for multiple months in advance.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-900">
                <span className="font-bold text-[#004d30] dark:text-amber-300 block mb-1">
                  {language === 'ur' ? 'فوتگی پر باہمی کفالت:' : 'Bereavement Relief Benefit:'}
                </span>
                <p className="text-slate-700 dark:text-emerald-200 leading-relaxed">
                  {language === 'ur'
                    ? 'فوتگی کی صورت میں سوئم سے قبل لواحقین کو کفالت گرانٹ بلا تاخیر ادا کی جاتی ہے تاکہ تدفین و ضروری اخراجات کا بوجھ نہ پڑے۔'
                    : 'Immediate financial aid disbursed before Soyem to cover all funeral and bereavement expenses.'}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-emerald-200/90 leading-relaxed">
              {language === 'ur'
                ? 'یہ ایپلیکیشن مکمل شفافیت، ڈیجیٹل آڈٹ لاگز، خودکار رسیدوں اور ممبران کے حقوق کے تحفظ کے لیے تیار کی گئی ہے۔'
                : 'Designed for transparent recordkeeping, verified receipts, and robust member protection.'}
            </p>
          </div>

          {/* Solace Quranic / Hadith Inspiration */}
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900 text-center">
            <p className="text-xs font-bold text-amber-950 dark:text-amber-200 font-urdu italic leading-relaxed">
              “مَن عَزَّى مُصَابًا فَلَهُ مِثْلُ أَجْرِهِ”
            </p>
            <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">
              (جامع الترمذی - جس نے کسی مصیبت زدہ کی تعزیت و دلجوئی کی، اس کے لیے بھی اس جیسا اجر ہے)
            </span>
          </div>



          {/* Close Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-[#004d30] hover:bg-[#023e27] text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
            >
              {t.common.close}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
