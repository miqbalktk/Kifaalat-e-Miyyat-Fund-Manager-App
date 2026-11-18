import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Layers,
  Building2,
  Calendar,
  Send,
  Trash2
} from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';

interface MemberPaymentSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMonths?: number;
  defaultAmount?: number;
}

export const MemberPaymentSubmissionModal: React.FC<MemberPaymentSubmissionModalProps> = ({
  isOpen,
  onClose,
  defaultMonths = 1,
  defaultAmount
}) => {
  const { language, currentUser, members } = useApp();

  const [memberName, setMemberName] = useState(currentUser.name || '');
  const [monthsCount, setMonthsCount] = useState<number>(defaultMonths);
  const [amountPaid, setAmountPaid] = useState<number>(defaultAmount || defaultMonths * 300);
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [trxNumber, setTrxNumber] = useState('');
  const [paymentChannel, setPaymentChannel] = useState('EasyPaisa / JazzCash (ایزی پیسہ / جاز کیش)');
  const [senderBankDetails, setSenderBankDetails] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleMonthsChange = (months: number) => {
    setMonthsCount(months);
    setAmountPaid(months * 300);
  };

  const attachReceiptFile = async (file: File, dataUrl: string) => {
    setReceiptFile(file);
    setReceiptFileName(file.name);
    setReceiptImage(dataUrl);
    setProofUrl(null);
    setShareNote(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          attachReceiptFile(file, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setReceiptImage(null);
    setReceiptFile(null);
    setReceiptFileName('');
    setProofUrl(null);
    setShareNote(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const buildPlainWaMessage = () => {
    const proofLine = proofUrl
      ? `• رسید اسکرین شاٹ لنک: ${proofUrl}`
      : receiptImage
      ? '• رسید ثبوت: رسید کی تصویر/اسکرین شاٹ ساتھ منسلک ہے۔'
      : '• رسید: براہ کرم تصدیق فرمائیں۔';

    return [
      `السلام علیکم ورحمۃ اللہ، جناب ایڈمن و خزانچی محمد اقبال خٹک (0346-9100998)!`,
      `میں نے کفالتِ میت فنڈ کی قسط ادا کر دی ہے، تفصیلات درج ذیل ہیں:`,
      `• ممبر کا نام: ${memberName || currentUser.name}`,
      `• ادا شدہ رقم: مبلغ Rs. ${amountPaid.toLocaleString()} روپے`,
      `• مہینوں کی تعداد: ${monthsCount} ماہ`,
      `• تاریخ ادائیگی: ${paymentDate}`,
      `• ٹرانزیکشن / رسید نمبر: ${trxNumber || 'رسید منسلک ہے'}`,
      `• ادائیگی کا چینل / ذریعہ: ${paymentChannel}`,
      senderBankDetails ? `• ممبر بینک تفصیلات: ${senderBankDetails}` : null,
      proofLine,
      `\nبرائے مہربانی ریکارڈ میں درج فرما کر باضابطہ رسید جاری فرما لیں۔ جزاکم اللہ خیرا۔`
    ].filter(Boolean).join('\n');
  };

  const constructWaMessage = () => encodeURIComponent(buildPlainWaMessage());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawText = buildPlainWaMessage();
    const waText = encodeURIComponent(rawText);
    const adminPhone = '923469100998';
    const waUrl = `https://api.whatsapp.com/send?phone=${adminPhone}&text=${waText}`;

    // 1. Mobile Web Share API with attached image file synchronously on first tick
    if (receiptFile && typeof navigator !== 'undefined' && navigator.canShare) {
      try {
        if (navigator.canShare({ files: [receiptFile] })) {
          await navigator.share({
            files: [receiptFile],
            title: 'KMF Contribution Receipt Proof',
            text: rawText
          });
          setShareNote(
            language === 'ur'
              ? 'رسید کی تصویر اور پیغام شیئر ہو گئے! WhatsApp پر محمد اقبال (0346-9100998) کو بھیجیں۔'
              : 'Receipt screenshot shared with details! Send to Muhammad Iqbal (0346-9100998).'
          );
          setIsSuccess(true);
          return;
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    // 2. Desktop/Browser fallback: copy to clipboard + download image + open WhatsApp with proof link
    if (receiptFile) {
      let copied = false;
      try {
        if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          await navigator.clipboard.write([
            new ClipboardItem({ [receiptFile.type || 'image/png']: receiptFile })
          ]);
          copied = true;
        }
      } catch {}

      if (receiptImage) {
        try {
          const a = document.createElement('a');
          a.href = receiptImage;
          a.download = receiptFileName || 'kmf_receipt_screenshot.png';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            if (document.body.contains(a)) document.body.removeChild(a);
          }, 2000);
        } catch {}
      }

      setShareNote(
        language === 'ur'
          ? copied
            ? 'رسید کلپ بورڈ پر کاپی اور ڈاؤنلوڈ ہو گئی ہے (اور تصویر کا لنک پیغام میں شامل ہے)۔'
            : 'رسید ڈاؤنلوڈ ہو گئی ہے اور تصویر کا لنک واٹس ایپ پیغام میں شامل کر دیا گیا ہے۔'
          : copied
          ? 'Receipt screenshot copied to clipboard, downloaded, and proof link added to WhatsApp message.'
          : 'Receipt screenshot downloaded and proof link added to WhatsApp message.'
      );
    }

    // Direct WhatsApp link trigger via real anchor element
    const waAnchor = document.createElement('a');
    waAnchor.href = waUrl;
    waAnchor.target = '_blank';
    waAnchor.rel = 'noopener noreferrer';
    document.body.appendChild(waAnchor);
    waAnchor.click();
    setTimeout(() => {
      if (document.body.contains(waAnchor)) document.body.removeChild(waAnchor);
    }, 2000);

    setIsSuccess(true);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 my-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004d30] text-white">
          <div className="flex items-center gap-2.5">
            <Send className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-base font-urdu">
                {language === 'ur' ? 'ادائیگی تفصیلات برائے خزانچی' : 'Submit Payment Details to Khazanchi'}
              </h3>
              <p className="text-[11px] text-emerald-200">
                {language === 'ur' ? 'ایڈمن و خزانچی واٹس ایپ: 03469100998' : 'Treasurer Direct WhatsApp: 03469100998'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors text-emerald-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Instruction Note */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs">
            <span className="font-bold text-[#004d30] dark:text-emerald-300 block mb-0.5">
              Enter your Transiction details (Payment channal, transiction number, date etc) here to sent to admin on his whatsapp.
            </span>
            <span className="text-slate-600 dark:text-slate-300 font-urdu text-[11px]">
              اپنی ٹرانزیکشن کی تفصیلات (ادائیگی کا ذریعہ، رسید یا ٹرانزیکشن نمبر، تاریخ وغیرہ) یہاں درج کریں تاکہ ایڈمن کو ان کے واٹس ایپ پر براہِ راست ارسال کی جا سکیں۔
            </span>
          </div>

          {isSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-base text-emerald-900 dark:text-emerald-100 font-urdu">
                {language === 'ur' ? 'تفصیلات کامیابی سے واٹس ایپ پر روانہ کر دی گئیں!' : 'Payment Details Forwarded to WhatsApp!'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {language === 'ur'
                  ? 'خزانچی محمد اقبال تصدیق فرما کر جلد آپ کے نمبر پر باضابطہ رسید جاری فرمائیں گے۔'
                  : 'Treasurer Muhammad Iqbal will verify and issue the official receipt shortly.'}
              </p>
              {shareNote && (
                <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-200 bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-emerald-300 dark:border-emerald-700">
                  {shareNote}
                </p>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <a
                  href={`https://api.whatsapp.com/send?phone=923469100998&text=${constructWaMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{language === 'ur' ? 'واٹس ایپ چیٹ کھولیں (0346-9100998)' : 'Open WhatsApp Chat (0346-9100998)'}</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  {language === 'ur' ? 'بند کریں' : 'Close'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Member Name */}
              <div>
                <label className="block text-slate-700 dark:text-emerald-300 mb-1 font-bold">
                  {language === 'ur' ? 'ممبر کا نام (Member Name):' : 'Member Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={e => setMemberName(e.target.value)}
                  placeholder="e.g. Muhammad Iqbal / Member Full Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Number of Months & Amount Paid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-emerald-300 mb-1 font-bold">
                    {language === 'ur' ? 'مہینوں کی تعداد (Months Count):' : 'Number of Months:'}
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 mb-1.5">
                    {[1, 2, 3, 6, 12].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleMonthsChange(m)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          monthsCount === m
                            ? 'bg-[#004d30] text-white border-[#004d30]'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {m} {language === 'ur' ? 'ماہ' : 'm'}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={monthsCount}
                    onChange={e => {
                      const m = parseInt(e.target.value) || 1;
                      handleMonthsChange(m);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-emerald-300 mb-1 font-bold">
                    {language === 'ur' ? 'ادا شدہ رقم (Amount Paid - PKR):' : 'Amount Paid (PKR):'}
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={amountPaid}
                    onChange={e => setAmountPaid(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-amber-300 font-mono font-extrabold text-base"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Rs. 300 × {monthsCount} month(s) = Rs. {(monthsCount * 300).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Channel & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-emerald-300 mb-1 font-bold">
                    {language === 'ur' ? 'ادائیگی کا چینل / ذریعہ (Payment Channel):' : 'Payment Channel:'}
                  </label>
                  <select
                    value={paymentChannel}
                    onChange={e => setPaymentChannel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="EasyPaisa / JazzCash (ایزی پیسہ / جاز کیش)">Member's EasyPaisa / JazzCash (ایزی پیسہ / جاز کیش)</option>
                    <option value="Member Bank Online Transfer (بینک آن لائن ٹرانسفر)">Member Bank Transfer (بینک آن لائن ٹرانسفر)</option>
                    <option value="Cash on Hand to Khazanchi (خزانچی کو نقد ادائیگی)">Cash on Hand to Khazanchi (خزانچی کو نقد ادائیگی)</option>
                    <option value="Bank Cheque / Pay Order (بینک چیک یا پے آرڈر)">Bank Cheque / Pay Order (بینک چیک یا پے آرڈر)</option>
                    <option value="HBL Konnect / Omni Agent (کنیکٹ یا اومنی ایجنٹ)">HBL Konnect / Omni Agent (کنیکٹ یا اومنی ایجنٹ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-emerald-300 mb-1 font-bold">
                    {language === 'ur' ? 'تاریخِ ادائیگی (Payment Date):' : 'Payment Date:'}
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Transaction Number */}
              <div>
                <label className="block text-slate-700 dark:text-emerald-300 mb-1 font-bold">
                  {language === 'ur' ? 'ٹرانزیکشن / رسید نمبر (Transaction / Receipt No):' : 'Transaction / Receipt Reference No:'}
                </label>
                <input
                  type="text"
                  required
                  value={trxNumber}
                  onChange={e => setTrxNumber(e.target.value)}
                  placeholder="e.g. TID-982347101 / رسید نمبر یا کیش وصولی سلپ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              {/* Optional Bank Details if bank transfer */}
              {paymentChannel.includes('Bank') && (
                <div>
                  <label className="block text-slate-700 dark:text-emerald-300 mb-1 font-bold">
                    {language === 'ur' ? 'ممبر بینک تفصیلات (اختیاری - Bank Name & Account):' : 'Member Bank Details (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={senderBankDetails}
                    onChange={e => setSenderBankDetails(e.target.value)}
                    placeholder="e.g. Meezan Bank / HBL / UBL - Account Title / Number"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              )}

              {/* Receipt Snap Attachment (File Upload or Mobile Camera) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-emerald-400/60 dark:border-emerald-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {language === 'ur' ? 'رسید کا اسکرین شاٹ یا تصویر منسلک کریں:' : 'Attach Receipt Screenshot / Photo:'}
                    </span>
                  </div>
                  {receiptImage && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'ur' ? 'حذف کریں' : 'Remove'}</span>
                    </button>
                  )}
                </div>

                {receiptImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-700 bg-black/5 flex items-center gap-3 p-2">
                    <img
                      src={receiptImage}
                      alt="Receipt preview"
                      className="w-20 h-20 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block truncate max-w-xs">
                        ✓ {receiptFileName || 'Receipt_Attachment.png'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {isUploadingProof
                          ? (language === 'ur' ? 'تصویر محفوظ ہو رہی ہے...' : 'Preparing screenshot link...')
                          : proofUrl
                          ? (language === 'ur' ? 'تصویر و لنک واٹس ایپ کے لیے تیار ہیں ✓' : 'Screenshot & proof link ready ✓')
                          : (language === 'ur' ? 'تصویر منسلک ہو گئی، واٹس ایپ پر روانہ کی جائے گی۔' : 'Ready to forward via WhatsApp.')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Hidden inputs */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* From Phone/PC Storage */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'ur' ? 'گیلری / فائل سے منتخب کریں' : 'Upload from Phone/PC'}</span>
                    </button>

                    {/* Open Live Camera Viewfinder */}
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>{language === 'ur' ? 'موبائل کیمرہ سے تصویر لیں' : 'Take Camera Photo'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Whatsapp the payment details to Khazanchi</span>
                </button>
                <span className="text-[11px] text-slate-500 text-center block mt-1.5">
                  Direct WhatsApp: <strong>0346-9100998</strong> (Muhammad Iqbal Khattak, Treasurer)
                </span>
              </div>
            </form>
          )}

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
