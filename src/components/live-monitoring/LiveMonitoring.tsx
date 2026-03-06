import React, {useState, useMemo} from 'react';
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  PieChart,
  X,
} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';

interface Order {
  id: string;
  time: string;
  client: string;
  clientInitials: string;
  instrument: string;
  type: 'BUY' | 'SELL';
  qty: string;
  subQty?: string;
  price: string;
  status: 'Pending' | 'Flagged' | 'Executed' | 'Partial';
  statusColor: string;
  statusBg?: string;
  statusIcon?: JSX.Element;
}

const LiveMonitoring = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'All' | 'Spot' | 'Futures'
  >('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const itemsPerPage = 5;

  const orders: Order[] = [
    {
      id: '#8821',
      time: '10:42:05',
      client: 'Capital Alpha',
      clientInitials: 'CA',
      instrument: 'Gold Spot',
      type: 'BUY',
      qty: '50.00',
      price: '1,942.10',
      status: 'Pending',
      statusColor: 'text-slate-400',
      statusBg: 'bg-slate-400',
    },
    {
      id: '#8822',
      time: '10:41:55',
      client: 'Jane Smith',
      clientInitials: 'JS',
      instrument: 'Futures Dec',
      type: 'SELL',
      qty: '1,500.00',
      price: '1,955.00',
      status: 'Flagged',
      statusColor: 'text-orange-500',
      statusIcon: <AlertTriangle className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />,
    },
    {
      id: '#8819',
      time: '10:40:12',
      client: 'Gold Star Inc',
      clientInitials: 'GS',
      instrument: 'Gold Spot',
      type: 'BUY',
      qty: '120.00',
      price: '1,941.80',
      status: 'Executed',
      statusColor: 'text-emerald-500',
      statusIcon: <CheckCircle2 className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />,
    },
    {
      id: '#8815',
      time: '10:38:45',
      client: 'TradeCorp',
      clientInitials: 'TC',
      instrument: 'Futures Jan',
      type: 'SELL',
      qty: '200.00',
      subQty: '50 Filled',
      price: '1,958.00',
      status: 'Partial',
      statusColor: 'text-blue-500',
      statusBg: 'bg-blue-500',
    },
    {
      id: '#8811',
      time: '10:35:10',
      client: 'Market Makers Ltd',
      clientInitials: 'MM',
      instrument: 'Gold Spot',
      type: 'BUY',
      qty: '75.00',
      price: '1,942.05',
      status: 'Pending',
      statusColor: 'text-slate-400',
      statusBg: 'bg-slate-400',
    },
    {
      id: '#8808',
      time: '10:32:22',
      client: 'Alpha Investments',
      clientInitials: 'AI',
      instrument: 'Futures Mar',
      type: 'BUY',
      qty: '300.00',
      price: '1,944.50',
      status: 'Pending',
      statusColor: 'text-slate-400',
      statusBg: 'bg-slate-400',
    },
    {
      id: '#8805',
      time: '10:28:15',
      client: 'Beta Trading',
      clientInitials: 'BT',
      instrument: 'Gold Spot',
      type: 'SELL',
      qty: '45.00',
      price: '1,943.20',
      status: 'Executed',
      statusColor: 'text-emerald-500',
      statusIcon: <CheckCircle2 className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />,
    },
  ];

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.instrument.toLowerCase().includes(searchTerm.toLowerCase());

      // Instrument filter
      const matchesFilter =
        selectedFilter === 'All' ||
        (selectedFilter === 'Spot' && order.instrument.includes('Spot')) ||
        (selectedFilter === 'Futures' && order.instrument.includes('Futures'));

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, selectedFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Export function
  const handleExport = () => {
    const csvContent = [
      [
        'Order ID',
        'Time',
        'Client',
        'Instrument',
        'Type',
        'Quantity',
        'Price',
        'Status',
      ],
      ...filteredOrders.map((order) => [
        order.id,
        order.time,
        order.client,
        order.instrument,
        order.type,
        order.qty,
        order.price,
        order.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Stats calculations
  const totalExposure = useMemo(() => {
    return filteredOrders.reduce((sum, order) => {
      const price = parseFloat(order.price.replace(/,/g, ''));
      const qty = parseFloat(order.qty);
      return sum + price * qty;
    }, 0);
  }, [filteredOrders]);

  const buyVolume = useMemo(() => {
    const buyOrders = filteredOrders.filter((o) => o.type === 'BUY');
    return (buyOrders.length / filteredOrders.length) * 100 || 0;
  }, [filteredOrders]);

  return (
    <div className="font-sans min-h-screen bg-[#F8F9FB] text-slate-900">
      <main className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:mb-8">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
            Live Order Book
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:rounded-xl sm:p-5 lg:p-6"
          >
            <div className="mb-2 flex items-start justify-between sm:mb-4">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 sm:text-[10px] lg:text-[11px]">
                Total Exposure
              </span>
              <PieChart className="h-4 w-4 text-slate-200 transition-colors group-hover:text-slate-300 sm:h-5 sm:w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                ${(totalExposure / 1000000).toFixed(2)}M
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 sm:text-sm">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>+12.5% vs yesterday</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.1}}
            className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:rounded-xl sm:p-5 lg:p-6"
          >
            <div className="mb-2 flex items-start justify-between sm:mb-4">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 sm:text-[10px] lg:text-[11px]">
                Active Orders
              </span>
              <LayoutGrid className="h-4 w-4 text-slate-200 transition-colors group-hover:text-slate-300 sm:h-5 sm:w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                {filteredOrders.length}
              </h2>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 sm:text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-200 sm:h-2 sm:w-2" />
                <span>
                  {filteredOrders.filter((o) => o.status === 'Pending').length}{' '}
                  Pending
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.2}}
            className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2 sm:rounded-xl sm:p-5 lg:col-span-1 lg:p-6"
          >
            <div className="mb-2 flex items-start justify-between sm:mb-4">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 sm:text-[10px] lg:text-[11px]">
                Buy / Sell Volume
              </span>
              <TrendingUp className="h-4 w-4 text-slate-200 transition-colors group-hover:text-slate-300 sm:h-5 sm:w-5" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                  {buyVolume.toFixed(0)}%
                </span>
                <span className="text-base text-slate-300 sm:text-lg lg:text-xl">
                  /
                </span>
                <span className="text-base font-bold text-slate-400 sm:text-lg lg:text-xl">
                  {(100 - buyVolume).toFixed(0)}%
                </span>
              </div>
              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-rose-500 sm:h-2">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{width: `${buyVolume}%`}}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls - Responsive */}
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          {/* Left side - Search and Filter */}
          <div className="flex w-full items-center gap-2 sm:gap-3 lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 sm:h-4 sm:w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Client, Order ID..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/5 sm:py-2.5 sm:pl-10 sm:pr-4 sm:text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="relative rounded-lg border border-slate-200 bg-white p-2 transition-colors hover:bg-slate-50 sm:p-2.5 lg:hidden"
            >
              <Filter className="h-4 w-4 text-slate-600 sm:h-5 sm:w-5" />
              {selectedFilter !== 'All' && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-orange-500" />
              )}
            </button>

            {/* Desktop Filter Tabs */}
            <div className="hidden rounded-lg border border-slate-200 bg-white p-1 lg:flex">
              {(['All', 'Spot', 'Futures'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setSelectedFilter(filter);
                    setCurrentPage(1);
                  }}
                  className={`rounded-md px-4 py-1.5 text-xs font-bold transition-all ${
                    selectedFilter === filter
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Export */}
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-slate-900/10 transition-colors hover:bg-slate-800 sm:px-5 sm:py-2.5 sm:text-sm lg:w-auto"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Mobile Filter Panel */}
        <AnimatePresence>
          {showMobileFilter && (
            <motion.div
              initial={{opacity: 0, height: 0}}
              animate={{opacity: 1, height: 'auto'}}
              exit={{opacity: 0, height: 0}}
              className="mb-4 overflow-hidden lg:hidden"
            >
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="mb-3 text-xs font-bold text-slate-400">
                  Filter by Instrument
                </h3>
                <div className="flex gap-2">
                  {(['All', 'Spot', 'Futures'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setSelectedFilter(filter);
                        setCurrentPage(1);
                        setShowMobileFilter(false);
                      }}
                      className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                        selectedFilter === filter
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table - Responsive */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:rounded-xl">
          {/* Mobile Card View */}
          <div className="block divide-y divide-slate-100 lg:hidden">
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order, idx) => (
                <div key={idx} className="space-y-3 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-bold">{order.id}</span>
                      <span className="font-mono ml-2 text-[10px] text-slate-400">
                        {order.time}
                      </span>
                    </div>
                    <div
                      className={`flex items-center text-xs font-bold ${order.statusColor}`}
                    >
                      {order.statusIcon ? (
                        order.statusIcon
                      ) : (
                        <div
                          className={`mr-1 h-1.5 w-1.5 rounded-full ${order.statusBg}`}
                        />
                      )}
                      {order.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500">
                      {order.clientInitials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {order.client}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.instrument}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="mb-1 text-[10px] text-slate-400">Type</p>
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                          order.type === 'BUY'
                            ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
                            : 'border border-rose-100 bg-rose-50 text-rose-600'
                        }`}
                      >
                        {order.type}
                      </span>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] text-slate-400">Qty</p>
                      <p className="text-xs font-bold">{order.qty}</p>
                      {order.subQty && (
                        <p className="text-[9px] text-slate-400">
                          {order.subQty}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] text-slate-400">Price</p>
                      <p className="text-xs font-bold">${order.price}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                No orders found matching your criteria
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Client
                  </th>
                  <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Instrument
                  </th>
                  <th className="px-4 py-3 text-center text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Qty (OZ)
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Price
                  </th>
                  <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order, idx) => (
                    <tr
                      key={idx}
                      className="group transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-4 xl:px-6 xl:py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold xl:text-sm">
                            {order.id}
                          </span>
                          <span className="font-mono text-[8px] text-slate-400 xl:text-[10px]">
                            {order.time}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 xl:px-6 xl:py-5">
                        <div className="flex items-center gap-2 xl:gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-[8px] font-bold text-slate-500 xl:h-8 xl:w-8 xl:text-[10px]">
                            {order.clientInitials}
                          </div>
                          <span className="text-xs font-semibold text-slate-700 xl:text-sm">
                            {order.client}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 xl:px-6 xl:py-5">
                        <span className="text-xs font-medium text-slate-600 xl:text-sm">
                          {order.instrument}
                        </span>
                      </td>
                      <td className="px-4 py-4 xl:px-6 xl:py-5">
                        <div className="flex justify-center">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wider xl:px-2 xl:text-[10px] ${
                              order.type === 'BUY'
                                ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
                                : 'border border-rose-100 bg-rose-50 text-rose-600'
                            }`}
                          >
                            {order.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right xl:px-6 xl:py-5">
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-xs font-bold xl:text-sm">
                            {order.qty}
                          </span>
                          {order.subQty && (
                            <span className="text-[8px] italic text-slate-400 xl:text-[10px]">
                              {order.subQty}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right xl:px-6 xl:py-5">
                        <span className="font-mono text-xs font-bold xl:text-sm">
                          ${order.price}
                        </span>
                      </td>
                      <td className="px-4 py-4 xl:px-6 xl:py-5">
                        <div
                          className={`flex items-center text-[10px] font-bold xl:text-xs ${order.statusColor}`}
                        >
                          {order.statusIcon ? (
                            order.statusIcon
                          ) : (
                            <div
                              className={`mr-1.5 h-1.5 w-1.5 rounded-full xl:mr-2 xl:h-2 xl:w-2 ${order.statusBg}`}
                            />
                          )}
                          {order.status}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-slate-400"
                    >
                      No orders found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer/Pagination - Responsive */}
          {filteredOrders.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:gap-4 sm:px-6 sm:py-4">
              <span className="order-2 text-[10px] font-medium text-slate-400 sm:order-1 sm:text-xs">
                Showing{' '}
                <span className="font-bold text-slate-600">
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filteredOrders.length,
                  )}
                  -{Math.min(currentPage * itemsPerPage, filteredOrders.length)}
                </span>{' '}
                of{' '}
                <span className="font-bold text-slate-600">
                  {filteredOrders.length}
                </span>{' '}
                orders
              </span>

              <div className="order-1 flex items-center gap-2 sm:order-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-400 transition-colors hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-xs"
                >
                  Previous
                </button>
                <span className="text-xs font-medium text-slate-600 sm:text-sm">
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* No Results Message */}
        {filteredOrders.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-slate-400">
              No orders match your search criteria
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LiveMonitoring;