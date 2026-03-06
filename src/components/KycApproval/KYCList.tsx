import React, {useState, useMemo} from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  User,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {KYCRequest, DashboardStats} from './kyctypes';
import {useGetAllKYCRequests} from './mutationapi';

interface KYCListProps {
  onSelectRequest: (request: KYCRequest) => void;
}

export const KYCList: React.FC<KYCListProps> = ({onSelectRequest}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Completed'>(
    'All',
  );
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: kycRequests = [],
    isLoading,
    error,
    refetch,
  } = useGetAllKYCRequests();

  // Calculate stats
  const stats: DashboardStats = useMemo(() => {
    const totalRequests = kycRequests.length;
    const today = new Date().toDateString();
    const newToday = kycRequests.filter(
      (req) => new Date(req.createdAt).toDateString() === today,
    ).length;
    const pendingApprovals = kycRequests.filter(
      (req) => req.status === 'Pending' || req.status === 'In-Review',
    ).length;
    const completedKyc = kycRequests.filter(
      (req) => req.status === 'Completed',
    ).length;
    const approvalRate =
      totalRequests > 0
        ? Math.round((completedKyc / totalRequests) * 100 * 10) / 10
        : 0;

    return {
      totalRequests,
      newToday,
      pendingApprovals,
      completedKyc,
      approvalRate,
    };
  }, [kycRequests]);

  // Filter requests based on tab and search
  const filteredRequests = useMemo(() => {
    return kycRequests.filter((request) => {
      // Tab filter
      if (
        activeTab === 'Pending' &&
        request.status !== 'Pending' &&
        request.status !== 'In-Review' &&
        request.status !== 'Action Required'
      ) {
        return false;
      }
      if (activeTab === 'Completed' && request.status !== 'Completed') {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          request.legalName?.toLowerCase().includes(searchLower) ||
          request.email?.toLowerCase().includes(searchLower) ||
          request.id?.toLowerCase().includes(searchLower) ||
          request.aadhaarNumber?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [kycRequests, activeTab, searchTerm]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'In-Review':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Action Required':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'Completed':
        return 'bg-green-50 text-green-600 border-green-100';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB]">
        <div className="text-center">
          <p className="mb-4 text-red-500">Error loading KYC requests</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-orange-500 px-4 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-[#F8F9FB] text-[#1A1C1E]">
      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-1 text-xl font-bold tracking-tight sm:text-2xl">
              Client KYC Approval List
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Review and approve customer identity verifications for digital
              gold trading.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => refetch()}
              className="border-gray-200 hover:bg-gray-50 flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-xs font-medium text-white shadow-sm shadow-orange-500/20 transition-colors hover:bg-orange-600 sm:px-4 sm:text-sm">
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Export List</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="rounded-xl border border-stroke bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="mb-3 flex items-start justify-between sm:mb-4">
              <div className="rounded-lg bg-orange-50 p-1.5 sm:p-2">
                <MoreHorizontal className="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider sm:text-xs">
                Total Requests
              </p>
              <p className="text-xl font-bold sm:text-2xl">
                {isLoading ? '...' : stats.totalRequests.toLocaleString()}
              </p>
            </div>
            <p className="mt-3 text-[10px] font-medium text-orange-600 sm:mt-4 sm:text-xs">
              +{stats.newToday} new requests today
            </p>
          </div>

          <div className="rounded-xl border border-stroke bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="mb-3 flex items-start justify-between sm:mb-4">
              <div className="rounded-lg bg-blue-50 p-1.5 sm:p-2">
                <User className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider sm:text-xs">
                Pending Approvals
              </p>
              <p className="text-xl font-bold sm:text-2xl">
                {isLoading ? '...' : stats.pendingApprovals} Cases
              </p>
            </div>
            <button
              onClick={() => setActiveTab('Pending')}
              className="mt-3 text-[10px] font-medium text-orange-600 hover:underline sm:mt-4 sm:text-xs"
            >
              View pending queue
            </button>
          </div>

          <div className="rounded-xl border border-stroke bg-white p-4 shadow-sm sm:col-span-2 sm:p-5 lg:col-span-1 lg:p-6">
            <div className="mb-3 flex items-start justify-between sm:mb-4">
              <div className="rounded-lg bg-green-50 p-1.5 sm:p-2">
                <MoreHorizontal className="h-4 w-4 text-green-500 sm:h-5 sm:w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider sm:text-xs">
                Completed KYC
              </p>
              <p className="text-xl font-bold sm:text-2xl">
                {isLoading ? '...' : stats.completedKyc.toLocaleString()}
              </p>
            </div>
            <p className="mt-3 flex items-center gap-1 text-[10px] font-medium text-green-600 sm:mt-4 sm:text-xs">
              <ChevronRight className="h-3 w-3 rotate-[-90deg]" />
              {stats.approvalRate}% Approval Rate
            </p>
          </div>
        </div>

        {/* Queue Table */}
        <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-stroke p-3 sm:flex-row sm:items-center sm:p-4">
            <h2 className="text-base font-bold sm:text-lg">Queue</h2>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="text-gray-400 absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, ID..."
                  className="bg-gray-50 w-full rounded-lg border border-stroke py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="bg-gray-100 flex w-full rounded-lg p-1 sm:w-auto">
                {(['All', 'Pending', 'Completed'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all sm:flex-none sm:px-4 ${
                      activeTab === tab
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-12 text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-orange-500" />
              <p className="text-gray-500">Loading KYC requests...</p>
            </div>
          )}

          {/* Mobile Card View */}
          {!isLoading && (
            <>
              <div className="block lg:hidden">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="hover:bg-gray-50/50 border-b border-stroke p-4"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 text-gray-400 flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold">
                          {getInitials(request.legalName || 'Unknown')}
                        </div>
                        <div>
                          <p className="text-gray-900 text-sm font-bold">
                            {request.legalName}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {request.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusStyles(request.status || 'Pending')}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            request.status === 'Pending'
                              ? 'bg-gray-400'
                              : request.status === 'In-Review'
                                ? 'bg-blue-400'
                                : request.status === 'Action Required'
                                  ? 'bg-red-400'
                                  : 'bg-green-400'
                          }`}
                        ></span>
                        {request.status}
                      </span>
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-500 text-[10px]">Submission</p>
                        <p className="text-gray-900">
                          {request.submissionDate}
                        </p>
                        <p className="text-gray-500 text-[9px]">
                          {request.submissionTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px]">Document</p>
                        <p className="text-gray-900">{request.documentType}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectRequest(request)}
                      className="w-full rounded-lg bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600 transition-colors hover:bg-orange-100"
                    >
                      REVIEW
                    </button>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="text-gray-500 border-b border-stroke px-4 py-4 text-[10px] font-bold uppercase tracking-wider xl:px-6 xl:text-[11px]">
                        Legal Name
                      </th>
                      <th className="text-gray-500 border-b border-stroke px-4 py-4 text-[10px] font-bold uppercase tracking-wider xl:px-6 xl:text-[11px]">
                        Submission
                      </th>
                      <th className="text-gray-500 border-b border-stroke px-4 py-4 text-[10px] font-bold uppercase tracking-wider xl:px-6 xl:text-[11px]">
                        Document
                      </th>
                      <th className="text-gray-500 border-b border-stroke px-4 py-4 text-[10px] font-bold uppercase tracking-wider xl:px-6 xl:text-[11px]">
                        Status
                      </th>
                      <th className="text-gray-500 border-b border-stroke px-4 py-4 text-[10px] font-bold uppercase tracking-wider xl:px-6 xl:text-[11px]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-gray-50/50 group transition-colors"
                      >
                        <td className="border-b border-stroke px-4 py-4 xl:px-6">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 text-gray-400 flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold xl:h-10 xl:w-10 xl:text-xs">
                              {getInitials(request.legalName || 'Unknown')}
                            </div>
                            <div>
                              <p className="text-gray-900 text-xs font-bold xl:text-sm">
                                {request.legalName}
                              </p>
                              <p className="text-gray-500 text-[9px] xl:text-xs">
                                {request.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-stroke px-4 py-4 xl:px-6">
                          <p className="text-gray-700 text-xs xl:text-sm">
                            {request.submissionDate}
                          </p>
                          <p className="text-gray-500 text-[8px] xl:text-[10px]">
                            {request.submissionTime}
                          </p>
                        </td>
                        <td className="border-b border-stroke px-4 py-4 xl:px-6">
                          <p className="text-gray-700 text-xs xl:text-sm">
                            {request.documentType}
                          </p>
                          <p className="text-gray-500 font-mono text-[8px] xl:text-[10px]">
                            {request.aadhaarNumber}
                          </p>
                        </td>
                        <td className="border-b border-stroke px-4 py-4 xl:px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[8px] font-bold xl:px-2.5 xl:py-1 xl:text-[10px] ${getStatusStyles(request.status || 'Pending')}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                request.status === 'Pending'
                                  ? 'bg-gray-400'
                                  : request.status === 'In-Review'
                                    ? 'bg-blue-400'
                                    : request.status === 'Action Required'
                                      ? 'bg-red-400'
                                      : 'bg-green-400'
                              }`}
                            ></span>
                            {request.status}
                          </span>
                        </td>
                        <td className="border-b border-stroke px-4 py-4 text-right xl:px-6">
                          <button
                            onClick={() => onSelectRequest(request)}
                            className="rounded-lg bg-orange-50 px-3 py-1.5 text-[10px] font-bold text-orange-600 transition-colors hover:bg-orange-100 xl:px-4 xl:text-xs"
                          >
                            REVIEW
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {filteredRequests.length === 0 && (
                <div className="py-12 text-center">
                  <User className="text-gray-300 mx-auto mb-4 h-12 w-12" />
                  <p className="text-gray-500">No KYC requests found</p>
                </div>
              )}

              {/* Pagination */}
              {filteredRequests.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-4 p-3 sm:flex-row sm:p-4">
                  <p className="text-gray-500 order-2 text-[10px] sm:order-1 sm:text-xs">
                    Showing <span className="text-gray-900 font-bold">1</span>{' '}
                    to{' '}
                    <span className="text-gray-900 font-bold">
                      {filteredRequests.length}
                    </span>{' '}
                    of{' '}
                    <span className="text-gray-900 font-bold">
                      {kycRequests.length}
                    </span>{' '}
                    results
                  </p>
                  <div className="order-1 flex items-center gap-1 sm:order-2">
                    <button
                      className="border-gray-200 hover:bg-gray-50 rounded-md border p-1.5 disabled:opacity-50"
                      disabled
                    >
                      <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                    <button className="h-7 w-7 rounded-md border border-orange-200 bg-orange-50 text-[10px] font-bold text-orange-600 sm:h-8 sm:w-8 sm:text-xs">
                      1
                    </button>
                    <button className="hover:bg-gray-50 border-gray-200 h-7 w-7 rounded-md border text-[10px] font-medium sm:h-8 sm:w-8 sm:text-xs">
                      2
                    </button>
                    <button className="hover:bg-gray-50 border-gray-200 h-7 w-7 rounded-md border text-[10px] font-medium sm:h-8 sm:w-8 sm:text-xs">
                      3
                    </button>
                    <span className="text-gray-400 px-1 text-xs sm:px-2">
                      ...
                    </span>
                    <button className="hover:bg-gray-50 border-gray-200 h-7 w-7 rounded-md border text-[10px] font-medium sm:h-8 sm:w-8 sm:text-xs">
                      10
                    </button>
                    <button className="border-gray-200 hover:bg-gray-50 rounded-md border p-1.5">
                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
