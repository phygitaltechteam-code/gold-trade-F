import React, { useState, useMemo } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';

interface Order {
  id: string;
  time: string;
  client: string;
  sript: string;
  holdingType: string;

  paidAmount: string;
  totalAmount: string;
  marginAmount: string;

  type: 'BUY' | 'SELL';
  qty: string;
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
      type: 'BUY',
      sript: 'Gold Spot',
      holdingType: 'Bullion',
      qty: '50.00',
      price: '1,942.10',
      status: 'Pending',
      statusColor: 'text-slate-400',
      statusBg: 'bg-slate-400',
      paidAmount: '100',
      totalAmount: '200',
      marginAmount: '300',
    },
    {
      id: '#8822',
      time: '10:41:55',
      client: 'Jane Smith',
      type: 'SELL',
      sript: 'Gold Spot',
      holdingType: 'Bullion',
      qty: '1,500.00',
      price: '1,955.00',
      status: 'Flagged',
      statusColor: 'text-orange-500',
      statusIcon: <AlertTriangle className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />,
      paidAmount: '100',
      totalAmount: '200',
      marginAmount: '300',
    },
    {
      id: '#8819',
      time: '10:40:12',
      client: 'Gold Star Inc',
      type: 'BUY',
      sript: 'Gold Spot',
      holdingType: 'Bullion',
      qty: '120.00',
      price: '1,941.80',
      status: 'Executed',
      statusColor: 'text-emerald-500',
      statusIcon: <CheckCircle2 className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />,
      paidAmount: '100',
      totalAmount: '200',
      marginAmount: '300',
    },
    {
      id: '#8815',
      time: '10:38:45',
      client: 'TradeCorp',
      type: 'SELL',
      sript: 'Gold Spot',
      holdingType: 'Bullion',
      qty: '200.00',
      price: '1,958.00',
      status: 'Partial',
      statusColor: 'text-blue-500',
      statusBg: 'bg-blue-500',
      paidAmount: '100',
      totalAmount: '200',
      marginAmount: '300',
    },
    {
      id: '#8811',
      time: '10:35:10',
      client: 'Market Makers Ltd',
      type: 'BUY',
      sript: 'Gold Spot',
      holdingType: 'Bullion',
      qty: '75.00',
      price: '1,942.05',
      status: 'Pending',
      statusColor: 'text-slate-400',
      statusBg: 'bg-slate-400',
      paidAmount: '100',
      totalAmount: '200',
      marginAmount: '300',
    },
    {
      id: '#8808',
      time: '10:32:22',
      client: 'Alpha Investments',
      type: 'BUY',
      sript: 'Gold Spot',
      holdingType: 'Bullion',
      qty: '300.00',
      price: '1,944.50',
      status: 'Pending',
      statusColor: 'text-slate-400',
      statusBg: 'bg-slate-400',
      paidAmount: '100',
      totalAmount: '200',
      marginAmount: '300',
    },
    {
      id: '#8805',
      time: '10:28:15',
      client: 'Beta Trading',
      type: 'SELL',
      sript: 'Gold Spot',
      holdingType: 'Bullion',
      qty: '45.00',
      price: '1,943.20',
      status: 'Executed',
      statusColor: 'text-emerald-500',
      statusIcon: <CheckCircle2 className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />,
      paidAmount: '100',
      totalAmount: '200',
      marginAmount: '300',
    },
  ];

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.sript.toLowerCase().includes(searchTerm.toLowerCase());

      // Instrument filter
      const matchesFilter =
        selectedFilter === 'All' ||
        (selectedFilter === 'Spot' && order.sript.includes('Spot')) ||
        (selectedFilter === 'Futures' && order.sript.includes('Futures'));

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
        order.type,
        order.qty,
        order.price,
        order.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
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
      <main className="mx-auto w-full px-2 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
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
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
                  style={{ width: `${buyVolume}%` }}
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
                  className={`rounded-md px-4 py-1.5 text-xs font-bold transition-all ${selectedFilter === filter
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
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
                      className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${selectedFilter === filter
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
          {/* Table View (Responsive Scroll) */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Sr
                  </th>
                  <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Date/Time
                  </th>
                  <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Client Name
                  </th>
                  <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Script
                  </th>
                  <th className="px-4 py-3 text-center text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Qty (OZ)
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Holding Type
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Price
                  </th>
                  <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Paid Amount
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
                    Margin Amount
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-bold uppercase tracking-widest text-slate-400 xl:px-6 xl:py-4 xl:text-[10px]">
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
                      {/* Sr */}
                      <td className="px-4 py-4 text-xs font-medium text-slate-500 xl:px-6 xl:py-5">
                        {idx + 1}
                      </td>

                      {/* Date/Time */}
                      <td className="font-mono px-4 py-4 text-[10px] text-slate-500 xl:px-6 xl:py-5 xl:text-xs">
                        {order.time}
                      </td>

                      {/* Order ID */}
                      <td className="px-4 py-4 text-xs font-bold text-slate-700 xl:px-6 xl:py-5 xl:text-sm">
                        {order.id}
                      </td>

                      {/* Client Name */}
                      <td className="px-4 py-4 xl:px-6 xl:py-5">
                        <div className="flex items-center gap-2 xl:gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-[8px] font-bold text-slate-500 xl:h-8 xl:w-8 xl:text-[10px]">
                            {order.client
                              .split(' ')
                              .map((word) => word[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <span className="text-xs font-semibold text-slate-700 xl:text-sm">
                            {order.client}
                          </span>
                        </div>
                      </td>

                      {/* Script */}
                      <td className="px-4 py-4 text-xs font-semibold text-slate-700 xl:px-6 xl:py-5 xl:text-sm">
                        {order.sript}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-4 text-center xl:px-6 xl:py-5">
                        <div className="flex justify-center">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wider xl:px-2 xl:text-[10px] ${order.type === 'BUY'
                                ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
                                : 'border border-rose-100 bg-rose-50 text-rose-600'
                              }`}
                          >
                            {order.type}
                          </span>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="font-mono px-4 py-4 text-right text-xs font-bold xl:px-6 xl:py-5 xl:text-sm">
                        {order.qty}
                      </td>

                      {/* Holding Type */}
                      <td className="px-4 py-4 text-right text-xs text-slate-500 xl:px-6 xl:py-5">
                        {order.holdingType}
                      </td>

                      {/* Price */}
                      <td className="font-mono px-4 py-4 text-right text-xs font-bold xl:px-6 xl:py-5 xl:text-sm">
                        ₹ {order.price}
                      </td>

                      {/* Total Amount */}
                      <td className="font-mono px-4 py-4 text-right text-xs font-bold text-slate-700 xl:px-6 xl:py-5 xl:text-sm">
                        ₹ {order.totalAmount}
                      </td>

                      {/* Paid Amount */}
                      <td className="font-mono px-4 py-4 text-right text-xs font-semibold text-emerald-600 xl:px-6 xl:py-5 xl:text-sm">
                        ₹ {order.paidAmount}
                      </td>

                      {/* Margin Amount */}
                      <td className="font-mono px-4 py-4 text-right text-xs font-semibold text-orange-500 xl:px-6 xl:py-5 xl:text-sm">
                        ₹ {order.marginAmount}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 xl:px-6 xl:py-5">
                        <div
                          className={`flex items-center justify-end text-[10px] font-bold xl:text-xs ${order.statusColor}`}
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
                      colSpan={13}
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
