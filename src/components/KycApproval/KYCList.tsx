import React, {useState} from 'react';
import {
  Search,
  Bell,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  User,
} from 'lucide-react';
import {KYCRequest, DashboardStats} from './kyctypes';

const mockRequests: KYCRequest[] = [
  {
    id: 'KYC-2023-8921',
    legalName: 'Jonathan Marcus Doe',
    email: 'jonathan.doe@example.com',
    submissionDate: 'Oct 24, 2023',
    submissionTime: '10:45 AM',
    aadhaarNumber: 'XXXX XXXX 8921',
    documentType: 'Aadhaar Card',
    status: 'Pending',
    dob: '12 April 1985',
    nationality: 'India',
    taxId: 'ABCDE1234F',
    address: 'B-402, Sunshine Towers, MG Road, Bangalore, Karnataka 560001',
    phoneNumber: '+91 98765 43210',
    occupation: 'Software Engineer',
    bankName: 'HDFC Bank',
    accountNumber: '**** **** 8821',
    ifscCode: 'HDFC0001234',
    nomineeName: 'Sarah Doe',
    nomineeRelationship: 'Spouse',
  },
  {
    id: 'KYC-2023-8922',
    legalName: 'Priya Sharma',
    email: 'priya.s@example.com',
    submissionDate: 'Oct 24, 2023',
    submissionTime: '09:12 AM',
    aadhaarNumber: 'XXXX XXXX 4532',
    documentType: 'PAN Card',
    status: 'In-Review',
    dob: '15 June 1992',
    nationality: 'India',
    taxId: 'FGHIJ5678K',
    address: 'A-101, Green Valley, Pune, Maharashtra 411001',
    phoneNumber: '+91 98765 54321',
    occupation: 'Marketing Manager',
    bankName: 'ICICI Bank',
    accountNumber: '**** **** 4532',
    ifscCode: 'ICIC0005678',
    nomineeName: 'Raj Sharma',
    nomineeRelationship: 'Father',
  },
  {
    id: 'KYC-2023-8923',
    legalName: 'Rahul Singh',
    email: 'rahul.singh99@example.com',
    submissionDate: 'Oct 23, 2023',
    submissionTime: '04:30 PM',
    aadhaarNumber: 'XXXX XXXX 1109',
    documentType: 'Aadhaar Card',
    status: 'Action Required',
    dob: '22 September 1988',
    nationality: 'India',
    taxId: 'LMNOP9012Q',
    address: 'Flat 202, Royal Residency, Delhi 110001',
    phoneNumber: '+91 98765 11223',
    occupation: 'Business Owner',
    bankName: 'SBI',
    accountNumber: '**** **** 1109',
    ifscCode: 'SBIN0001109',
    nomineeName: 'Meena Singh',
    nomineeRelationship: 'Mother',
  },
  {
    id: 'KYC-2023-8924',
    legalName: 'Anita Desai',
    email: 'anita.d@example.com',
    submissionDate: 'Oct 23, 2023',
    submissionTime: '02:15 PM',
    aadhaarNumber: 'XXXX XXXX 9982',
    documentType: 'Passport',
    status: 'Pending',
    dob: '05 March 1995',
    nationality: 'India',
    taxId: 'RSTUV3456W',
    address: 'House No. 45, Sector 15, Gurgaon, Haryana 122001',
    phoneNumber: '+91 98765 99887',
    occupation: 'Designer',
    bankName: 'Axis Bank',
    accountNumber: '**** **** 9982',
    ifscCode: 'UTIB0009982',
    nomineeName: 'Karan Desai',
    nomineeRelationship: 'Brother',
  },
  {
    id: 'KYC-2023-8925',
    legalName: 'Vikram Kapoor',
    email: 'vikram.kapoor@example.com',
    submissionDate: 'Oct 23, 2023',
    submissionTime: '11:00 AM',
    aadhaarNumber: 'XXXX XXXX 3341',
    documentType: 'Aadhaar Card',
    status: 'Pending',
    dob: '10 November 1980',
    nationality: 'India',
    taxId: 'XYZAB7890C',
    address: 'Villa 12, Palm Grove, Mumbai, Maharashtra 400001',
    phoneNumber: '+91 98765 33445',
    occupation: 'Architect',
    bankName: 'Kotak Bank',
    accountNumber: '**** **** 3341',
    ifscCode: 'KKBK0003341',
    nomineeName: 'Sonia Kapoor',
    nomineeRelationship: 'Wife',
  },
];

