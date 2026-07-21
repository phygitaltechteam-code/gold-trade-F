import React, {useState, useMemo} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {
  Search,
  Filter,
  X,
  RefreshCcw,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Activity,
} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {useGetDepositeCompany} from '@/lib/react-query/withdrawal';

// Simple Stat Card Component - Only title, value, and icon
const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-orange-500',
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor?: string;
}) => {
  // Map icon color to background color
  const getBgColor = () => {
    const colorMap: Record<string, string> = {
      'text-orange-500': 'bg-orange-50',
      'text-blue-500': 'bg-blue-50',
      'text-green-500': 'bg-green-50',
      'text-purple-500': 'bg-purple-50',
      'text-red-500': 'bg-red-50',
      'text-yellow-500': 'bg-yellow-50',
      'text-pink-500': 'bg-pink-50',
      'text-indigo-500': 'bg-indigo-50',
      'text-teal-500': 'bg-teal-50',
      'text-gray-500': 'bg-gray-50',
    };
    return colorMap[iconColor] || 'bg-gray-50';
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-stroke bg-white p-4 shadow-sm transition-all hover:border-orange-200 hover:shadow-md dark:border-strokedark dark:bg-boxdark md:p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
            {title}
          </p>
          <h4 className="mt-2 text-xl font-bold text-black dark:text-white md:text-2xl">
            {value}
          </h4>
        </div>
        <div
          className={`rounded-lg p-2 transition-colors group-hover:bg-orange-50 ${getBgColor()}`}
        >
          {Icon && <Icon className={`h-5 w-5 ${iconColor} md:h-6 md:w-6`} />}
        </div>
      </div>
    </div>
  );
};

// Types
interface DepositRequest {
  id: string;
  requestId: string;
  date: string;
  time: string;
  customerName: string;
  superBroker?: string;
  broker?: string;
  amount: number;
  type: string;
  balanceAfter: number;
  notes: string;
  createdAt: string;
}

