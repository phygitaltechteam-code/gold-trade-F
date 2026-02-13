import React, {useState, useMemo} from 'react';
import {
  MdArrowBack,
  MdCalendarToday,
  MdDownload,
  MdFilterList,
} from 'react-icons/md';
import {useNavigate} from '@tanstack/react-router';
import {generateCSV} from './accountmutation';
import {Transaction} from './type';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StatementsScreenProps {
  transactions: Transaction[];
}

const StatementsScreen: React.FC<StatementsScreenProps> = ({transactions}) => {
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-02-05');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv' | 'excel'>(
    'pdf',
  );
  const [selectedAccountType, setSelectedAccountType] = useState<
    'E_PRIVATEACCOUNT' | 'E_TEMPORYACCOUNT'
  >('E_PRIVATEACCOUNT');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const navigate = useNavigate();

  // Safety check for transactions prop
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  // Filter transactions by date range and account type
  const filteredTransactions = useMemo(() => {
    return safeTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      const fromDate = new Date(startDate);
      const toDate = new Date(endDate);

      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);

      const isDateInRange =
        transactionDate >= fromDate && transactionDate <= toDate;
      const isAccountTypeMatch =
        transaction.accountType === selectedAccountType;

      return isDateInRange && isAccountTypeMatch;
    });
  }, [safeTransactions, startDate, endDate, selectedAccountType]);

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

    // Generate the selected format directly (no backend call)
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
  };

  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Transaction Report', 14, 22);

    doc.setFontSize(10);
    doc.text(
      `Date Range: ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}`,
      14,
      32,
    );
    doc.text(
      `Account Type: ${selectedAccountType === 'E_PRIVATEACCOUNT' ? 'E-Private Account' : 'Temporary Account'}`,
      14,
      38,
    );
    doc.text(`Total Transactions: ${totals.totalTransactions}`, 14, 44);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 50);

    const tableData = filteredTransactions.map((t) => [
      new Date(t.createdAt).toLocaleDateString('en-US'),
      t.type,
      t.particular.length > 30
        ? t.particular.substring(0, 30) + '...'
        : t.particular,
      `$${t.amount.toFixed(2)}`,
      t.isPending ? 'Pending' : t.isRejected ? 'Rejected' : 'Completed',
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Date', 'Type', 'Description', 'Amount', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {fillColor: [59, 130, 246]},
      columnStyles: {3: {halign: 'right'}},
      styles: {fontSize: 8},
      margin: {top: 10},
      pageBreak: 'auto',
    });

    doc.save(`Transaction_Report_${startDate}_to_${endDate}.pdf`);
  };

  // Generate CSV
  const generateCSVFile = () => {
    const csvContent = generateCSV(filteredTransactions);
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Transaction_Report_${startDate}_to_${endDate}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        'Beneficiary Name': t.beneficiary?.fullName || 'N/A',
        'Account Number': t.beneficiary?.accountNumber || 'N/A',
        'Amount (USD)': t.amount,
        Status: t.isPending
          ? 'Pending'
          : t.isRejected
            ? 'Rejected'
            : 'Completed',
        'Account Type': t.accountType,
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(
      workbook,
      `Transaction_Report_${startDate}_to_${endDate}.xlsx`,
    );
  };

  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const getMaxDate = (): string => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-background-light font-sans flex h-full min-h-screen flex-col">
      {/* Header */}
      <header className="bg-background-light/95 sticky top-0 z-50 flex items-center justify-between border-b border-slate-200/50 px-4 py-4 backdrop-blur-sm">
        <button
          onClick={() => navigate({to: '/eprivate/eprivatereports'})}
          className="text-navy flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-slate-200 active:scale-95"
        >
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-navy flex-1 text-center text-lg font-bold">
          Statements & Reports
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="flex w-full flex-1 flex-col gap-6 px-4 py-6">
        {/* Account Selector Tabs */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <button
            onClick={() => setSelectedAccountType('E_PRIVATEACCOUNT')}
            className={`flex-1 rounded-lg px-2 py-2.5 text-center text-sm font-medium leading-tight transition-all ${
              selectedAccountType === 'E_PRIVATEACCOUNT'
                ? 'bg-primary text-white shadow-sm'
                : 'hover:text-navy text-slate-500 hover:bg-slate-50'
            }`}
          >
            E Private Account
          </button>
          <button
            onClick={() => setSelectedAccountType('E_TEMPORYACCOUNT')}
            className={`flex-1 rounded-lg px-2 py-2.5 text-center text-sm font-medium leading-tight transition-all ${
              selectedAccountType === 'E_TEMPORYACCOUNT'
                ? 'bg-primary text-white shadow-sm'
                : 'hover:text-navy text-slate-500 hover:bg-slate-50'
            }`}
          >
            Temporarily Virtual Account
          </button>
        </div>

        {/* Custom Report Form */}
        <section className="flex flex-col gap-4">
          <h2 className="text-navy px-1 text-lg font-bold">Custom Report</h2>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            {/* Date Inputs */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <label className="group flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Start Date
                </span>
                <div className="relative">
                  <input
                    className="text-navy h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium outline-none transition-all hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary"
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    max={getMaxDate()}
                  />
                  <MdCalendarToday
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                    size={20}
                  />
                </div>
                <span className="mt-1 text-xs text-slate-500">
                  {formatDateForDisplay(startDate)}
                </span>
              </label>
              <label className="group flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  End Date
                </span>
                <div className="relative">
                  <input
                    className="text-navy h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium outline-none transition-all hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary"
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    max={getMaxDate()}
                    min={startDate}
                  />
                  <MdCalendarToday
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                    size={20}
                  />
                </div>
                <span className="mt-1 text-xs text-slate-500">
                  {formatDateForDisplay(endDate)}
                </span>
              </label>
            </div>

            {/* Format Selector */}
            <div className="mb-8 flex flex-col gap-3">
              <span className="text-sm font-semibold text-slate-700">
                Format
              </span>
              <div className="flex w-full rounded-xl bg-slate-100 p-1">
                {(['pdf', 'csv', 'excel'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setReportFormat(fmt)}
                    className={`flex flex-1 items-center justify-center rounded-lg py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 ${
                      reportFormat === fmt
                        ? 'bg-primary text-white shadow-sm'
                        : 'hover:text-navy text-slate-500 hover:bg-slate-200/50'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerateReport}
                disabled={filteredTransactions.length === 0 || isGenerating}
                className={`group flex h-12 flex-1 items-center justify-center gap-2.5 rounded-xl font-bold text-white transition-all active:scale-[0.98] ${
                  filteredTransactions.length === 0 || isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    Downloading...
                  </div>
                ) : (
                  <>
                    <MdDownload size={22} />
                    Download {reportFormat.toUpperCase()} Report
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Transaction History Preview */}
        <section className="flex flex-col gap-4 pb-8">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-navy text-lg font-bold">Transaction History</h2>
            <span className="text-sm font-medium text-slate-500">
              {filteredTransactions.length} transactions
            </span>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <MdFilterList className="mx-auto mb-4 text-slate-400" size={48} />
              <h3 className="mb-2 text-lg font-bold text-slate-700">
                No Transactions Found
              </h3>
              <p className="text-slate-500">
                No transactions found for the selected account type and date
                range.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4">
              {filteredTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

// Helper Component for Transaction Items
const TransactionItem: React.FC<{transaction: Transaction}> = ({
  transaction,
}) => {
  const getStatusColor = () => {
    if (transaction.isPending) return 'bg-yellow-100 text-yellow-800';
    if (transaction.isRejected) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = () => {
    if (transaction.isPending) return 'Pending';
    if (transaction.isRejected) return 'Rejected';
    return 'Completed';
  };

  return (
    <div className="group flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-all hover:border-primary/20 hover:bg-slate-50">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            transaction.type === 'CREDIT'
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-600'
          }`}
        >
          <span className="text-sm font-bold">
            {transaction.type === 'CREDIT' ? '+' : '-'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-slate-800">
            {transaction.particular}
          </span>
          {transaction.beneficiary && (
            <span className="text-xs text-slate-500">
              To: {transaction.beneficiary.fullName} (
              {transaction.beneficiary.accountNumber})
            </span>
          )}
          <span className="text-xs text-slate-500">
            {new Date(transaction.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className={`text-sm font-bold ${
            transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {transaction.type === 'CREDIT' ? '+' : '-'}$
          {transaction.amount.toLocaleString()}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor()}`}
        >
          {getStatusText()}
        </span>
        <span className="text-xs text-slate-500">
          {transaction.accountType === 'E_PRIVATEACCOUNT'
            ? 'E-Private'
            : 'Temporary'}
        </span>
      </div>
    </div>
  );
};

export default StatementsScreen;
