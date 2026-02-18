import React, {useState, useMemo} from 'react';
import {
  MdArrowBack,
  MdCalendarToday,
  MdDescription,
  MdDownload,
  MdFilterList,
  MdRefresh,
} from 'react-icons/md';
import {useNavigate} from '@tanstack/react-router';
import {generateCSV, useGetAllTransaction} from './accountmutation';
import {Transaction} from './type';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StatementsScreen: React.FC = () => {
  const navigate = useNavigate();
  const {data, isLoading, error} = useGetAllTransaction();

  // Extract transactions from the fetched data
  const allTransactions = data?.transactions || [];

  console.log('Fetched transactions:', allTransactions);

  // Helper to get today's date in YYYY-MM-DD (UTC based)
  const getTodayString = (): string => {
    const d = new Date();
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getThirtyDaysAgoString = (): string => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 30);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState<string>(getThirtyDaysAgoString());
  const [endDate, setEndDate] = useState<string>(getTodayString());
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv' | 'excel'>(
    'pdf',
  );
  const [selectedAccountType, setSelectedAccountType] = useState<
    'E_PRIVATEACCOUNT' | 'E_TEMPORYACCOUNT'
  >('E_PRIVATEACCOUNT');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const resetDateRange = () => {
    setStartDate(getThirtyDaysAgoString());
    setEndDate(getTodayString());
  };

  // Filter transactions by date range (UTC) and account type
  const filteredTransactions = useMemo(() => {
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

    const fromUTC = Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
    const toUTC = Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

    return allTransactions.filter((transaction) => {
      const txTime = new Date(transaction.createdAt).getTime();
      const isDateInRange = txTime >= fromUTC && txTime <= toUTC;
      const isAccountTypeMatch =
        transaction.accountType === selectedAccountType;
      return isDateInRange && isAccountTypeMatch;
    });
  }, [allTransactions, startDate, endDate, selectedAccountType]);

  // Calculate totals
  const totals = useMemo(() => {
    const credits = filteredTransactions
      .filter((t) => t.type === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);
    const debits = filteredTransactions
      .filter((t) => t.type === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalCredits: credits,
      totalDebits: debits,
      netBalance: credits - debits,
      totalTransactions: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const handleGenerateReport = () => {
    if (filteredTransactions.length === 0) return;
    setIsGenerating(true);
    setTimeout(() => {
      switch (reportFormat) {
        case 'pdf':
          generatePDF();
          break;
        case 'csv':
          generateCSVFile();
          break;
        case 'excel':
          generateExcel();
          break;
      }
      setIsGenerating(false);
    }, 100);
  };

  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Transaction Statement', 14, 20);
    doc.setFontSize(10);
    doc.text(
      `Period: ${formatDateForDisplay(startDate)} – ${formatDateForDisplay(endDate)}`,
      14,
      30,
    );
    doc.text(
      `Account: ${selectedAccountType === 'E_PRIVATEACCOUNT' ? 'E‑Private' : 'Temporary'}`,
      14,
      36,
    );
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42);

    const tableData = filteredTransactions.map((t) => [
      new Date(t.createdAt).toLocaleDateString('en-US'),
      t.type,
      t.particular.length > 40
        ? t.particular.substring(0, 40) + '…'
        : t.particular,
      `$${t.amount.toFixed(2)}`,
      t.isPending ? 'Pending' : t.isRejected ? 'Rejected' : 'Completed',
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Date', 'Type', 'Description', 'Amount', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {fillColor: [59, 130, 246]},
      columnStyles: {3: {halign: 'right'}},
      styles: {fontSize: 9},
      margin: {top: 10},
    });
    doc.save(`statement_${startDate}_to_${endDate}.pdf`);
  };

  // Generate CSV
  const generateCSVFile = () => {
    const csvContent = generateCSV(filteredTransactions);
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `statement_${startDate}_to_${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate Excel
  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredTransactions.map((t) => ({
        Date: new Date(t.createdAt).toLocaleDateString('en-US'),
        Time: new Date(t.createdAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        Type: t.type,
        Particulars: t.particular,
        'Beneficiary Name': t.beneficiary?.fullName || '—',
        'Account Number': t.beneficiary?.accountNumber || '—',
        'Amount (USD)': t.amount,
        Status: t.isPending
          ? 'Pending'
          : t.isRejected
            ? 'Rejected'
            : 'Completed',
        'Account Type':
          t.accountType === 'E_PRIVATEACCOUNT' ? 'E‑Private' : 'Temporary',
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(workbook, `statement_${startDate}_to_${endDate}.xlsx`);
  };

  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00Z');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <MdFilterList size={48} className="mb-4 text-red-400" />
        <p className="font-medium text-red-600">Failed to load transactions</p>
        <p className="mt-2 text-sm text-slate-500">
          {error.message || 'Please try again later'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <button
          onClick={() => navigate({to: '/eprivate/eprivatereports'})}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
        >
          <MdArrowBack size={22} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Statements</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 space-y-6 p-4 pb-8">
        {/* Account Toggle */}
        <div className="flex rounded-xl bg-white p-1 shadow-sm">
          {(['E_PRIVATEACCOUNT', 'E_TEMPORYACCOUNT'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedAccountType(type)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                selectedAccountType === type
                  ? 'bg-primary text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type === 'E_PRIVATEACCOUNT' ? 'E‑Private' : 'Temporary'}
            </button>
          ))}
        </div>

        {/* Date Range Card */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">Date Range</h2>
            <button
              onClick={resetDateRange}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            ></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-600">From</span>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-600">To</span>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </label>
          </div>
        </section>

        {/* Format Selection & Download */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-700">Report Format</h2>
          <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
            {(['pdf', 'csv', 'excel'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setReportFormat(fmt)}
                className={`flex-1 rounded-md py-2.5 text-sm font-medium uppercase tracking-wide transition ${
                  reportFormat === fmt
                    ? 'bg-primary text-white shadow'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={filteredTransactions.length === 0 || isGenerating}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold text-white transition active:scale-[0.98] ${
              filteredTransactions.length === 0 || isGenerating
                ? 'cursor-not-allowed bg-slate-400'
                : 'hover:bg-primary-dark bg-primary'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <MdDownload size={20} />
                Download {reportFormat.toUpperCase()}
              </>
            )}
          </button>

          {filteredTransactions.length > 0 && (
            <p className="mt-3 text-center text-sm text-slate-500">
              {filteredTransactions.length} transaction(s) in selected range
            </p>
          )}
        </section>

        {/* Transaction Preview */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">Preview</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {totals.totalTransactions} items
            </span>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <MdFilterList size={48} className="mb-3 text-slate-300" />
              <p className="text-slate-500">
                No transactions match the selected filters.
              </p>
              <button
                onClick={resetDateRange}
                className="mt-4 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
              >
                Reset to last 30 days
              </button>
            </div>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
              {filteredTransactions.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

// TransactionItem component (unchanged)
const TransactionItem: React.FC<{transaction: Transaction}> = ({
  transaction,
}) => {
  const isCredit = transaction.type === 'CREDIT';
  const statusColor = transaction.isPending
    ? 'bg-yellow-100 text-yellow-800'
    : transaction.isRejected
      ? 'bg-red-100 text-red-800'
      : 'bg-green-100 text-green-800';
  const statusText = transaction.isPending
    ? 'Pending'
    : transaction.isRejected
      ? 'Rejected'
      : 'Completed';

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition hover:border-primary/20 hover:bg-slate-50">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}
        >
          <span className="text-sm font-bold">{isCredit ? '+' : '-'}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800">
            {transaction.particular}
          </p>
          {transaction.beneficiary && (
            <p className="truncate text-xs text-slate-500">
              {transaction.beneficiary.fullName} •{' '}
              {transaction.beneficiary.accountNumber}
            </p>
          )}
          <p className="text-xs text-slate-400">
            {new Date(transaction.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="ml-2 flex flex-col items-end gap-1">
        <span
          className={`whitespace-nowrap text-sm font-bold ${
            isCredit ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isCredit ? '+' : '-'}${transaction.amount.toLocaleString()}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor}`}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
};

export default StatementsScreen;
