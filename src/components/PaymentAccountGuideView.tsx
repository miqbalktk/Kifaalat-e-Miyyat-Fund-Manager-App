import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fundAccountInfo } from '../data/accountInfo';
import { HBLAccountCard } from './HBLAccountCard';
import { CameraCaptureModal } from './CameraCaptureModal';
import {
  MessageCircle,
  Phone,
  Mail,
  ShieldCheck,
  Send,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';

export const PaymentAccountGuideView: React.FC = () => {
  const { language, t, members, currentUser } = useApp();

  const [monthsCount, setMonthsCount] = useState<number>(1);
  const [customMonths, setCustomMonths] = useState<string>('1');
  const [isCustomMonths, setIsCustomMonths] = useState<boolean>(false);
  const [selectedMemberName, setSelectedMemberName] = useState(currentUser.name || '');
  const [trxId, setTrxId] = useState('');
  const [paymentChannel, setPaymentChannel] = useState("Member's EasyPaisa / JazzCash (ایزی پیسہ / جاز کیش)");
  const [senderBankDetails, setSenderBankDetails] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [waStatusBanner, setWaStatusBanner] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const monthlyRate = fundAccountInfo.paymentRules.monthlyAmount || 300;
  const effectiveMonths = isCustomMonths ? Math.max(1, parseInt(customMonths) || 1) : monthsCount;
  const calculatedTotal = effectiveMonths * monthlyRate;
  const [customAmount, setCustomAmount] = useState<string>('');

  const displayAmount = customAmount ? parseInt(customAmount) || calculatedTotal : calculatedTotal;

  // Guidelines list from committee
  const guidelines =
    language === 'ur'
      ? fundAccountInfo.paymentRules.guidelineUrdu
      : language === 'ar'
      ? fundAccountInfo.paymentRules.guidelineAr
      : fundAccountInfo.paymentRules.guidelineEn;

  const handleAdvanceMonthSelect = (months: number) => {
    setIsCustomMonths(false);
    setMonthsCount(months);
    setCustomMonths(months.toString());
    setCustomAmount('');
  };

  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) return;
    setProofSubmitted(true);
    setTimeout(() => {
      setProofSubmitted(false);
      setTrxId('');
    }, 4500);
  };

  const attachReceiptFile = async (file: File, dataUrl: string) => {
    setReceiptFile(file);
    setReceiptFileName(file.name);
    setReceiptImage(dataUrl);
    setProofUrl(null);
    setWaStatusBanner(null);

    try {
      setIsUploadingProof(true);
      const res = await fetch('/api/receipt-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: dataUrl, fileName: file.name }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.url) {
          setProofUrl(`${window.location.origin}${json.url}`);
        }
      }
    } catch (err) {
      console.warn('Proof upload skipped:', err);
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        attachReceiptFile(file, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const buildPlainWaMessage = () => {
    const proofLine = proofUrl
      ? `• رسید اسکرین شاٹ لنک: ${proofUrl}`
      : receiptImage
      ? '• رسید ثبوت: ادائیگی رسید کا اسکرین شاٹ ساتھ منسلک ہے۔'
      : '• رسید: براہ کرم تصدیق فرمائیں۔';

    return [
      'السلام علیکم ورحمۃ اللہ، جناب ایڈمن و خزانچی محمد اقبال خٹک (0346-9100998)!',
      'میں نے کفالتِ میت فنڈ کی قسط ادا کر دی ہے، تفصیلات درج ذیل ہیں:',
      `• ممبر کا نام: ${selectedMemberName || currentUser.name}`,
      `• ادا شدہ رقم: مبلغ ${displayAmount.toLocaleString()} روپے`,
      `• ادائیگی چینل / طریقہ: ${paymentChannel}`,
      senderBankDetails ? `• ممبر بینک تفصیلات: ${senderBankDetails}` : null,
      `• رسید / ٹرانزیکشن نمبر: ${trxId || 'رسید منسلک ہے'}`,
      `• تاریخ ادائیگی: ${paymentDate}`,
      `• برائے مدت: ${effectiveMonths} ماہ`,
      proofLine,
      '',
      'براہ کرم تصدیق فرما کر سسٹم میں اندراج اور رسید جاری فرما لیں۔ جزاکم اللہ خیرا۔'
    ]
      .filter(line => line !== null)
      .join('\n');
  };

  const waMessage = encodeURIComponent(buildPlainWaMessage());

  const handleWhatsappPaymentForward = async () => {
    const adminPhone = '923469100998';
    const rawMsg = buildPlainWaMessage();
    const waUrl = `https://api.whatsapp.com/send?phone=${adminPhone}&text=${encodeURIComponent(rawMsg)}`;

    // 1. Mobile / Web Share API with attached image file (synchronous check on first gesture tick)
    if (receiptFile && typeof navigator !== 'undefined' && navigator.canShare) {
      try {
        if (navigator.canShare({ files: [receiptFile] })) {
          await navigator.share({
            files: [receiptFile],
            title: 'KMF Contribution Payment Proof',
            text: rawMsg,
          });
          setWaStatusBanner(
            language === 'ur'
              ? 'رسید کی تصویر اور تفصیلات کامیابی سے شیئر کر دی گئیں! براہ کرم WhatsApp پر محمد اقبال (0346-9100998) منتخب کریں۔'
              : 'Receipt photo and payment details shared! Select WhatsApp -> Muhammad Iqbal (0346-9100998).'
          );
          return;
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    // 2. Desktop / Web fallback: copy image to clipboard + trigger download + open WhatsApp with hosted proof URL
    if (receiptFile) {
      let copiedToClipboard = false;
      try {
        if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          const mimeType = receiptFile.type || 'image/png';
          await navigator.clipboard.write([new ClipboardItem({ [mimeType]: receiptFile })]);
          copiedToClipboard = true;
        }
      } catch {}

      if (receiptImage) {
        try {
          const dl = document.createElement('a');
          dl.href = receiptImage;
          dl.download = receiptFileName || `kmf-receipt-${Date.now()}.png`;
          document.body.appendChild(dl);
          dl.click();
          setTimeout(() => {
            try {
              if (document.body.contains(dl)) document.body.removeChild(dl);
            } catch {}
          }, 2000);
        } catch {}
      }

      setWaStatusBanner(
        language === 'ur'
          ? copiedToClipboard
            ? 'رسید کلپ بورڈ پر کاپی اور ڈاؤنلوڈ ہو گئی ہے (اور تصویر کا لنک پیغام میں شامل ہے)۔ واٹس ایپ چیٹ کھلنے پر Ctrl+V یا اٹیچ کریں۔'
            : 'رسید کی تصویر ڈاؤنلوڈ ہو گئی ہے اور تصویر کا لنک واٹس ایپ پیغام میں شامل کر دیا گیا ہے۔'
          : copiedToClipboard
          ? 'Receipt screenshot copied to clipboard, downloaded, and proof link attached in the WhatsApp message. Paste (Ctrl+V) or attach in chat!'
          : 'Receipt screenshot downloaded and proof link included in the WhatsApp message.'
      );
    }

    const waAnchor = document.createElement('a');
    waAnchor.href = waUrl;
    waAnchor.target = '_blank';
    waAnchor.rel = 'noopener noreferrer';
    document.body.appendChild(waAnchor);
    waAnchor.click();
    setTimeout(() => {
      try {
        if (document.body.contains(waAnchor)) document.body.removeChild(waAnchor);
      } catch {}
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Official Account Card with QR Code (Strictly according to user's picture) */}
      <HBLAccountCard />

      {/* Advanced Multi-Month Contribution Section */}
      <div className="bg-white dark:bg-emerald-950 rounded-3xl border-2 border-emerald-500/30 dark:border-emerald-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004d30] dark:text-emerald-300 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'ur'
                  ? 'پیشگی اقساط کی ادائیگی کی سہولت'
                  : language === 'ar'
                  ? 'سداد الاشتراكات لعدة أشهر مقدماً'
                  : 'Advance Multi-Month Payment Calculator'}
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white font-urdu">
              {language === 'ur'
                ? 'اراکین ایک یا ایک سے زائد مہینوں کی اقساط پیشگی جمع کروا سکتے ہیں'
                : language === 'ar'
                ? 'يمكن للأعضاء سداد اشتراكات عدة أشهر مقدماً في دفعة واحدة'
                : 'Members can pay contributions for multiple months in advance'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-emerald-300/80 mt-0.5">
              {language === 'ur'
                ? `ماہانہ قسط کی رقم فی ممبر مبلغ ${monthlyRate} روپے ہے۔ مطلوبہ مہینے منتخب کر کے کل رقم ملاحظہ فرمائیں۔`
                : `Monthly pledge is PKR ${monthlyRate} per member. Select months to calculate total advance amount.`}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">
              {language === 'ur' ? 'کل واجب الادا رقم' : 'Total Amount'}:
            </span>
            <span className="text-2xl font-black text-[#004d30] dark:text-amber-400 font-mono">
              Rs. {calculatedTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quick Month Selector Buttons */}
        <div className="mt-5 space-y-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-emerald-200">
            {language === 'ur'
              ? 'کتنے مہینوں کی رقم پیشگی ادا کرنا چاہتے ہیں؟'
              : language === 'ar'
              ? 'حدد عدد أشهر السداد المسبق:'
              : 'Select Number of Months to Pay in Advance:'}
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { months: 1, labelUrdu: '1 ماہ (300 روپے)', labelEn: '1 Month (Rs. 300)' },
              { months: 2, labelUrdu: '2 ماہ (600 روپے)', labelEn: '2 Months (Rs. 600)' },
              { months: 3, labelUrdu: '3 ماہ (900 روپے)', labelEn: '3 Months (Rs. 900)' },
              { months: 6, labelUrdu: '6 ماہ (1800 روپے)', labelEn: '6 Months (Rs. 1,800)' },
              { months: 12, labelUrdu: '12 ماہ (3600 روپے)', labelEn: '1 Year (Rs. 3,600)' },
            ].map(item => {
              const isSelected = !isCustomMonths && monthsCount === item.months;
              return (
                <button
                  key={item.months}
                  type="button"
                  onClick={() => handleAdvanceMonthSelect(item.months)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-[#004d30] text-white border-[#004d30] shadow-md ring-2 ring-emerald-400/40'
                      : 'bg-emerald-50/60 dark:bg-emerald-900/30 text-slate-800 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <span className="block text-sm font-black font-mono">{item.months} {language === 'ur' ? 'ماہ' : 'Mo'}</span>
                  <span className="text-[11px] opacity-90 block mt-0.5 font-urdu">
                    {language === 'ur' ? item.labelUrdu : item.labelEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Months Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="customMonthsToggle"
                checked={isCustomMonths}
                onChange={e => setIsCustomMonths(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="customMonthsToggle" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                {language === 'ur' ? 'دیگر مہینوں کی مخصوص تعداد درج کریں:' : 'Enter custom number of months:'}
              </label>
            </div>

            {isCustomMonths && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customMonths}
                  onChange={e => setCustomMonths(e.target.value)}
                  className="w-24 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/60 text-sm font-mono font-bold text-center"
                />
                <span className="text-xs text-slate-500">
                  × Rs. {monthlyRate} = <strong className="text-emerald-700 dark:text-emerald-300">Rs. {calculatedTotal.toLocaleString()}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notice of Coverage with Focus Mode Styles & Photo/Camera Receipt Attachment */}
        <div
          style={{ backgroundColor: '#70dc41' }}
          className="mt-4 p-4 rounded-2xl border-2 border-emerald-500/60 text-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-950 shrink-0" />
            <span className="font-bold text-xs sm:text-sm text-slate-950 font-urdu leading-snug">
              {language === 'ur'
                ? `پیشگی ادائیگی: ${effectiveMonths} ماہ کا مکمل تحفظ (کل رقم: Rs. ${calculatedTotal.toLocaleString()})۔ رسید منسلک کر کے واٹس ایپ پر مطلع فرمائیں۔`
                : `Advance Payment covers ${effectiveMonths} month(s) (Total: PKR ${calculatedTotal.toLocaleString()}). Attach receipt screenshot to forward to Khazanchi.`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Hidden native file & camera inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelected}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelected}
              className="hidden"
            />

            {/* Button to attach screenshot from storage */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{ backgroundColor: '#1d0099' }}
              className="px-3.5 py-2 rounded-xl text-white font-bold text-xs whitespace-nowrap flex items-center gap-1.5 shadow-md cursor-pointer hover:opacity-95 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>
                {receiptImage
                  ? (language === 'ur' ? 'رسید منسلک ہے ✓' : 'Receipt Attached ✓')
                  : (language === 'ur' ? 'رسید منسلک کریں (گیلری)' : 'Attach Receipt File')}
              </span>
            </button>

            {/* Button to open live Camera viewfinder modal */}
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              style={{ backgroundColor: '#1d0099' }}
              className="px-3.5 py-2 rounded-xl text-white font-bold text-xs whitespace-nowrap flex items-center gap-1.5 shadow-md cursor-pointer hover:opacity-95 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>{language === 'ur' ? 'کیمرہ سے تصویر' : 'Take Camera Photo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Online Notification & Proof Submission in App */}
      <div className="bg-white dark:bg-emerald-950 rounded-3xl border border-emerald-200 dark:border-emerald-800 p-6 shadow-sm">
        <div className="max-w-xl">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <span>
              {language === 'ur'
                ? 'ادائیگی کے بعد ٹرانزیکشن رسید کی اطلاع خزانچی کو ارسال کریں'
                : 'Submit Payment Notification to Treasurer'}
            </span>
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 mb-4 font-semibold">
            Enter your Transiction details (Payment channal, transiction number, date etc) here to sent to admin on his whatsapp.
            <span className="block text-slate-500 font-urdu mt-0.5 font-normal">
              اپنی ٹرانزیکشن کی تفصیلات (ادائیگی کا چینل، ٹرانزیکشن نمبر، تاریخ وغیرہ) یہاں درج کریں تاکہ ایڈمن کو ان کے واٹس ایپ پر بھیجی جا سکیں۔
            </span>
          </p>

          {proofSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 text-emerald-900 dark:text-emerald-100 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                {language === 'ur'
                  ? `ٹرانزیکشن اطلاع کامیابی سے درج ہو گئی۔ خزانچی محمد اقبال تصدیق کے بعد فوری سرکاری رسید جاری کریں گے۔`
                  : 'Transaction proof submitted successfully to Treasurer Muhammad Iqbal.'}
              </span>
            </div>
          ) : (
            <form onSubmit={handleProofSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-emerald-300 mb-1 font-bold">
                    {language === 'ur' ? 'ممبر کا نام (Member Name)' : 'Member Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedMemberName}
                    onChange={e => setSelectedMemberName(e.target.value)}
                    placeholder="Muhammad Iqbal / Member Name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-emerald-300 mb-1 font-bold">
                    {language === 'ur' ? 'ادا شدہ رقم (روپے) - Amount Paid' : 'Amount Paid (PKR)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={customAmount !== '' ? customAmount : calculatedTotal}
                    onChange={e => setCustomAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-amber-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-emerald-300 mb-1 font-bold">
                    {language === 'ur' ? 'ادائیگی کا ذریعہ / چینل (Payment Channel)' : 'Payment Channel'}
                  </label>
                  <select
                    value={paymentChannel}
                    onChange={e => setPaymentChannel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="Member's EasyPaisa / JazzCash (ایزی پیسہ / جاز کیش)">Member's EasyPaisa / JazzCash (ایزی پیسہ / جاز کیش)</option>
                    <option value="Member Bank Online Transfer (بینک آن لائن ٹرانسفر)">Member Bank Transfer (بینک آن لائن ٹرانسفر)</option>
                    <option value="Cash on Hand to Khazanchi (خزانچی کو نقد ادائیگی)">Cash on Hand to Khazanchi (خزانچی کو نقد ادائیگی)</option>
                    <option value="Bank Cheque / Pay Order (بینک چیک یا پے آرڈر)">Bank Cheque / Pay Order (بینک چیک یا پے آرڈر)</option>
                    <option value="HBL Konnect / Omni Agent (کنیکٹ یا اومنی ایجنٹ)">HBL Konnect / Omni Agent (کنیکٹ یا اومنی ایجنٹ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-emerald-300 mb-1 font-bold">
                    {language === 'ur' ? 'تاریخ ادائیگی (Payment Date)' : 'Payment Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Optional sender bank details */}
              {paymentChannel.includes('Bank') && (
                <div>
                  <label className="block text-slate-700 dark:text-emerald-300 mb-1 font-bold">
                    {language === 'ur' ? 'ممبر بینک تفصیلات (Bank Name & Account)' : 'Member Bank Details:'}
                  </label>
                  <input
                    type="text"
                    value={senderBankDetails}
                    onChange={e => setSenderBankDetails(e.target.value)}
                    placeholder="e.g. Meezan Bank / HBL / UBL - Account Title or Number"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-emerald-300 mb-1 font-bold">
                  {language === 'ur' ? 'رسید نمبر یا ٹرانزیکشن ریفرنس (Receipt / Transaction Ref)' : 'Receipt / Transaction Ref ID'}
                </label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={e => setTrxId(e.target.value)}
                  placeholder="e.g. TID-98124018 یا رسید سلپ نمبر"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              {/* Attached Receipt Preview */}
              {receiptImage && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={receiptImage}
                      alt="Receipt Attachment"
                      className="w-14 h-14 object-cover rounded-xl border border-emerald-400"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-800 dark:text-emerald-200 block truncate max-w-xs">
                        {receiptFileName || 'Receipt_Snap.png'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {isUploadingProof
                          ? (language === 'ur' ? 'تصویر محفوظ ہو رہی ہے...' : 'Preparing screenshot link...')
                          : proofUrl
                          ? (language === 'ur' ? 'رسید تصویر و لنک واٹس ایپ کے لیے تیار ہیں ✓' : 'Screenshot & direct proof link ready for WhatsApp ✓')
                          : (language === 'ur' ? 'رسید منسلک ہو گئی ہے' : 'Receipt attached')}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptImage(null);
                      setReceiptFile(null);
                      setReceiptFileName('');
                      setProofUrl(null);
                      setWaStatusBanner(null);
                    }}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Mandatory Snapshot Notice on WhatsApp */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-tight text-xs">
                  <span className="font-bold font-urdu block mb-0.5">
                    {language === 'ur'
                      ? 'لازمی ہدایت: رسید کی تصویر / اسکرین شاٹ واٹس ایپ پر ارسال فرمائیں'
                      : 'Required: Attach Receipt Screenshot on WhatsApp'}
                  </span>
                  <span className="text-[11px] text-amber-900/90 dark:text-amber-300/90">
                    {language === 'ur'
                      ? 'فارم بھیجنے کے بعد واٹس ایپ بٹن دبا کر رسید کا اسکرین شاٹ ایڈمن/خزانچی محمد اقبال خٹک کے واٹس ایپ نمبر 03469100998 پر لازماً روانہ کریں۔'
                      : 'Send the screenshot of your payment receipt on WhatsApp 03469100998 to Admin/Treasurer Muhammad Iqbal Khattak.'}
                  </span>
                </div>
              </div>

              {waStatusBanner && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5">
                  <p className="font-semibold">{waStatusBanner}</p>
                  <a
                    href={`https://api.whatsapp.com/send?phone=923469100998&text=${waMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 underline font-bold"
                  >
                    <span>{language === 'ur' ? 'واٹس ایپ چیٹ دوبارہ کھولیں' : 'Open WhatsApp Chat (0346-9100998)'}</span>
                  </a>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleWhatsappPaymentForward}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer text-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Whatsapp the payment details to Khazanchi</span>
                </button>

                <button
                  type="submit"
                  className="px-4 py-3 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'ur' ? 'ایپ میں اطلاع درج کریں' : 'Notify in App'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Official Guidelines */}
      <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-3xl border border-amber-200 dark:border-amber-900/60 p-6 shadow-sm">
        <h4 className="font-bold text-sm text-amber-950 dark:text-amber-200 mb-3 flex items-center gap-2 font-urdu">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>
            {language === 'ur'
              ? 'کفالتِ میت فنڈ کمیٹی کے اہم مالیاتی اصول و ہدایات'
              : language === 'ar'
              ? 'الضوابط والتعليمات المالية لصندوق كفالة الميت'
              : 'Key Financial Policies & Payment Guidelines'}
          </span>
        </h4>
        <ul className="space-y-2 text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed list-disc list-inside">
          {guidelines.map((rule, idx) => (
            <li key={idx} className="font-medium">
              {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* Treasurer Contact Banner */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
            {language === 'ur' ? 'نگراں و خزانچی' : 'Treasurer & Administrator'}
          </span>
          <h4 className="font-bold text-sm sm:text-base text-white">
            Muhammad Iqbal (0334-9100998)
          </h4>
          <p className="text-xs text-slate-300">
            {language === 'ur'
              ? 'خط و کتابت اور واٹس ایپ برائے رسید: +923469100998 | کالنگ رابطہ: 03349100998'
              : 'WhatsApp for correspondence: +923469100998 | Calling Contact: 03349100998'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/923469100998"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
          <a
            href="tel:03349100998"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
        </div>
      </div>
      {/* Live Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        language={language}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(dataUrl, file) => attachReceiptFile(file, dataUrl)}
        onFallbackFilePick={() => cameraInputRef.current?.click()}
      />
    </div>
  );
};
