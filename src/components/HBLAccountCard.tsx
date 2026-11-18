import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Copy, CheckCircle2, Download, Building2, User, CreditCard, ShieldCheck } from 'lucide-react';
import { fundAccountInfo } from '../data/accountInfo';
import { useApp } from '../context/AppContext';

interface HBLAccountCardProps {
  className?: string;
  showTitleBanner?: boolean;
}

export const HBLAccountCard: React.FC<HBLAccountCardProps> = ({
  className = '',
  showTitleBanner = true,
}) => {
  const { language } = useApp();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const bank = fundAccountInfo.bankAccount;

  // Generate QR Code with high resolution
  useEffect(() => {
    // Generate QR payload for HBL / Raast
    const qrText = `IBAN:${bank.iban};TITLE:${bank.accountTitle};ACC:${bank.accountNumber};BANK:HBL`;
    QRCode.toDataURL(
      qrText,
      {
        width: 320,
        margin: 1,
        color: {
          dark: '#004d30',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [bank]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `HBL_QR_Muhammad_Iqbal_${bank.accountNumber}.png`;
    a.click();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Toast Notification */}
      {copiedKey && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 bg-[#004d30] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>
            {copiedKey === 'acc'
              ? 'اکاؤنٹ نمبر کاپی ہو گیا! / Account Number copied'
              : 'IBAN نمبر کاپی ہو گیا! / IBAN copied'}
          </span>
        </div>
      )}

      {/* Main Container Styled Exactly like Official Picture */}
      <div className="relative rounded-3xl p-4 sm:p-6 lg:p-7 border-2 border-emerald-600/70 shadow-xl overflow-hidden bg-gradient-to-b from-[#f2f9f4] via-[#eef7f0] to-[#e5f4e8] dark:from-emerald-950 dark:via-emerald-900 dark:to-teal-950">
        
        {/* Subtle Decorative Curved Islamic Pattern Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-700" />

        {/* Responsive Layout for Mobile, Tablet (Portrait & Landscape), and Desktop */}
        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          


          {/* Column 2: Account Details Card (Clean card with structured rows, protected against RTL inversion) */}
          <div className="flex-1 min-w-0 bg-white dark:bg-emerald-950/90 rounded-2xl p-4 sm:p-6 shadow-sm border border-emerald-200/80 dark:border-emerald-800 flex flex-col justify-center space-y-3.5">
            
            {/* 1. Bank */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm pb-2.5 border-b border-emerald-100/80 dark:border-emerald-800/60">
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#004d30] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 className="w-4 h-4 text-emerald-200" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-emerald-200">
                  Bank Name
                </span>
              </div>
              <div dir="ltr" className="text-left sm:text-right font-bold text-slate-900 dark:text-white">
                Habib Bank Limited (HBL)
              </div>
            </div>

            {/* 2. Account Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm pb-2.5 border-b border-emerald-100/80 dark:border-emerald-800/60">
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#004d30] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <User className="w-4 h-4 text-emerald-200" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-emerald-200">
                  Account Title
                </span>
              </div>
              <div dir="ltr" className="text-left sm:text-right font-extrabold text-[#004d30] dark:text-amber-300 text-sm sm:text-base">
                Muhammad Iqbal
              </div>
            </div>

            {/* 3. Account Number */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm pb-2.5 border-b border-emerald-100/80 dark:border-emerald-800/60">
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#004d30] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CreditCard className="w-4 h-4 text-emerald-200" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-emerald-200">
                  Account Number
                </span>
              </div>
              <div className="flex items-center gap-2 justify-between sm:justify-end">
                <span dir="ltr" className="font-mono font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-wider select-all">
                  {bank.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bank.accountNumber, 'acc')}
                  className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors cursor-pointer shrink-0"
                  title="Copy Account Number"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4. IBAN Number */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#004d30] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-emerald-200">
                  IBAN Number
                </span>
              </div>
              <div className="flex items-center gap-2 justify-between sm:justify-end overflow-hidden">
                <span dir="ltr" className="font-mono font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm tracking-wider select-all whitespace-nowrap overflow-x-auto">
                  {bank.iban}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bank.iban, 'iban')}
                  className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors cursor-pointer shrink-0"
                  title="Copy IBAN Number"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Column 3: Official QR Code Box (Guaranteed fixed square aspect ratio) */}
          <div className="w-full sm:w-56 lg:w-48 xl:w-56 shrink-0 flex flex-col items-center justify-center bg-white dark:bg-emerald-950 rounded-2xl p-4 shadow-sm border border-emerald-300 dark:border-emerald-800 mx-auto">
            <div className="relative p-2.5 bg-white rounded-xl shadow-xs border border-slate-100 w-44 h-44 flex items-center justify-center shrink-0">
              {qrDataUrl ? (
                <div className="relative w-40 h-40">
                  <img
                    src={qrDataUrl}
                    alt="HBL Payment QR Code - Muhammad Iqbal"
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                  {/* HBL Center Logo Badge */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-9 h-9 rounded-full bg-[#004d30] border-2 border-white shadow-md flex items-center justify-center">
                      <div className="flex items-center justify-center text-[9px] font-black text-amber-400">
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                          <circle cx="12" cy="12" r="10" fill="#004d30" />
                          <path d="M8 8L16 12L8 16" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 8L20 12L12 16" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-40 h-40 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-400">
                  Loading QR...
                </div>
              )}
            </div>

            {/* Bottom Green Badge underneath QR code */}
            <div className="mt-2.5 w-full bg-[#004d30] text-white py-1.5 px-3 rounded-full text-center shadow-sm">
              <p className="text-xs font-bold leading-tight">
                Muhammad Iqbal
              </p>
              <p dir="ltr" className="text-[10px] font-mono text-emerald-200 leading-tight">
                Acc: {bank.accountNumber}
              </p>
            </div>

            {/* Download QR button */}
            <button
              type="button"
              onClick={downloadQrCode}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>{language === 'ur' ? 'کیو آر کوڈ محفوظ کریں' : 'Save QR Image'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