export default function DepositeCompany() {
  const queryClient = useQueryClient();
  const {data: deposits, refetch} = useGetDepositeCompany();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const itemsPerPage = 5;

  // Date filter states - Default to show all data (empty dates)
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Format currency in Indian format
  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Format date and time
  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return 'N/A';

    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return 'N/A';

    const formattedDate = date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const formattedTime = date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return {date: formattedDate, time: formattedTime};
  };

  // Date filtering logic - If no dates selected, show all data
  const filterByDate = (dateString: string) => {
    if (!fromDate || !toDate) return true;

    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);

    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);

    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    return date >= from && date <= to;
  };

  // Transform API data
  const MOCK_DATA = useMemo(() => {
    return (
      deposits?.map((item: any, index: number) => ({
        id: item.id,
        requestId: `DEP${String(index + 1).padStart(3, '0')}`,
        date: item.createdAt || new Date().toISOString().split('T')[0],
        time: item.createdAt || new Date().toISOString(),
        customerName: item.customer?.user?.fullname || 'N/A',
        amount:
          typeof item.amount === 'string'
            ? parseFloat(item.amount)
            : item.amount || 0,
        type: item.type || 'CREDIT',
        balanceAfter:
          typeof item.balanceAfter === 'string'
            ? parseFloat(item.balanceAfter)
            : item.balanceAfter || 0,
        notes: item.Notes || '-',
        createdAt: item.createdAt,
        customer: item.customer,
      })) || []
    );
  }, [deposits]);

  // Get date-filtered data for cards
  const dateFilteredData = useMemo(() => {
    return MOCK_DATA?.filter((req) => {
      return filterByDate(req.date);
    });
  }, [MOCK_DATA, fromDate, toDate]);

  // Filter data based on search and date
  const filteredData = useMemo(() => {
    return dateFilteredData?.filter((req) => {
      const matchesSearch =
        searchTerm === '' ||
        req.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.amount.toString().includes(searchTerm);

      return matchesSearch;
    });
  }, [dateFilteredData, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalDepositAmount =
      dateFilteredData?.reduce((sum, r) => sum + r.amount, 0) || 0;
    const totalCount = dateFilteredData?.length || 0;
    const uniqueCustomers = new Set(
      dateFilteredData?.map((r) => r.customerName),
    ).size;

    // Calculate average deposit
    const avgDeposit = totalCount > 0 ? totalDepositAmount / totalCount : 0;

    return {
      totalDepositAmount,
      totalCount,
      uniqueCustomers,
      avgDeposit,
    };
  }, [dateFilteredData]);

  // Table columns
  const columns = [
    {
      header: 'Date',
      accessor: (row: DepositRequest) => {
        const formatted = formatDateTime(row.date);
        return (
          <div>
            <div className="text-gray-600 text-sm">
              {formatted?.date || 'N/A'}
            </div>
            <div className="text-gray-400 text-xs">{formatted?.time || ''}</div>
          </div>
        );
      },
    },
    {
      header: 'Customer Name',
      accessor: (row: DepositRequest) => (
        <div className="text-gray-900 text-sm">{row?.customerName}</div>
      ),
    },
    
   {
  header: 'Super Broker',
  accessor: (row: DepositRequest) => (
    <div className="text-gray-900 text-sm">
      {row?.customer?.broker?.superBroker?.user?.fullname || '-'}
    </div>
  ),
},
{
  header: 'Broker',
  accessor: (row: DepositRequest) => (
    <div className="text-gray-900 text-sm">
      {row?.customer?.broker?.user?.fullname || '-'}
    </div>
  ),
},
    {
      header: 'Amount',
      accessor: (row: DepositRequest) => (
        <div className="text-gray-900 text-left text-sm">
          {formatIndianCurrency(row.amount)}
        </div>
      ),
    },
    {
      header: 'Balance After',
      accessor: (row: DepositRequest) => (
        <div className="text-gray-900 text-sm">
          {formatIndianCurrency(row.balanceAfter)}
        </div>
      ),
    },
  ];

  // Stats Card data - Only title, value, icon
  const statCards = [
    {
      title: 'Total Deposits',
      value: formatNumber(stats.totalCount),
      icon: DollarSign,
      iconColor: 'text-green-500',
    },
    {
      title: 'Total Amount',
      value: formatIndianCurrency(stats.totalDepositAmount),
      icon: TrendingUp,
      iconColor: 'text-orange-500',
    },
    {
      title: 'Unique Customers',
      value: formatNumber(stats.uniqueCustomers),
      icon: Users,
      iconColor: 'text-blue-500',
    },
    {
      title: 'Average Deposit',
      value: formatIndianCurrency(stats.avgDeposit),
      icon: Activity,
      iconColor: 'text-purple-500',
    },
  ];

  return (
    <div className="font-sans min-h-screen bg-[#F8F9FB] text-[#1A1D21]">
      <main className="mx-auto max-w-[2000px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              Deposit Reports
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex-1 sm:flex-none">
              <Search className="text-gray-400 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Customer, Amount..."
                className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-4 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="text-gray-400 hover:text-gray-600 h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              <RefreshCcw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards - Simple design */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              value={card.value}
              icon={card.icon}
              iconColor={card.iconColor}
            />
          ))}
        </div>

        {/* Main Content Area */}
        <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm">
          {/* Table Header with Title and Date Filter on Right */}
          <div className="flex flex-col justify-between border-b border-stroke px-4 py-3 sm:flex-row sm:items-center sm:px-6">
            <h2 className="text-gray-700 text-sm font-semibold">
              Deposit History
              <span className="text-gray-400 ml-2 text-xs font-normal">
                ({filteredData?.length || 0} records)
              </span>
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-black dark:text-white">
                  From:
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rounded border border-stroke bg-transparent px-3 py-1 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-black dark:text-white">
                  To:
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rounded border border-stroke bg-transparent px-3 py-1 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                className="hover:bg-gray-50 rounded-lg border border-stroke bg-white p-2 transition-colors sm:hidden"
              >
                <Filter className="text-gray-600 h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile Filter Panel */}
          <AnimatePresence>
            {showMobileFilter && (
              <motion.div
                initial={{opacity: 0, height: 0}}
                animate={{opacity: 1, height: 'auto'}}
                exit={{opacity: 0, height: 0}}
                className="bg-gray-50/50 border-b border-stroke p-4 sm:hidden"
              >
                <h3 className="text-gray-400 mb-2 text-xs font-bold">
                  Quick Filters
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['High Value', 'Today', 'Yesterday'].map((filter) => (
                    <button
                      key={filter}
                      className="hover:bg-gray-50 rounded-full border border-stroke bg-white px-3 py-1 text-xs font-medium"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generic Table */}
          <GenericTable
            data={filteredData}
            columns={columns}
            rowsPerPage={itemsPerPage}
            paginationOff={false}
          />
        </div>
      </main>
    </div>
  );
}
