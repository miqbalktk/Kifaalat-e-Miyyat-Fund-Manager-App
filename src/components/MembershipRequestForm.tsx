import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserPlus,
  Send,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface MembershipRequestFormProps {
  onOpenRules?: () => void;
}

export const MembershipRequestForm: React.FC<MembershipRequestFormProps> = ({ onOpenRules }) => {
  const { language, t } = useApp();

  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [cnic, setCnic] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [monthlyPledge, setMonthlyPledge] = useState('300');
  const [dependentsCount, setDependentsCount] = useState('0');
  const [agreeRules, setAgreeRules] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !cnic.trim() || !whatsapp.trim()) {
      setError(
        language === 'ur'
          ? 'براہ کرم تمام لازمی خانے (نام، شناختی کارڈ نمبر، اور واٹس ایپ رابطہ) پُر فرمائیں۔'
          : 'Please complete all required fields (Full Name, CNIC, and WhatsApp Contact).'
      );
      return;
    }

    if (!agreeRules) {
      setError(
        language === 'ur'
          ? 'براہ کرم قواعد و ضوابط پڑھ کر اقرار نامے کے خانے کو منتخب فرمائیں۔'
          : 'Please read and accept the Society Rules & Regulations before submitting.'
      );
      return;
    }

    // Build the WhatsApp message
    const msg = encodeURIComponent(
      `السلام علیکم ورحمۃ اللہ وبرکاتہ جناب ایڈمنسٹریٹر محمد اقبال خٹک صاحب!\n` +
      `کفالتِ میت فنڈ ویلفیئر سوسائٹی (سپین کانہ، نوشہرہ)\n\n` +
      `*درخواست برائے شمولیت و رکنیت (Membership Application)*\n` +
      `• امیدوار کا نام: ${fullName.trim()}\n` +
      `• والد / شوہر کا نام: ${fatherName.trim() || '-'}\n` +
      `• قومی شناختی کارڈ (CNIC): ${cnic.trim()}\n` +
      `• واٹس ایپ / موبائل نمبر: ${whatsapp.trim()}\n` +
      `• رہائشی پتہ / گاؤں: ${address.trim() || 'سپین کانہ، نوشہرہ'}\n` +
      `• مجوزہ ماہانہ تعاون: مبلغ ${monthlyPledge} روپے\n` +
      `• اہل خانہ / زیرِ کفالت افراد: ${dependentsCount}\n` +
      `• اقرار نامہ: میں نے کفالتِ میت فنڈ سوسائٹی کے جملہ 19 قواعد و ضوابط بغور پڑھ لیے ہیں اور ان کی مکمل پابندی کا اقرار کرتا ہوں۔\n\n` +
      `برائے مہربانی میری درخواست کا جائزہ لے کر سوسائٹی میں بطور ممبر شامل فرمائیں۔ شکریہ!`
    );

    setIsSubmitted(true);

    // Open WhatsApp directly to Admin Muhammad Iqbal Khattak
    window.open(`https://wa.me/923469100998?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#004d30] via-[#023e27] to-[#012819] text-white p-6 rounded-3xl shadow-md border-2 border-emerald-500/30">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold mb-2">
          <UserPlus className="w-4 h-4 text-amber-300" />
          <span>{language === 'ur' ? 'کفالتِ میت فنڈ ویلفیئر سوسائٹی' : 'Kifaalat-e-Miyyat Fund Welfare Society'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-urdu">
          {language === 'ur' ? 'درخواست برائے نئی رکنیت (Membership Application Form)' : 'New Membership Application Form'}
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
          {language === 'ur'
            ? 'اگر آپ کفالتِ میت فنڈ میں شامل ہونا چاہتے ہیں تو نیچے دیا گیا فارم پُر کر کے براہ راست ایڈمنسٹریٹر محمد اقبال خٹک (0346-9100998) کو واٹس ایپ پر ارسال فرمائیں۔ بعد از جائزہ سوسائٹی آپ کو باقاعدہ رکنیت نمبر جاری کرے گی۔'
            : 'To join Kifaalat-e-Miyyat Fund, please fill out this form and submit it directly to Administrator Muhammad Iqbal Khattak on WhatsApp (0346-9100998) for consideration.'}
        </p>
      </div>

      {isSubmitted && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-100 text-xs font-semibold flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm font-urdu">
              {language === 'ur' ? 'درخواست واٹس ایپ پر تیار ہو کر بھیج دی گئی ہے!' : 'Application Dispatched to Admin on WhatsApp!'}
            </h4>
            <p className="text-[11px] mt-0.5">
              {language === 'ur'
                ? 'ایڈمنسٹریٹر محمد اقبال خٹک آپ کی درخواست کا جائزہ لے کر رابطہ فرمائیں گے۔ مزید تصدیق یا سوال کے لیے 0346-9100998 پر رابطہ کر سکتے ہیں۔'
                : 'Administrator Muhammad Iqbal Khattak will review your submission and contact you. You may also call 0346-9100998.'}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5 text-xs">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-urdu">
            {language === 'ur' ? 'امیدوار کی بنیادی معلومات' : 'Applicant Personal Information'}
          </h3>
          <p className="text-[11px] text-slate-500">
            {language === 'ur' ? 'تمام معلومات درست شناختی کارڈ کے مطابق درج فرمائیں' : 'Enter accurate details matching National ID card'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ur' ? 'امیدوار کا مکمل نام (Full Name): *' : 'Full Name: *'}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder={language === 'ur' ? 'مثلاً: محمد عثمان خٹک' : 'e.g. Mohammad Usman Khattak'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-hidden focus:border-emerald-600"
            />
          </div>

          {/* Father / Guardian Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ur' ? 'والد یا شوہر کا نام (Father / Husband Name):' : 'Father / Husband Name:'}
            </label>
            <input
              type="text"
              value={fatherName}
              onChange={e => setFatherName(e.target.value)}
              placeholder={language === 'ur' ? 'مثلاً: حاجی عبد الرحمٰن' : 'e.g. Haji Abdul Rehman'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-hidden focus:border-emerald-600"
            />
          </div>

          {/* CNIC */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ur' ? 'قومی شناختی کارڈ نمبر (CNIC): *' : 'National ID (CNIC): *'}
            </label>
            <input
              type="text"
              required
              value={cnic}
              onChange={e => setCnic(e.target.value)}
              placeholder="17201-XXXXXXX-X"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono outline-hidden focus:border-emerald-600"
            />
          </div>

          {/* WhatsApp / Contact */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ur' ? 'واٹس ایپ و رابطہ نمبر (WhatsApp / Phone): *' : 'WhatsApp Contact No: *'}
            </label>
            <input
              type="text"
              required
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="03XX-XXXXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono outline-hidden focus:border-emerald-600"
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ur' ? 'مکمل رہائشی پتہ (محلہ / گاؤں / تحصیل / ضلع):' : 'Residential Address:'}
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder={language === 'ur' ? 'مثلاً: سپین کانہ کلاں، تحصیل پبی، ضلع نوشہرہ، خیبر پختونخوا' : 'Spin Kana Kalan, Pabbi, Nowshera, KPK'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-hidden focus:border-emerald-600"
            />
          </div>

          {/* Monthly Pledge */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ur' ? 'ماہانہ فنڈ تعاون (روپے):' : 'Monthly Pledge Amount (PKR):'}
            </label>
            <input
              type="number"
              value={monthlyPledge}
              onChange={e => setMonthlyPledge(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-xs"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              {language === 'ur' ? 'سوسائٹی کا مقررہ چندہ 300 روپے فی کس ہے' : 'Official monthly fee is PKR 300 per member'}
            </p>
          </div>

          {/* Dependents Count */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ur' ? 'اہل خانہ / زیرِ کفالت افراد کی تعداد:' : 'Number of Family Dependents:'}
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={dependentsCount}
              onChange={e => setDependentsCount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
            />
          </div>
        </div>

        {/* Rules & Regulations Acceptance Checkbox */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="agreeRulesCheck"
                checked={agreeRules}
                onChange={e => setAgreeRules(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
              />
              <label htmlFor="agreeRulesCheck" className="text-xs font-bold leading-relaxed cursor-pointer font-urdu">
                {language === 'ur'
                  ? 'میں نے کفالتِ میت فنڈ ویلفیئر سوسائٹی کے جملہ 19 قواعد و ضوابط (دستور) بغور پڑھ لیے ہیں، ان سے مکمل متفق ہوں اور ہر ماہ کی 10 تاریخ تک پابندی کے ساتھ ماہانہ چندہ جمع کروانے اور تمام اصولوں کی پاسداری کا اقرار کرتا ہوں۔'
                  : 'I have read and solemnly accept all 19 Rules & Regulations of Kifaalat e Miyyat Fund Welfare Society, and agree to pay dues before the 10th of each month.'}
              </label>
            </div>

            {onOpenRules && (
              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={onOpenRules}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'قواعد و ضوابط (19 دفعات) پڑھیں' : 'View All 19 Rules & Regulations'}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit to WhatsApp Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-[#004d30] hover:from-emerald-700 hover:to-[#023e27] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 text-amber-300" />
            <span className="font-urdu text-sm">
              {language === 'ur'
                ? 'ایڈمنسٹریٹر محمد اقبال خٹک کو واٹس ایپ پر درخواست ارسال کریں (0346-9100998)'
                : 'Submit Application to Admin via WhatsApp (0346-9100998)'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
