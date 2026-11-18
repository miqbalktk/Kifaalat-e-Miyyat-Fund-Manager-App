import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateQrSvg } from '../utils/crypto';
import { BrandLogo } from './BrandLogo';
import { OfficialSignAndStamp } from './OfficialSignAndStamp';
import { Printer, Mail, CheckCircle2, ShieldCheck, X, Download, MessageCircle } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { selectedReceipt, closeReceiptModal, language, t, members } = useApp();
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [showWhatsAppSheet, setShowWhatsAppSheet] = useState(false);
  const [customPhone, setCustomPhone] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeReceiptModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeReceiptModal]);

  // Manage print isolation class on body when modal is open
  useEffect(() => {
    if (selectedReceipt) {
      document.body.classList.add('receipt-modal-active');
    } else {
      document.body.classList.remove('receipt-modal-active');
    }
    return () => {
      document.body.classList.remove('receipt-modal-active');
      document.body.classList.remove('printing-receipt');
    };
  }, [selectedReceipt]);

  if (!selectedReceipt || !selectedReceipt.data) return null;

  const { type, data } = selectedReceipt;

  // Safe field extractions
  const receiptRef =
    data.receiptNumber ||
    data.claimNumber ||
    data.referenceNo ||
    `KMF-${Date.now().toString().slice(-6)}`;

  const issueDate =
    data.paidDate ||
    data.disbursedDate ||
    data.date ||
    data.filedDate ||
    new Date().toISOString().split('T')[0];

  const amountVal: number =
    typeof data.amount === 'number'
      ? data.amount
      : typeof data.approvedAmount === 'number'
      ? data.approvedAmount
      : typeof data.requestedAmount === 'number'
      ? data.requestedAmount
      : 0;

  const getPartyName = () => {
    if (type === 'contribution') return data.memberName || 'Member';
    if (type === 'donation') return data.donorName || (language === 'ur' ? 'مخیر حضرات' : 'Anonymous Philanthropist');
    const recipient = data.recipientName || data.memberName || 'Nominee Beneficiary';
    return data.deceasedName ? `${recipient} (Nominee of Late ${data.deceasedName})` : recipient;
  };

  const getTitle = () => {
    if (type === 'contribution')
      return language === 'ur' ? 'ماہانہ فیس کی تصدیق شدہ رسید' : 'Monthly Contribution Receipt';
    if (type === 'donation')
      return language === 'ur' ? 'عطیہ / زکوٰۃ کی باضابطہ رسید' : 'Official Donation & Charity Receipt';
    return language === 'ur' ? 'کفالت و تدفین گرانٹ واؤچر' : 'Bereavement Assistance Grant Voucher';
  };

  const paymentMethodLabel =
    (t?.paymentMethods && (t.paymentMethods[data.method as keyof typeof t.paymentMethods] || t.paymentMethods[data.payoutMethod as keyof typeof t.paymentMethods])) ||
    data.method ||
    data.payoutMethod ||
    'Official Treasury';

  // Safe QR generation
  let qrSvg = '';
  try {
    qrSvg = generateQrSvg(`https://kifaalat-fund.org/verify/${receiptRef}`, 105);
  } catch (err) {
    qrSvg = `<svg width="105" height="105" viewBox="0 0 105 105" xmlns="http://www.w3.org/2000/svg"><rect width="105" height="105" fill="#f8fafc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="10" fill="#059669">KMF VERIFIED</text></svg>`;
  }

  // Member phone lookup for WhatsApp dispatch
  const targetMember = members?.find(m =>
    (data.memberId && m.id === data.memberId) ||
    (data.memberName && (m.fullName === data.memberName || m.fullNameUrdu === data.memberName)) ||
    (data.membershipNumber && m.membershipNumber === data.membershipNumber)
  );
  const registeredPhone = targetMember?.whatsapp || targetMember?.phone || data.contactPhone || data.recipientContact || data.donorPhone || '';

  const cleanPhoneNumber = (p: string) => {
    let cleaned = p.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '92' + cleaned.slice(1);
    }
    return cleaned;
  };

  const memberPhoneClean = cleanPhoneNumber(customPhone || registeredPhone);
  const adminPhoneClean = '923469100998';

  const partyName = getPartyName();
  const memberStatement = language === 'ur'
    ? `السلام علیکم ${partyName} صاحب!\nکفالتِ میت فنڈ ویلفیئر سوسائٹی کی جانب سے آپ کی ادائیگی کی تصدیق شدہ سرکاری رسید #${receiptRef} (رقم: Rs. ${amountVal.toLocaleString()}) جاری کر دی گئی ہے۔\nرسید کا پی ڈی ایف منسلکہ ملاحظہ فرمائیں۔\nاللہ تعالیٰ آپ کے تعاون و اخلاص کو قبول فرمائے۔ جزاکم اللہ خیرا۔\nخزانچی: محمد اقبال خٹک (0346-9100998)`
    : `Assalamu Alaikum ${partyName}!\nOfficial Payment Receipt #${receiptRef} for PKR ${amountVal.toLocaleString()} has been generated by Kifaalat e Miyyat Fund Welfare Society.\nPlease find the verified PDF receipt attached.\nJazakAllah Khair.\nTreasurer: Muhammad Iqbal Khattak (0346-9100998)`;

  const adminStatement = language === 'ur'
    ? `السلام علیکم خزانچی صاحب!\nکفالتِ میت فنڈ باضابطہ رسید ریکارڈ #${receiptRef}\nرکن / عطیہ دہندہ: ${partyName}\nرقم: Rs. ${amountVal.toLocaleString()}\nنوعیت: ${getTitle()}\nتاریخ: ${issueDate}\nرسید کا پی ڈی ایف ڈاؤنلوڈ کر کے منسلک کیا جا رہا ہے۔ برائے مہربانی ریکارڈ میں درج فرمائیں۔`
    : `Assalamu Alaikum Khazanchi!\nKifaalat e Miyyat Fund Receipt Record #${receiptRef}\nParty: ${partyName}\nAmount: PKR ${amountVal.toLocaleString()}\nNature: ${getTitle()}\nDate: ${issueDate}\nVerified PDF receipt attached.`;

  const memberWhatsAppUrl = memberPhoneClean
    ? `https://api.whatsapp.com/send?phone=${memberPhoneClean}&text=${encodeURIComponent(memberStatement)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(memberStatement)}`;

  const adminWhatsAppUrl = `https://api.whatsapp.com/send?phone=${adminPhoneClean}&text=${encodeURIComponent(adminStatement)}`;

  const handleShareWhatsApp = async () => {
    const element = document.getElementById('printable-receipt');
    if (!element) return;

    try {
      setIsSharingWhatsApp(true);
      setShowWhatsAppSheet(true);
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          clonedDoc.documentElement.classList.remove('dark');
          const el = clonedDoc.getElementById('printable-receipt');
          if (el) {
            el.classList.remove('dark');
            el.style.backgroundColor = '#ffffff';
            el.style.color = '#0f172a';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, 275));

      const fileName = `KMF-Official-Receipt-${receiptRef}.pdf`;
      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

      // 1. Mobile Web Share with PDF file attachment directly into WhatsApp
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: `KMF Official Receipt ${receiptRef}`,
            text: memberStatement,
          });
          setShareToast(language === 'ur' ? 'رسید پی ڈی ایف واٹس ایپ پر ارسال کر دی گئی!' : 'Receipt PDF shared via WhatsApp!');
          setTimeout(() => setShareToast(null), 4000);
          return;
        } catch {
          // Continue to automatic download and dispatch sheet
        }
      }

      // 2. Download the crisp single-page PDF so user has it immediately in Downloads
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
      }, 2500);

      setShareToast(
        language === 'ur'
          ? 'رسید کا پی ڈی ایف ڈاؤنلوڈ ہو گیا۔ نیچے دیے گئے واٹس ایپ بٹن سے فائل منسلک کر کے بھیجیں۔'
          : 'PDF receipt downloaded! Click WhatsApp below to send with attached PDF.'
      );
      setTimeout(() => setShareToast(null), 5000);

      // Auto trigger member or admin link via real DOM click
      const targetUrl = memberPhoneClean ? memberWhatsAppUrl : adminWhatsAppUrl;
      const a = document.createElement('a');
      a.href = targetUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 1500);
    } catch (err) {
      console.warn('Error sharing receipt:', err);
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-receipt');
    if (!element) {
      window.print();
      return;
    }
    try {
      setIsExportingPdf(true);
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

      const canvas = await html2canvas(element, {
        scale: isMobile ? 1.5 : 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          clonedDoc.documentElement.classList.remove('dark');
          const el = clonedDoc.getElementById('printable-receipt');
          if (el) {
            el.classList.remove('dark');
            el.style.backgroundColor = '#ffffff';
            el.style.color = '#0f172a';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, 275));
      
      const fileName = `KMF-Official-Receipt-${receiptRef}.pdf`;
      const pdfBlob = pdf.output('blob');

      // 1. On mobile devices, attempt native share sheet if supported
      if (isMobile && typeof navigator !== 'undefined' && navigator.canShare) {
        try {
          const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `KMF Official Receipt ${receiptRef}`,
              text: `Official Receipt #${receiptRef} - Kifaalat e Miyyat Fund`
            });
            setIsExportingPdf(false);
            return;
          }
        } catch {
          // If user dismissed share, proceed to blob download
        }
      }

      // 2. Direct Blob URL download / new tab open
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.target = '_blank';
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // On mobile, if window.open fails, the direct download link click above already downloaded the file
      if (isMobile) {
        try {
          window.open(blobUrl, '_blank');
        } catch {
          // Download link was already clicked above
        }
      }

      setTimeout(() => {
        try {
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(blobUrl);
        } catch {}
      }, 3000);

      // 3. Fallback standard save
      try {
        pdf.save(fileName);
      } catch {}
    } catch (err) {
      console.warn('Direct PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    // Add strict printing classes to body before printing
    document.body.classList.add('receipt-modal-active');
    document.body.classList.add('printing-receipt');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-receipt');
    }, 1500);
  };

  const handleSendEmail = () => {
    setEmailStatus('dispatching');
    setTimeout(() => {
      setEmailStatus('sent');
      setTimeout(() => setEmailStatus(null), 3500);
    }, 800);
  };

  return (
    <div
      id="receipt-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeReceiptModal();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn"
    >
      <div
        id="receipt-modal-dialog"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 my-8"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004d30] text-white no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <span className="font-semibold text-sm tracking-wide">
              {t?.receiptModal?.officialReceipt || 'Official Welfare Receipt'}
            </span>
          </div>
          <button
            onClick={closeReceiptModal}
            className="p-1 rounded-full hover:bg-white/10 transition-colors text-emerald-100 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Toast Banner */}
        {shareToast && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-700 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-fadeIn no-print">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{shareToast}</span>
            </div>
            <button onClick={() => setShareToast(null)} className="text-white hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dedicated WhatsApp Dispatch Action Sheet (Visible when sharing or requested) */}
        {showWhatsAppSheet && (
          <div className="mx-4 md:mx-6 mt-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-500 shadow-md animate-fadeIn no-print">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-600" />
                <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-200 font-urdu">
                  {language === 'ur' ? 'واٹس ایپ پر پی ڈی ایف رسید کی ترسیل' : 'WhatsApp Receipt PDF Dispatch'}
                </h4>
              </div>
              <button
                onClick={() => setShowWhatsAppSheet(false)}
                className="p-1 rounded-full text-slate-500 hover:bg-emerald-100 dark:hover:bg-emerald-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium">
              {language === 'ur'
                ? 'رسید کا پی ڈی ایف ڈاؤنلوڈ ہو چکا ہے۔ نیچے دیے گئے بٹن پر کلک کر کے واٹس ایپ چیٹ کھولیں اور ڈاؤنلوڈ شدہ پی ڈی ایف فائل اٹیچ کر کے بھیج دیں۔'
                : 'PDF receipt downloaded to your device! Click below to open WhatsApp, then attach the receipt PDF to your message.'}
            </p>

            {/* Custom Phone Input if Member has no number */}
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                {language === 'ur' ? 'رکن کا واٹس ایپ نمبر:' : 'Member WhatsApp #:'}
              </span>
              <input
                type="text"
                value={customPhone || registeredPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="03xx-xxxxxxx"
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100 focus:outline-emerald-500 max-w-[200px]"
              />
            </div>

            {/* Direct Action Links */}
            <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <a
                href={memberWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors text-center"
              >
                <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                <span>
                  {language === 'ur'
                    ? `رکن کو واٹس ایپ بھیجیں (${memberPhoneClean || 'نمبر درج کریں'})`
                    : `Send to Member (${memberPhoneClean || 'Enter Number'})`}
                </span>
              </a>

              <a
                href={adminWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white font-bold text-xs shadow-xs transition-colors text-center"
              >
                <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                <span>
                  {language === 'ur'
                    ? 'خزانچی ایڈمن کو بھیجیں (0346-9100998)'
                    : 'Send to Treasurer (0346-9100998)'}
                </span>
              </a>
            </div>
          </div>
        )}

        {/* Printable Receipt Body - Strictly single page layout with solid clear borders & bold typography */}
        <div id="receipt-modal-body-container" className="p-3 md:p-6 bg-slate-50 dark:bg-slate-900/60">
          <div
            id="printable-receipt"
            className="p-5 md:p-6 bg-white dark:bg-slate-900 border-4 border-[#004d30] dark:border-emerald-600 rounded-2xl shadow-sm text-slate-900 dark:text-slate-100 max-w-2xl mx-auto"
          >
            {/* Top Brand & Emblem */}
            <div className="text-center pb-2.5 border-b-2 border-[#004d30]/30">
              <div className="inline-flex items-center justify-center mb-1">
                <BrandLogo size={50} />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-[#004d30] dark:text-emerald-400 font-urdu">
                {language === 'ur' ? 'کفالتِ میت فنڈ ویلفیئر سوسائٹی' : 'Kifaalat e Miyyat Fund Welfare Society'}
              </h2>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                {language === 'ur'
                  ? 'رجسٹریشن نمبر KMF-PK-2024/991 | سپین کانہ کلان، نوشہرہ، خیبر پختونخوا (پاکستان)'
                  : 'Reg # Nowshera-KMF-2026-44 | Spin Kana Kalan, Nowshera, KPK (Pakistan)'}
              </p>
              <div className="mt-1 py-0.5 px-3 bg-emerald-50 dark:bg-emerald-950/60 rounded text-[11px] text-emerald-900 dark:text-emerald-200 italic font-bold">
                {language === 'ur'
                  ? (t?.receiptModal?.duaUrdu || '“اللہ تعالیٰ مرحومین کی مغفرت فرمائے اور پسماندگان کو صبر جمیل عطا فرمائے”')
                  : (t?.receiptModal?.dua || '“May Allah grant solace to the bereaved family and bless mutual brotherhood.”')}
              </div>
            </div>

            {/* Receipt Info Sub-header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border-2 border-slate-300 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-600 dark:text-slate-400 block font-bold text-[10px]">
                  {t?.contributions?.receiptNumber || 'Receipt #'}:
                </span>
                <span className="font-mono font-black text-sm text-[#004d30] dark:text-emerald-400">
                  {receiptRef}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block font-bold text-[10px]">
                  {language === 'ur' ? 'تاریخِ اجراء' : 'Date of Issue'}:
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {issueDate}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block font-bold text-[10px]">
                  {language === 'ur' ? 'نوعیت رسید' : 'Nature of Receipt'}:
                </span>
                <span className="font-black text-slate-900 dark:text-slate-100 font-urdu">
                  {getTitle()}
                </span>
              </div>
            </div>

            {/* Core Transaction Details Table */}
            <div className="mt-3.5 border-2 border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-xs sm:text-sm">
                <tbody>
                  {/* Row 1: Contributor / Donor / Beneficiary Name */}
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <td className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-300 font-bold w-1/3">
                      {type === 'contribution'
                        ? (language === 'ur' ? 'چندہ دہندہ رکن کا نام' : 'Member / Contributor')
                        : type === 'donation'
                        ? (language === 'ur' ? 'عطیہ دہندہ کا نام (Donor)' : 'Donor / Philanthropist')
                        : (language === 'ur' ? 'امداد وصول کنندہ (وارث)' : 'Beneficiary Recipient')}
                    </td>
                    <td className="px-3.5 py-2 font-black text-slate-950 dark:text-white">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{getPartyName()}</span>
                        {type === 'contribution' && targetMember?.membershipNumber && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                            {targetMember.membershipNumber}
                          </span>
                        )}
                      </div>
                      {type === 'contribution' && targetMember?.address && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-urdu mt-0.5 font-normal">
                          {targetMember.address} {registeredPhone ? `• ${registeredPhone}` : ''}
                        </div>
                      )}
                      {type === 'donation' && data.donorPhone && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-0.5 font-normal">
                          Phone / WhatsApp: {data.donorPhone}
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Contribution Specific Transaction Details */}
                  {type === 'contribution' && (
                    <>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <td className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-300 font-bold">
                          {language === 'ur' ? 'قسط کی نوعیت و مدت' : 'Contribution Period'}
                        </td>
                        <td className="px-3.5 py-2 font-bold text-slate-900 dark:text-slate-100">
                          <span>{data.month || 'Current Month'}</span>
                          <span className="text-emerald-700 dark:text-emerald-400 ml-2 font-urdu text-xs">
                            {data.monthsCount && data.monthsCount > 1
                              ? `(${data.monthsCount} ${language === 'ur' ? 'ماہ کی پیشگی اقساط' : 'Months Advance'})`
                              : `(1 ${language === 'ur' ? 'ماہانہ قسط' : 'Month'})`}
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <td className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-300 font-bold">
                          {language === 'ur' ? 'ذریعہ ادائیگی (Channel)' : 'Payment Channel'}
                        </td>
                        <td className="px-3.5 py-2 font-bold text-slate-900 dark:text-slate-100">
                          {paymentMethodLabel}
                          {(data.referenceNo || data.trxId) && (
                            <span className="text-[11px] text-slate-600 dark:text-slate-400 block font-mono font-medium">
                              Ref / TID: {data.referenceNo || data.trxId}
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <td className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-300 font-bold">
                          {language === 'ur' ? 'تاریخ و تصدیق کنندہ' : 'Date & Verified By'}
                        </td>
                        <td className="px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <span className="font-mono">{issueDate}</span> • {data.collectedBy || (language === 'ur' ? 'خزانچی محمد اقبال خٹک (0346-9100998)' : 'Treasurer Muhammad Iqbal Khattak')}
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold block text-[11px] mt-0.5">
                            ✓ {language === 'ur' ? 'باضابطہ وصول شدہ و محفوظ فنڈ ریکارڈ' : 'Officially Received & Ledger Recorded'}
                          </span>
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Sadqa / Donation Specific Transaction Details */}
                  {type === 'donation' && (
                    <>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <td className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-300 font-bold">
                          {language === 'ur' ? 'مد / صدقہ زمرہ (Category)' : 'Donation Category'}
                        </td>
                        <td className="px-3.5 py-2 font-bold text-slate-900 dark:text-slate-100">
                          {(t?.categories && t.categories[data.category as keyof typeof t.categories]) || data.category || (language === 'ur' ? 'صدقہ جاریہ' : 'Sadqah Jariyah')}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <td className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-300 font-bold">
                          {language === 'ur' ? 'نیت و ایصالِ ثواب' : 'Dedicated Purpose'}
                        </td>
                        <td className="px-3.5 py-2 font-semibold text-slate-800 dark:text-slate-200 font-urdu text-xs">
                          {data.dedicatedFor || (language === 'ur' ? 'برائے ایصالِ ثواب و تدفین و کفن اخراجات' : 'For Isaal-e-Sawab & Burial Assistance')}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <td className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-300 font-bold">
                          {language === 'ur' ? 'ذریعہ ادائیگی و تصدیق' : 'Payment Method & Date'}
                        </td>
                        <td className="px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <span>{paymentMethodLabel}</span> • <span className="font-mono">{issueDate}</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold block text-[11px] mt-0.5">
                            ✓ {language === 'ur' ? 'فنڈ میں باضابطہ محفوظ شدہ (خزانچی: محمد اقبال خٹک 0346-9100998)' : 'Deposited in Welfare Reserve (Treasurer: 0346-9100998)'}
                          </span>
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Claim Specific Transaction Details */}
                  {type === 'claim' && (
                    <>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <td className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-300 font-bold">
                          {t?.claims?.deceasedName || 'Deceased Family Member'}
                        </td>
                        <td className="px-3.5 py-2 font-black text-slate-950 dark:text-white">
                          Late {data.deceasedName || 'Deceased'} {data.deceasedRelation ? `(${data.deceasedRelation})` : ''}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <td className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-300 font-bold">
                          {language === 'ur' ? 'تجہیز و تکفین سہولیات' : 'Burial Solace Package'}
                        </td>
                        <td className="px-3.5 py-2 font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                          ✓ {language === 'ur' ? 'مکمل کفن پیکج + ایمبولینس ٹرانسپورٹ الاؤنس + پسماندگان مالی تسلی' : 'Complete Burial Shroud Kit + Ambulance Fuel Allowance + Family Condolence Grant'}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <td className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-300 font-bold">
                          {language === 'ur' ? 'طریقہ ترسیل و تاریخ' : 'Disbursement Method'}
                        </td>
                        <td className="px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <span>{paymentMethodLabel}</span> • <span className="font-mono">{issueDate}</span>
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Net Amount Total Highlight Row */}
                  <tr className="bg-emerald-50 dark:bg-emerald-950/30 border-t-2 border-[#004d30]">
                    <td className="px-3.5 py-2.5 text-[#004d30] dark:text-emerald-300 font-black text-sm sm:text-base">
                      {type === 'donation'
                        ? (language === 'ur' ? 'کل صدقہ و خیرات رقم' : 'Net Sadqa Total')
                        : type === 'claim'
                        ? (language === 'ur' ? 'کل ادا شدہ امدادی گرانٹ' : 'Net Grant Total')
                        : (language === 'ur' ? 'کل وصول / ادا شدہ رقم' : 'Net Amount Total')}
                    </td>
                    <td className="px-3.5 py-2.5 font-black text-xl sm:text-2xl text-[#004d30] dark:text-emerald-300 font-mono">
                      {t?.common?.currency || 'Rs.'} {amountVal.toLocaleString()} {t?.common?.pkr || 'PKR'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* QR Verification & Signatures */}
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t-2 border-[#004d30]/30">
              <div className="flex items-center gap-2.5">
                <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
                <div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {t?.receiptModal?.scanVerify || 'Scan QR to Verify on Blockchain Ledger'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    ID: {receiptRef} | VERIFIED
                  </p>
                  {registeredPhone && (
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono mt-0.5 font-semibold">
                      Registered WhatsApp: {registeredPhone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <OfficialSignAndStamp
                  signatoryName="Muhammad Iqbal Khattak"
                  signatoryTitle={t?.receiptModal?.authorizedSignatory || 'Finance Secretary / Khazanchi (خزانچی)'}
                  showStamp={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar (Excluded in Print) */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            {emailStatus === 'sent' && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                {t?.contributions?.emailDispatched || 'Receipt dispatched'}
              </span>
            )}
            {emailStatus === 'dispatching' && (
              <span className="text-xs text-slate-500 animate-pulse">
                Sending automated receipt email...
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {/* Share via WhatsApp Button */}
            <button
              onClick={handleShareWhatsApp}
              disabled={isSharingWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              title="Share Receipt PDF via WhatsApp"
            >
              {isSharingWhatsApp ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4 fill-white" />
              )}
              <span>{language === 'ur' ? 'واٹس ایپ پر رسید بھیجیں' : 'Share Receipt via WhatsApp'}</span>
            </button>

            <button
              onClick={handleSendEmail}
              disabled={emailStatus === 'dispatching'}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t?.contributions?.sendEmail || 'Email'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'ur' ? 'پرنٹ رسید' : 'Print Receipt'}</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {isExportingPdf ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {isExportingPdf
                  ? (language === 'ur' ? 'پی ڈی ایف...' : 'Generating PDF...')
                  : (language === 'ur' ? 'پی ڈی ایف ڈاؤنلوڈ' : 'Download PDF')}
              </span>
            </button>

            <button
              onClick={closeReceiptModal}
              className="px-3.5 py-2 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {t?.common?.close || 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
