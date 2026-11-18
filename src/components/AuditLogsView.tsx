import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Lock,
  Download,
  FileSpreadsheet
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, language, t } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.hash.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const csvEscape = (val: string) => `"${String(val || '').replace(/"/g, '""')}"`;

  const handleExportAllCsv = () => {
    const header = ['Timestamp', 'Actor Name', 'Actor Role', 'IP / Session', 'Category', 'Action', 'Details', 'Cryptographic Hash'];
    const rows = auditLogs.map(log => [
      csvEscape(log.timestamp),
      csvEscape(log.actorName),
      csvEscape(log.actorRole),
      csvEscape(log.ipAddress),
      csvEscape(log.category),
      csvEscape(log.action),
      csvEscape(log.details),
      csvEscape(log.hash)
    ].join(','));

    const csvContent = '\uFEFF' + [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const fileName = `KMF-Audit-Trail-Logs-${new Date().toISOString().split('T')[0]}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        if (document.body.contains(link)) document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {}
    }, 2500);

    setExportToast(
      language === 'ur'
        ? `تمام ${auditLogs.length} آڈٹ لاگز CSV فائل میں ڈاؤنلوڈ ہو گئے!`
        : `Exported all ${auditLogs.length} audit log entries to CSV!`
    );
    setTimeout(() => setExportToast(null), 3500);
  };

  const escapeHtml = (str: string) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const handleExportAllPdf = async () => {
    let tempContainer: HTMLDivElement | null = null;
    try {
      setIsExportingPdf(true);
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

      tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-99999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '794px';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.color = '#0f172a';
      tempContainer.style.padding = '20px';
      tempContainer.style.fontFamily = 'Plus Jakarta Sans, system-ui, sans-serif';

      const rowsHtml = auditLogs
        .map(
          (log, idx) => `
          <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom:1px solid #e2e8f0;">
            <td style="padding:6px 8px; font-family:monospace; font-size:9px; white-space:nowrap; vertical-align:top;">${escapeHtml(log.timestamp)}</td>
            <td style="padding:6px 8px; font-size:9px; vertical-align:top;">
              <div style="font-weight:700; color:#0f172a;">${escapeHtml(log.actorName)}</div>
              <div style="color:#64748b; font-size:8px;">${escapeHtml(log.actorRole)}</div>
            </td>
            <td style="padding:6px 8px; font-size:9px; font-weight:700; text-transform:uppercase; color:#065f46; vertical-align:top;">${escapeHtml(log.category)}</td>
            <td style="padding:6px 8px; font-size:9px; vertical-align:top;">
              <div style="font-weight:700; color:#0f172a;">${escapeHtml(log.action)}</div>
              <div style="color:#475569; font-size:8.5px; margin-top:2px;">${escapeHtml(log.details)}</div>
            </td>
            <td style="padding:6px 8px; font-family:monospace; font-size:8px; color:#047857; word-break:break-all; vertical-align:top;">${escapeHtml(log.hash.substring(0, 20))}...</td>
          </tr>`
        )
        .join('');

      tempContainer.innerHTML = `
        <div style="border-bottom:2px solid #047857; padding-bottom:12px; margin-bottom:14px; text-align:center;">
          <div style="font-size:18px; font-weight:800; color:#064e3b;">Kifaalat e Miyyat Fund Welfare Society</div>
          <div style="font-size:12px; font-weight:700; color:#334155; margin-top:2px;">Tamper-Evident Cryptographic Audit Trail Report</div>
          <div style="font-size:10px; color:#64748b; margin-top:4px;">Generated: ${escapeHtml(new Date().toLocaleString())} | Total Entries: ${auditLogs.length}</div>
        </div>
        <table style="width:100%; border-collapse:collapse; text-align:left;">
          <thead>
            <tr style="background:#064e3b; color:#ffffff; font-size:9.5px;">
              <th style="padding:7px 8px;">Timestamp</th>
              <th style="padding:7px 8px;">Actor</th>
              <th style="padding:7px 8px;">Category</th>
              <th style="padding:7px 8px;">Action &amp; Details</th>
              <th style="padding:7px 8px;">Hash</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      `;

      document.body.appendChild(tempContainer);

      const canvas = await html2canvas(tempContainer, {
        scale: isMobile ? 1.5 : 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 5;
      const contentWidth = pageWidth - margin * 2; // 200mm
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

      const fileName = `KMF-Audit-Trail-Logs-${new Date().toISOString().split('T')[0]}.pdf`;
      const pdfBlob = pdf.output('blob');

      if (isMobile && typeof navigator !== 'undefined' && navigator.canShare) {
        try {
          const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: fileName, text: 'KMF Full Audit Trail PDF' });
            setExportToast(
              language === 'ur'
                ? `تمام ${auditLogs.length} آڈٹ لاگز کی پی ڈی ایف تیار ہو گئی!`
                : `Exported all ${auditLogs.length} audit log entries to PDF!`
            );
            setTimeout(() => setExportToast(null), 3500);
            return;
          }
        } catch {}
      }

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

      setExportToast(
        language === 'ur'
          ? `تمام ${auditLogs.length} آڈٹ لاگز کی پی ڈی ایف ڈاؤنلوڈ ہو گئی!`
          : `Exported all ${auditLogs.length} audit log entries to PDF!`
      );
      setTimeout(() => setExportToast(null), 3500);
    } catch (err) {
      console.error('Audit trail PDF export failed:', err);
      window.print();
    } finally {
      if (tempContainer && document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Alert */}
      {exportToast && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 bg-[#004d30] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{exportToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-urdu">
            {t.audit.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.audit.subtitle} ({auditLogs.length} {language === 'ur' ? 'کل اندراجات' : 'total entries'})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportAllCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ur' ? 'تمام لاگز CSV ڈاؤنلوڈ' : 'Download CSV'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportAllPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            {isExportingPdf ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>
              {isExportingPdf
                ? (language === 'ur' ? 'پی ڈی ایف تیار ہو رہی ہے...' : 'Generating PDF...')
                : (language === 'ur' ? 'تمام لاگز PDF ڈاؤنلوڈ' : 'Download PDF')}
            </span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t.audit.verified}</span>
          </div>
        </div>
      </div>

      {/* Chained Hash Notice */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
        <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-medium">{t.audit.tamperProof}</span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.audit.searchLogs}
            className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">All Categories</option>
            <option value="claim">Claims & Payouts</option>
            <option value="contribution">Contributions</option>
            <option value="member">Member Management</option>
            <option value="donation">Donations</option>
            <option value="sync">Sync & Backup</option>
            <option value="security">Security & MFA</option>
          </select>
        </div>
      </div>

      {/* Logs Timeline / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="px-4 py-3.5">{t.audit.timestamp}</th>
                <th className="px-4 py-3.5">{t.audit.actor}</th>
                <th className="px-4 py-3.5">{t.audit.category}</th>
                <th className="px-4 py-3.5">{t.audit.action}</th>
                <th className="px-4 py-3.5">Audit Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {log.actorName}
                    </span>
                    <span className="text-[10px] text-slate-400">{log.ipAddress}</span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                      {log.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      {log.action}
                    </span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      {log.details}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[10px] text-emerald-700 dark:text-emerald-400 max-w-xs truncate" title={log.hash}>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{log.hash.substring(0, 16)}...</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
