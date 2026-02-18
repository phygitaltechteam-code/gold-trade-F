/*eslint-disable*/
import {api} from '@/utils/axios';
import {useMutation, useQuery} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {ApiResponse, ReportData, Transaction} from './type';

export const useGetAllTransaction = () => {
  return useQuery({
    queryKey: ['get-all-transactions'],
    queryFn: getallTransaction,
  });
};

export const useCustomReport = () => {
  return useMutation({
    mutationFn: (reportData: ReportData) => customreport(reportData),
    onSuccess: (data, variables) => {
      // Create filename based on account type and date
      const fromDate = new Date(variables.from).toISOString().split('T')[0];
      const toDate = new Date(variables.to).toISOString().split('T')[0];
      const accountType =
        variables.accountType === 'E_PRIVATEACCOUNT'
          ? 'E-Private'
          : 'Temporary';

      let filename = `${accountType}-Account-Statement-${fromDate}-to-${toDate}`;

      // Create a blob from the response
      let mimeType = 'application/pdf';
      let extension = '.pdf';

      if (variables.format === 'csv') {
        mimeType = 'text/csv';
        extension = '.csv';
      } else if (variables.format === 'excel') {
        mimeType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = '.xlsx';
      }

      filename += extension;

      const blob = new Blob([data], {type: mimeType});

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`${accountType} Account Statement generated successfully!`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed to generate report';
      toast.error(errorMessage);
    },
  });
};

export const getallTransaction = async (): Promise<ApiResponse> => {
  try {
    const res = await api.get('/customer/wallet/transactions');

    return res.data;
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Failed to get transactions');
    throw error;
  }
};

export const customreport = async (reportData: ReportData) => {
  try {
    const res = await api.put('/customer/wallet/transactions/', reportData, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Failed to generate report');
    throw error;
  }
};

export const generateCSV = (transactions: Transaction[]): string => {
  const headers = [
    'Date',
    'Time',
    'Type',
    'Particulars',
    'Beneficiary Name',
    'Account Number',
    'Amount (USD)',
    'Status',
    'Account Type',
  ];

  const rows = transactions.map((t) => {
    const date = new Date(t.createdAt);
    const status = t.isPending
      ? 'Pending'
      : t.isRejected
        ? 'Rejected'
        : 'Completed';
    return [
      date.toLocaleDateString('en-US'),
      date.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}),
      t.type,
      t.particular,
      t.beneficiary?.fullName || 'N/A',
      t.beneficiary?.accountNumber || 'N/A',
      String(t.amount),
      status,
      t.accountType,
    ];
  });

  const escape = (val: string) => {
    const needsQuotes = /[",\n]/.test(val);
    const escaped = val.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => escape(String(cell))).join(','))
    .join('\n');

  return csv;
};

export const generatePDFPreview = (
  transactions: Transaction[],
  totals: {
    totalCredits: number;
    totalDebits: number;
    netBalance: number;
    totalTransactions: number;
  },
  range: {from: string; to: string},
): {html: string} => {
  const rows = transactions
    .slice(0, 50)
    .map((t) => {
      const date = new Date(t.createdAt).toLocaleDateString('en-US');
      const status = t.isPending
        ? 'Pending'
        : t.isRejected
          ? 'Rejected'
          : 'Completed';
      return `<tr>
        <td>${date}</td>
        <td>${t.type}</td>
        <td>${(t.particular || '').substring(0, 50)}</td>
        <td style="text-align:right">$${t.amount.toLocaleString()}</td>
        <td>${status}</td>
      </tr>`;
    })
    .join('');

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #0f172a;">
      <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700;">Transaction Report Preview</h2>
      <div style="font-size: 12px; color: #475569; margin-bottom: 12px;">${range.from} to ${range.to}</div>
      <div style="display:flex; gap:12px; margin-bottom: 16px;">
        <div style="background:#ecfeff; padding:8px 12px; border-radius:8px; font-size:12px;">Total Credits: $${totals.totalCredits.toLocaleString()}</div>
        <div style="background:#fee2e2; padding:8px 12px; border-radius:8px; font-size:12px;">Total Debits: $${totals.totalDebits.toLocaleString()}</div>
        <div style="background:#dbeafe; padding:8px 12px; border-radius:8px; font-size:12px;">Net Balance: $${totals.netBalance.toLocaleString()}</div>
      </div>
      <table style="width:100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr>
            <th style="text-align:left; border-bottom:1px solid #e2e8f0; padding:8px;">Date</th>
            <th style="text-align:left; border-bottom:1px solid #e2e8f0; padding:8px;">Type</th>
            <th style="text-align:left; border-bottom:1px solid #e2e8f0; padding:8px;">Description</th>
            <th style="text-align:right; border-bottom:1px solid #e2e8f0; padding:8px;">Amount</th>
            <th style="text-align:left; border-bottom:1px solid #e2e8f0; padding:8px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="5" style="padding:12px; color:#64748b;">No transactions in the selected range.</td></tr>'}
        </tbody>
      </table>
      <div style="margin-top: 10px; font-size: 12px; color: #475569;">Showing ${Math.min(transactions.length, 50)} of ${transactions.length} transactions</div>
    </div>
  `;

  return {html};
};
