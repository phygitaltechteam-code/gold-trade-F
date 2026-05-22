import React, {useState} from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {
  ChevronLeft,
  MoreVertical,
  CheckCircle2,
  CreditCard,
  Mail,
  RotateCcw,
  Snowflake,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Download,
  Building2,
  User,
  Users,
  MapPin,
  Calendar,
  Globe,
  ShieldCheck,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import {motion} from 'framer-motion';
import {Client} from './Customertypes';
import {FiEdit2, FiSave, FiX} from 'react-icons/fi';

interface CustomerDetailProps {
  client: Client;
  onBack: () => void;
}

const InfoSection = ({title, children, icon: Icon}: any) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
      <Icon className="h-4 w-4 text-slate-400" />
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {title}
      </h3>
    </div>
    <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
      {children}
    </div>
  </div>
);

const InfoItem = ({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) => (
  <div>
    <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
      {label}
    </div>
    <div className="text-sm font-medium text-slate-900">{value || 'N/A'}</div>
    {subValue && (
      <div className="mt-0.5 text-xs text-slate-400">{subValue}</div>
    )}
  </div>
);

const DocCard = ({name, type, status, icon: Icon, color, url}: any) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 transition-all hover:border-orange-200"
  >
    <div className={`rounded-lg p-3 ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-medium text-slate-900">{name}</div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        {type} • <span className="font-medium text-emerald-600">{status}</span>
      </div>
    </div>
    <ExternalLink className="h-4 w-4 text-slate-300 transition-colors group-hover:text-orange-500" />
  </a>
);

export const CustomerDetail: React.FC<CustomerDetailProps> = ({client, onBack}) => {
  const [isEditing, setIsEditing] = useState(false);
  // const {data: clientData, isLoading} = useGetClientById(client.id);
  const displayClient = client;
  const isLoading = false;
  const [activeTab, setActiveTab] = useState('ledger');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletActionType, setWalletActionType] = useState<'add' | 'withdraw'>(
    'add',
  );
  const [walletAmount, setWalletAmount] = useState('');
  const [walletPin, setWalletPin] = useState('');
  const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
  const [intradayMargin, setIntradayMargin] = useState('');
  const [holdingMargin, setHoldingMargin] = useState('');
  const [marginPin, setMarginPin] = useState('');

  const mockLedgerData = [
    {
      sr: '1',
      dateTime: '2023-10-12 10:30 AM',
      customerName: 'Alex Vane',
      brokerName: 'Apex Broker',
      transactionId: 'TXN98374',
      stript: 'GOLD 100g',
      orderType: 'BUY',
      holdingType: 'INTRADAY',
      qty: '10',
      price: '$1,950.00',
      status: 'Completed',
      transactionAmount: '$19,500.00',
      totalAmount: '$19,550.00',
      paidAmount: '$19,550.00',
      marginAmount: '$0.00',
      totalCommission: '$50.00',
      brokerCommission: '$35.00',
      paymentStatus: 'PAID',
    },
    {
      sr: '2',
      dateTime: '2023-10-13 02:15 PM',
      customerName: 'Alex Vane',
      brokerName: 'Apex Broker',
      transactionId: 'TXN38472',
      stript: 'SILVER 1kg',
      orderType: 'SELL',
      holdingType: 'DELIVERY',
      qty: '5',
      price: '$22.50',
      status: 'Completed',
      transactionAmount: '$112.50',
      totalAmount: '$115.00',
      paidAmount: '$115.00',
      marginAmount: '$0.00',
      totalCommission: '$2.50',
      brokerCommission: '$1.75',
      paymentStatus: 'PAID',
    },
  ];

  const mockPaymentData = [
    {
      sr: '1',
      dateTime: '2023-10-01 10:30 AM',
      amount: '$5,000.00',
      walletAmount: '$15,000.00',
    },
    {
      sr: '2',
      dateTime: '2023-10-02 14:15 PM',
      amount: '$1,200.00',
      walletAmount: '$13,800.00',
    },
  ];

  const ledgerColumns = [
    {header: 'Sr', accessor: 'sr'},
    {header: 'Date/Time', accessor: 'dateTime'},
    {header: 'Customer Name', accessor: 'customerName'},
    {header: 'Broker Name', accessor: 'brokerName'},
    {header: 'Transaction ID', accessor: 'transactionId'},
    {header: 'Stript', accessor: 'stript'},
    {header: 'Order Type', accessor: 'orderType'},
    {header: 'Holding Type', accessor: 'holdingType'},
    {header: 'Qty', accessor: 'qty'},
    {header: 'Price', accessor: 'price'},
    {header: 'Status', accessor: 'status'},
    {header: 'Transaction Amount', accessor: 'transactionAmount'},
    {header: 'Total Amount', accessor: 'totalAmount'},

    {header: 'Paid Amount', accessor: 'paidAmount'},
    {header: 'Margin Amount', accessor: 'marginAmount'},
    {header: 'Total Commission', accessor: 'totalCommission'},

    {header: 'Broker Commission', accessor: 'brokerCommission'},
    // { header: 'Super Broker Commission', accessor: 'superBrokerCommission' },
    {header: 'Payment Status', accessor: 'paymentStatus'},
  ];

  const paymentColumns = [
    {header: 'Sr', accessor: 'sr'},
    {header: 'Date/Time', accessor: 'dateTime'},
    {header: 'Amount', accessor: 'amount'},
    {header: 'Wallet Amount', accessor: 'walletAmount'},
  ];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-orange-500" />
        <p className="text-slate-500">Loading client details...</p>
      </div>
    );
  }

  const fullName = displayClient.user?.fullname || 'Unknown';
  const email = displayClient.user?.email || 'N/A';
  const phone = displayClient.user?.phoneNumber || 'N/A';
  const isActive = displayClient.user?.isActive || false;
  const isVerified = displayClient.user?.isVerified || false;

  return (
    <motion.div
      initial={{opacity: 0, x: 20}}
      animate={{opacity: 1, x: 0}}
      className="max-w-9xl mx-auto px-6 py-8"
    >
      {/* Header */}
      <div className="max-w-9xl mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="rounded-xl border border-slate-200 bg-white p-2 transition-colors hover:bg-slate-50"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">
                {fullName}
              </h1>
              {isActive && isVerified && (
                <span className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Verified Active
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsMarginModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0"
          >
            <TrendingUp className="h-4 w-4 text-orange-500" /> Add Margin
          </button>
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-all hover:-translate-y-0.5 hover:bg-orange-600 active:translate-y-0"
          >
            <CreditCard className="h-4 w-4" /> Wallet Balance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Main Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
                <Building2 className="h-16 w-16" />
              </div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Wallet Balance
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                ${displayClient.wallets?.amount?.toLocaleString() || '0'}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                <ArrowUpRight className="h-3 w-3" /> Available Balance
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-900/20 text-4xl font-bold">
                  #
                </div>
              </div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Transactions
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                {displayClient._count?.senderTransactions || 0}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-orange-500">
                <div className="h-2 w-2 rounded-full bg-orange-500" /> Total
                Transactions
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
                <CreditCard className="h-16 w-16" />
              </div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Account Status
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                {displayClient.user?.isActive ? 'Active' : 'Inactive'}
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{
                    width: displayClient.user?.isVerified ? '100%' : '50%',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Client Information Card */}
          {/* <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/30 px-6 py-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Client Information
              </h2>
            </div>
            <div className="space-y-10 p-8">
              <InfoSection title="Personal Details" icon={User}>
                <InfoItem
                  label="Full Name"
                  value={displayClient.user?.fullname || 'N/A'}
                />
                <InfoItem
                  label="Email"
                  value={displayClient.user?.email || 'N/A'}
                />
                <InfoItem
                  label="Phone Number"
                  value={displayClient.user?.phoneNumber || 'N/A'}
                />
                <InfoItem
                  label="Residential Address"
                  value={`${displayClient.address || ''}, ${displayClient.city || ''}, ${displayClient.state || ''}, ${displayClient.country || ''} - ${displayClient.pincode || ''}`}
                />
                <InfoItem
                  label="Passport Number"
                  value={
                    displayClient.passportNumber ||
                    displayClient.passport ||
                    'N/A'
                  }
                />
              </InfoSection>

              <InfoSection title="Bank Details" icon={Building2}>
                <InfoItem
                  label="Bank Name"
                  value={displayClient.bank_Name || 'N/A'}
                />
                <InfoItem
                  label="Account Number"
                  value={displayClient.accountNumber || 'N/A'}
                />
                <InfoItem
                  label="Routing / IFSC"
                  value={displayClient.Routing_IFSC || 'N/A'}
                />
                <InfoItem
                  label="Account Type"
                  value={displayClient.Account_Type || 'N/A'}
                />
                <div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Verification Status
                  </div>
                  <span className="flex w-fit items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    {displayClient.user?.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </InfoSection>

              <InfoSection title="Nominee Details" icon={Users}>
                <InfoItem
                  label="Nominee Name"
                  value={displayClient.Nominee_Name || 'N/A'}
                />
                <InfoItem
                  label="Relationship"
                  value={displayClient.Relationship || 'N/A'}
                />
                <InfoItem
                  label="Contact"
                  value={displayClient.Contact || 'N/A'}
                />
                <InfoItem
                  label="Allocation"
                  value={displayClient.Allocation || 'N/A'}
                />
              </InfoSection>
            </div>
          </div> */}

          <div className="mb-6 rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between rounded-t-lg border-b border-stroke bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 dark:border-strokedark">
              <h2 className="text-xl font-semibold text-white">
                Super Broker Profile
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="hover:bg-gray-100 flex items-center gap-2 rounded bg-white px-4 py-2 text-sm font-medium text-orange-500 transition-colors"
                >
                  <FiEdit2 className="h-4 w-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 rounded bg-red-100 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-200"
                  >
                    <FiX className="h-4 w-4" /> Cancel
                  </button>
                  <button
                    // onClick={handleSave}
                    className="hover:bg-gray-100 flex items-center gap-2 rounded bg-white px-4 py-2 text-sm font-medium text-orange-500 transition-colors"
                  >
                    <FiSave className="h-4 w-4" /> Save
                  </button>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullname"
                      value={displayClient.user?.fullname || 'N/A'}
                      // onChange={handleInputChange}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  ) : (
                    <p className="text-black dark:text-white">
                      {displayClient.user?.fullname || 'N/A'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Aadhar Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="aadharCardNumber"
                      value={displayClient.aadharCardNumber || 'N/A'}
                      // onChange={handleInputChange}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  ) : (
                    <p className="text-black dark:text-white">
                      {displayClient.aadharCardNumber || 'N/A'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Commission %
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="commission"
                      value={displayClient.commission || 'N/A'}
                      // onChange={}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  ) : (
                    <p className="text-black dark:text-white">
                      {displayClient.commission || 'N/A'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Area
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="area"
                      value={displayClient.area || 'N/A'}
                      // onChange={handleInputChange}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  ) : (
                    <p className="text-black dark:text-white">
                      {displayClient.area || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={displayClient.address || 'N/A'}
                      // onChange={handleInputChange}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  ) : (
                    <p className="text-black dark:text-white">
                      {displayClient.address || 'N/A'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Password
                  </label>
                  {isEditing ? (
                    <input
                      type="text" // using text so it can be viewed and edited easily
                      name="password"
                      // value={editData.password}
                      // onChange={handleInputChange}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  ) : (
                    <p className="text-black dark:text-white">••••••••</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Documentation */}
          <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/30 px-6 py-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Verified Documentation
              </h2>
              <button className="text-xs font-semibold text-orange-500 hover:text-orange-600">
                Manage Files
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
              {displayClient.aadharCard && (
                <DocCard
                  name="Aadhar Card"
                  type="ID Proof"
                  status="Verified"
                  icon={FileText}
                  color="bg-rose-50 text-rose-500"
                  url={displayClient.aadharCard}
                />
              )}
              {displayClient.panCard && (
                <DocCard
                  name="PAN Card"
                  type="Tax ID"
                  status="Verified"
                  icon={FileText}
                  color="bg-orange-50 text-orange-500"
                  url={displayClient.panCard}
                />
              )}
              {displayClient.passport && (
                <DocCard
                  name="Passport"
                  type="ID Proof"
                  status="Verified"
                  icon={FileText}
                  color="bg-blue-50 text-blue-500"
                  url={displayClient.passport}
                />
              )}
              {!displayClient.aadharCard &&
                !displayClient.panCard &&
                !displayClient.passport && (
                  <p className="col-span-3 py-4 text-center text-sm text-slate-400">
                    No documents uploaded
                  </p>
                )}
            </div>
          </div>

          {/* New Tabs: Ledger & Payment */}
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="mb-6 flex border-b border-slate-100">
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-4 py-3 text-sm font-semibold transition-colors ${
                  activeTab === 'ledger'
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Client Ledger
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`px-4 py-3 text-sm font-semibold transition-colors ${
                  activeTab === 'payment'
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Payment
              </button>
            </div>
            {activeTab === 'ledger' ? (
              <div className="overflow-x-auto">
                <GenericTable
                  data={mockLedgerData}
                  columns={ledgerColumns}
                  paginationOff={true}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <GenericTable
                  data={mockPaymentData}
                  columns={paymentColumns}
                  paginationOff={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Wallet Balance Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Manage Wallet Balance
            </h3>

            {/* Toggle buttons */}
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setWalletActionType('add')}
                className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                  walletActionType === 'add'
                    ? 'bg-white text-orange-500 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setWalletActionType('withdraw')}
                className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                  walletActionType === 'withdraw'
                    ? 'bg-white text-orange-500 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Withdraw
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(
                  `Action: ${walletActionType}, Amount: ${walletAmount}, Pin: ${walletPin}`,
                );
                setIsWalletModalOpen(false);
                setWalletAmount('');
                setWalletPin('');
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Amount
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter Amount"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Pin
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter Pin"
                  value={walletPin}
                  onChange={(e) => setWalletPin(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsWalletModalOpen(false);
                    setWalletAmount('');
                    setWalletPin('');
                  }}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-medium text-white shadow-md shadow-orange-200 transition-colors hover:bg-orange-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Margin Modal */}
      {isMarginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
            <h3 className="mb-6 text-lg font-bold text-slate-900">
              Add Margin
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(
                  `Intraday Margin: ${intradayMargin}, Holding Margin: ${holdingMargin}, Pin: ${marginPin}`,
                );
                setIsMarginModalOpen(false);
                setIntradayMargin('');
                setHoldingMargin('');
                setMarginPin('');
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Intraday Margin
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter Intraday Margin"
                  value={intradayMargin}
                  onChange={(e) => setIntradayMargin(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Holding Margin
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter Holding Margin"
                  value={holdingMargin}
                  onChange={(e) => setHoldingMargin(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Pin
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter Pin"
                  value={marginPin}
                  onChange={(e) => setMarginPin(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsMarginModalOpen(false);
                    setIntradayMargin('');
                    setHoldingMargin('');
                    setMarginPin('');
                  }}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-medium text-white shadow-md shadow-orange-200 transition-colors hover:bg-orange-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};
