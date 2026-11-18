import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { OfficialSignAndStamp } from './OfficialSignAndStamp';
import { getRecentMonthKeys, getContributionInflowForMonth } from '../utils/contributionHelpers';
import {
  BarChart3,
  Download,
  Printer,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    language,
    t,
    fundBalance,
    totalCollected,
    totalDisbursed,
    contributions,
    claims,
    donations,
    members
  } = useApp();

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleExportPdf = async () => {
    const element = document.getElementById('printable-report');
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
        windowWidth: 794,
        onclone: (clonedDoc) => {
          // Force clean light mode full-A4 width styling on cloned document
          clonedDoc.documentElement.classList.remove('dark');
          const el = clonedDoc.getElementById('printable-report');
          if (el) {
            el.classList.remove('dark');
            el.style.width = '794px';
            el.style.maxWidth = '794px';
            el.style.margin = '0';
            el.style.padding = '20px';
            el.style.borderRadius = '0';
            el.style.border = 'none';
            el.style.boxShadow = 'none';
            el.style.backgroundColor = '#ffffff';
            el.style.color = '#0f172a';
            if (el.parentElement) {
              el.parentElement.style.width = '794px';
              el.parentElement.style.maxWidth = '794px';
              el.parentElement.style.margin = '0';
              el.parentElement.style.padding = '0';
            }
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 5;
      const contentWidth = pageWidth - margin * 2; // 200mm full A4 content width
      const printableHeight = pageHeight - margin * 2; // 287mm
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
      heightLeft -= printableHeight;

      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
        heightLeft -= printableHeight;
      }

      const fileName = `KMF-Financial-Audit-Report-${new Date().toISOString().split('T')[0]}.pdf`;
      const pdfBlob = pdf.output('blob');

      // 1. Mobile Web Share
      if (isMobile && typeof navigator !== 'undefined' && navigator.canShare) {
        try {
          const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: fileName,
              text: 'Kifaalat e Miyyat Fund Financial Audit Report'
            });
            setIsExportingPdf(false);
            setSuccessToast(
              language === 'ur'
                ? 'پی ڈی ایف رپورٹ کامیابی سے تیار ہو گئی!'
                : 'PDF Report generated successfully!'
            );
            setTimeout(() => setSuccessToast(null), 4000);
            return;
          }
        } catch {}
      }

      // 2. Direct Blob download + jsPDF save fallback
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        try {
          if (document.body.contains(link)) document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        } catch {}
      }, 3000);

      try {
        pdf.save(fileName);
      } catch {}

      setSuccessToast(
        language === 'ur'
          ? 'پی ڈی ایف رپورٹ کامیابی سے تیار ہو گئی!'
          : 'PDF Report generated successfully!'
      );
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.warn('PDF export error, falling back to window.print:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    // Native print dialog
    window.print();
  };

  const handleExportCsv = () => {
    let csv = 'Type,Reference,Party,Date,Amount_PKR,Status\n';
    contributions.forEach(c => {
      csv += `Contribution,"${c.receiptNumber}","${c.memberName}","${c.paidDate || c.dueDate}",${c.amount},${c.status}\n`;
    });
    claims.forEach(clm => {
      csv += `Bereavement_Claim,"${clm.claimNumber}","Late ${clm.deceasedName} (${clm.memberName})","${clm.disbursedDate || clm.filedDate}",-${clm.approvedAmount},${clm.status}\n`;
    });
    donations.forEach(d => {
      csv += `Charity_Donation,"${d.receiptNumber}","${d.donorName}","${d.date}",${d.amount},paid\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kmf-transparent-ledger-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Separate Inflow breakdown: Member Contributions (Dues) vs Donations & Sadqaat
  const paidContributions = contributions.filter(c => c.status === 'paid');
  const totalContributionsAmount = paidContributions.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalDonationsAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

  // Dynamically calculate monthly breakdown strictly from actual app contributions (including multi-month advance share), donations & claims up to current month
  const recentMonthKeys = getRecentMonthKeys(6);
  const monthsData = recentMonthKeys.map(mStr => {
    const monthContributions = paidContributions
      .reduce((sum, c) => sum + getContributionInflowForMonth(c, mStr), 0);
    const monthDonations = donations
      .filter(d => d.date && d.date.startsWith(mStr))
      .reduce((sum, d) => sum + d.amount, 0);
    const monthClaims = claims
      .filter(c => c.status === 'disbursed' && c.disbursedDate && c.disbursedDate.startsWith(mStr))
      .reduce((sum, c) => sum + c.approvedAmount, 0);

    const [year, month] = mStr.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
    return {
      month: monthName,
      dues: monthContributions,
      donations: monthDonations,
      income: monthContributions + monthDonations,
      expense: monthClaims,
    };
  });

  const currentDateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 bg-[#004d30] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Bar with Action Buttons (Excluded from print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-urdu">
            {t.reports.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.reports.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t.reports.exportCsv}</span>
          </button>

          {/* Direct Print Button for Mobile & Desktop */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
            title={language === 'ur' ? 'رپورٹ براہ راست پرنٹ کریں' : 'Print Report directly'}
          >
            <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'ur' ? 'پرنٹ رپورٹ' : 'Print Report'}</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all cursor-pointer disabled:opacity-60"
          >
            {isExportingPdf ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>
              {isExportingPdf
                ? (language === 'ur' ? 'پی ڈی ایف تیار ہو رہی ہے...' : 'Generating PDF...')
                : (language === 'ur' ? 'پی ڈی ایف ڈاؤنلوڈ' : 'Download PDF')}
            </span>
          </button>
        </div>
      </div>

      {/* Printable Report Wrapper: Target for HTML2Canvas & Print */}
      <div
        id="printable-report"
        className="space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        {/* Official Society Letterhead / Print Header */}
        <div className="text-center pb-6 border-b-2 border-emerald-700/40">
          <div className="inline-flex items-center justify-center mb-3">
            <BrandLogo size={60} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-900 dark:text-emerald-400 font-urdu leading-tight">
            کفالتِ میت فنڈ ویلفیئر سوسائٹی
          </h1>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mt-0.5">
            Kifaalat e Miyyat Fund Welfare Society
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registered Non-Profit Community Welfare Fund | Spin Kana Kalan, Nowshera, KPK (Pakistan)
          </p>
          <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-3 py-1.5 px-4 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 font-semibold font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Report Date: {currentDateStr}</span>
            </span>
            <span>•</span>
            <span>Official Currency: PKR (Rs.)</span>
            <span>•</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Status: Audited & Verified</span>
          </div>
        </div>

        {/* Transparency Guarantee Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{t.reports.transparencyNote}</span>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block font-urdu">
              {language === 'ur' ? 'کل آمدنی کی علیحدہ تفصیل (Total Inflow)' : `${t.reports.totalIncome} (Separate Breakdown)`}
            </span>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                <div>
                  <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 block">
                    {language === 'ur' ? 'اراکین اقساط (Contributions)' : 'Contributions (Dues)'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {paidContributions.length} {language === 'ur' ? 'ادا شدہ رسیدیں' : 'paid entries'}
                  </span>
                </div>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  Rs. {totalContributionsAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <div>
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block">
                    {language === 'ur' ? 'عطیات و صدقات (Donations)' : 'Donations & Sadqaat'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {donations.length} {language === 'ur' ? 'عطیات اندراج' : 'charity gifts'}
                  </span>
                </div>
                <span className="text-base font-black text-amber-700 dark:text-amber-300 font-mono">
                  Rs. {totalDonationsAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-snug">
              {language === 'ur'
                ? 'اقساط اور عطیات کا مجموعہ Net Reserve Balance میں شامل ہے۔'
                : 'Combined Dues + Donations are reflected in Net Reserve Balance.'}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block font-urdu">
                {t.reports.totalDisbursed}
              </span>
              <span className="text-2xl font-black text-rose-600 mt-3 block font-mono">
                Rs. {totalDisbursed.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {language === 'ur'
                ? '100% رقم مستحق پسماندگان خاندانوں کو ادا کی گئی'
                : '100% granted directly to bereaved member families'}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block font-urdu">
                {t.reports.netBalance}
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-3 block font-mono">
                Rs. {fundBalance.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-2">
              {language === 'ur'
                ? 'اقساط + عطیات منفی ادائیگیاں (Audited Reserve)'
                : `Dues + Donations − Disbursed (Verified Bank Reserve)`}
            </p>
          </div>
        </div>

        {/* Monthly Cash Flow Visual Representation */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            {t.reports.monthlyBreakdown}
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Comparison of Monthly Inflow — Contributions & Donations (Green) vs Bereavement Claims Disbursed (Red)
          </p>

          <div className="space-y-4">
            {monthsData.map(m => {
              const highestVal = Math.max(10000, ...monthsData.map(item => Math.max(item.income, item.expense)));
              const incWidth = highestVal > 0 ? (m.income / highestVal) * 100 : 0;
              const expWidth = highestVal > 0 ? (m.expense / highestVal) * 100 : 0;

              return (
                <div key={m.month} className="space-y-1.5">
                  <div className="flex flex-wrap justify-between items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">{m.month}</span>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
                      <span className="text-slate-500">
                        (Dues: Rs. {m.dues.toLocaleString()} + Charity: Rs. {m.donations.toLocaleString()})
                      </span>
                      <span className="text-emerald-600 font-bold">+Rs. {m.income.toLocaleString()}</span>
                      <span className="text-rose-600 font-bold">-Rs. {m.expense.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${incWidth}%` }}
                      title={`Inflow: Rs. ${m.income}`}
                    />
                    <div
                      className="h-full bg-rose-500 transition-all duration-500"
                      style={{ width: `${expWidth}%` }}
                      title={`Outflow: Rs. ${m.expense}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Transparent Ledger Table */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-urdu">
              {language === 'ur' ? 'عوامی شفاف کھاتہ و لین دین' : 'Audited Public Financial Ledger'}
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total Records: {claims.filter(c => c.status === 'disbursed').length + contributions.filter(c => c.status === 'paid').length + donations.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Receipt / Ref</th>
                  <th className="pb-3">Transaction Description</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-right rtl:text-left">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {claims.filter(c => c.status === 'disbursed').map(c => (
                  <tr key={c.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40">
                    <td className="py-3 text-slate-600 dark:text-slate-400 font-mono">{c.disbursedDate}</td>
                    <td className="py-3 font-mono font-bold text-rose-600">{c.claimNumber}</td>
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-100">
                      Death Assistance Payout (Late {c.deceasedName} - {c.memberName})
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-semibold">
                        Bereavement Grant
                      </span>
                    </td>
                    <td className="py-3 text-right rtl:text-left font-black text-rose-600 font-mono">
                      -Rs. {c.approvedAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}

                {contributions.filter(c => c.status === 'paid').map(c => (
                  <tr key={c.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40">
                    <td className="py-3 text-slate-600 dark:text-slate-400 font-mono">{c.paidDate}</td>
                    <td className="py-3 font-mono font-bold text-emerald-600">{c.receiptNumber}</td>
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-100">
                      Monthly Contribution ({c.memberName} - {c.month})
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                        Member Due
                      </span>
                    </td>
                    <td className="py-3 text-right rtl:text-left font-black text-emerald-600 font-mono">
                      +Rs. {c.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}

                {donations.map(d => (
                  <tr key={d.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40">
                    <td className="py-3 text-slate-600 dark:text-slate-400 font-mono">{d.date}</td>
                    <td className="py-3 font-mono font-bold text-teal-600">{d.receiptNumber}</td>
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-100">
                      Philanthropic Charity ({d.donorName})
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-teal-100 text-teal-800 font-semibold">
                        {d.category}
                      </span>
                    </td>
                    <td className="py-3 text-right rtl:text-left font-black text-emerald-600 font-mono">
                      +Rs. {d.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Certification, Sign and Stamp at Bottom of Report */}
        <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-xs text-slate-600 dark:text-slate-400 max-w-sm space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200 font-urdu">
              تصدیق نامہ برائے شفافیت و درستگی ریکارڈ
            </p>
            <p className="text-[11px] leading-relaxed">
              Certified that this financial statement represents an authentic and accurate ledger of all contributions, bereavement aid payouts, and charity funds held by Kifaalat e Miyyat Fund.
            </p>
          </div>

          <div className="shrink-0">
            <OfficialSignAndStamp
              signatoryName="Muhammad Iqbal Khattak"
              signatoryTitle="Finance Secretary & Khazanchi (خزانچی)"
              showStamp={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