const stats: DashboardStats = {
  totalRequests: 1842,
  newToday: 34,
  pendingApprovals: 142,
  completedKyc: 1598,
  approvalRate: 98.2,
};

interface KYCListProps {
  onSelectRequest: (request: KYCRequest) => void;
}

export const KYCList: React.FC<KYCListProps> = ({onSelectRequest}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Completed'>(
    'All',
  );
  const [showMobileFilter, setShowMobileFilter] = useState(false);

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

  return (
    <div className="font-sans min-h-screen bg-[#F8F9FB] text-[#1A1C1E]">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">
              Client KYC Approval List
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Review and approve customer identity verifications for digital gold trading.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="border-gray-200 hover:bg-gray-50 flex items-center gap-2 rounded-lg border bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors">
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-sm shadow-orange-500/20 transition-colors hover:bg-orange-600">
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Export List</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="mb-6 sm:mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <div className="border-stroke rounded-xl border bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
            <div className="mb-3 sm:mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-orange-50 p-1.5 sm:p-2">
                <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                Total Requests
              </p>
              <p className="text-xl sm:text-2xl font-bold">
                {stats.totalRequests.toLocaleString()}
              </p>
            </div>
            <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs font-medium text-orange-600">
              +{stats.newToday} new requests today
            </p>
          </div>

          <div className="border-stroke rounded-xl border bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
            <div className="mb-3 sm:mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-blue-50 p-1.5 sm:p-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                Pending Approvals
              </p>
              <p className="text-xl sm:text-2xl font-bold">
                {stats.pendingApprovals} Cases
              </p>
            </div>
            <button className="mt-3 sm:mt-4 text-[10px] sm:text-xs font-medium text-orange-600 hover:underline">
              View pending queue
            </button>
          </div>

          <div className="border-stroke rounded-xl border bg-white p-4 sm:p-5 lg:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="mb-3 sm:mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-green-50 p-1.5 sm:p-2">
                <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                Completed KYC
              </p>
              <p className="text-xl sm:text-2xl font-bold">
                {stats.completedKyc.toLocaleString()}
              </p>
            </div>
            <p className="mt-3 sm:mt-4 flex items-center gap-1 text-[10px] sm:text-xs font-medium text-green-600">
              <ChevronRight className="h-3 w-3 rotate-[-90deg]" />
              {stats.approvalRate}% Approval Rate
            </p>
          </div>
        </div>

        {/* Queue Table - Responsive */}
        <div className="border-stroke overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-stroke flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-bold">Queue</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="text-gray-400 absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-gray-50 border-gray-200 w-full rounded-lg border py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div className="bg-gray-100 flex rounded-lg p-1 w-full sm:w-auto">
                {(['All', 'Pending', 'Completed'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 sm:flex-none rounded-md px-3 sm:px-4 py-1.5 text-xs font-medium transition-all ${
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

          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {mockRequests.map((request) => (
              <div key={request.id} className="border-b border-stroke p-4 hover:bg-gray-50/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 text-gray-400 flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold">
                      {request.legalName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-bold">{request.legalName}</p>
                      <p className="text-gray-500 text-xs">{request.email}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusStyles(request.status)}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        request.status === 'Pending' ? 'bg-gray-400' :
                        request.status === 'In-Review' ? 'bg-blue-400' :
                        request.status === 'Action Required' ? 'bg-red-400' : 'bg-green-400'
                      }`}
                    ></span>
                    {request.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                  <div>
                    <p className="text-gray-500 text-[10px]">Submission</p>
                    <p className="text-gray-900">{request.submissionDate}</p>
                    <p className="text-gray-500 text-[9px]">{request.submissionTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px]">Aadhaar Number</p>
                    <p className="font-mono text-gray-900">{request.aadhaarNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px]">Document Type</p>
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
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-gray-500 border-stroke border-b px-4 xl:px-6 py-4 text-[10px] xl:text-[11px] font-bold uppercase tracking-wider">
                    Legal Name
                  </th>
                  <th className="text-gray-500 border-stroke border-b px-4 xl:px-6 py-4 text-[10px] xl:text-[11px] font-bold uppercase tracking-wider">
                    Submission
                  </th>
                  <th className="text-gray-500 border-stroke border-b px-4 xl:px-6 py-4 text-[10px] xl:text-[11px] font-bold uppercase tracking-wider">
                    Aadhaar Number
                  </th>
                  <th className="text-gray-500 border-stroke border-b px-4 xl:px-6 py-4 text-[10px] xl:text-[11px] font-bold uppercase tracking-wider">
                    Document Type
                  </th>
                  <th className="text-gray-500 border-stroke border-b px-4 xl:px-6 py-4 text-[10px] xl:text-[11px] font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-gray-500 border-stroke border-b px-4 xl:px-6 py-4 text-[10px] xl:text-[11px] font-bold uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {mockRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50/50 group transition-colors">
                    <td className="border-stroke border-b px-4 xl:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 text-gray-400 flex h-8 w-8 xl:h-10 xl:w-10 items-center justify-center rounded-full text-[10px] xl:text-xs font-bold">
                          {request.legalName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-gray-900 text-xs xl:text-sm font-bold">
                            {request.legalName}
                          </p>
                          <p className="text-gray-500 text-[9px] xl:text-xs">{request.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="border-stroke border-b px-4 xl:px-6 py-4">
                      <p className="text-gray-700 text-xs xl:text-sm">{request.submissionDate}</p>
                      <p className="text-gray-500 text-[8px] xl:text-[10px]">{request.submissionTime}</p>
                    </td>
                    <td className="border-stroke border-b px-4 xl:px-6 py-4">
                      <p className="font-mono text-gray-600 text-xs xl:text-sm">{request.aadhaarNumber}</p>
                    </td>
                    <td className="border-stroke border-b px-4 xl:px-6 py-4">
                      <p className="text-gray-700 text-xs xl:text-sm">{request.documentType}</p>
                    </td>
                    <td className="border-stroke border-b px-4 xl:px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 xl:px-2.5 py-0.5 xl:py-1 text-[8px] xl:text-[10px] font-bold ${getStatusStyles(request.status)}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            request.status === 'Pending' ? 'bg-gray-400' :
                            request.status === 'In-Review' ? 'bg-blue-400' :
                            request.status === 'Action Required' ? 'bg-red-400' : 'bg-green-400'
                          }`}
                        ></span>
                        {request.status}
                      </span>
                    </td>
                    <td className="border-stroke border-b px-4 xl:px-6 py-4 text-right">
                      <button
                        onClick={() => onSelectRequest(request)}
                        className="rounded-lg bg-orange-50 px-3 xl:px-4 py-1.5 text-[10px] xl:text-xs font-bold text-orange-600 transition-colors hover:bg-orange-100"
                      >
                        REVIEW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination - Responsive */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 sm:p-4">
            <p className="text-gray-500 text-[10px] sm:text-xs order-2 sm:order-1">
              Showing <span className="text-gray-900 font-bold">1</span> to{' '}
              <span className="text-gray-900 font-bold">5</span> of{' '}
              <span className="text-gray-900 font-bold">142</span> results
            </p>
            <div className="flex items-center gap-1 order-1 sm:order-2">
              <button className="border-gray-200 hover:bg-gray-50 rounded-md border p-1.5 disabled:opacity-50" disabled>
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <button className="h-7 w-7 sm:h-8 sm:w-8 rounded-md border border-orange-200 bg-orange-50 text-[10px] sm:text-xs font-bold text-orange-600">
                1
              </button>
              <button className="hover:bg-gray-50 border-gray-200 h-7 w-7 sm:h-8 sm:w-8 rounded-md border text-[10px] sm:text-xs font-medium">
                2
              </button>
              <button className="hover:bg-gray-50 border-gray-200 h-7 w-7 sm:h-8 sm:w-8 rounded-md border text-[10px] sm:text-xs font-medium">
                3
              </button>
              <span className="text-gray-400 px-1 sm:px-2 text-xs">...</span>
              <button className="hover:bg-gray-50 border-gray-200 h-7 w-7 sm:h-8 sm:w-8 rounded-md border text-[10px] sm:text-xs font-medium">
                10
              </button>
              <button className="border-gray-200 hover:bg-gray-50 rounded-md border p-1.5">
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};