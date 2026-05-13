import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const CustomBrokerTable = ({ 
  data, 
  onView, 
  onEdit, 
  onDelete,
  refreshTrigger 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const itemsPerPage = 10;

  // Filter data based on search
  const filteredData = data.filter((item) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      item?.fullname?.toLowerCase().includes(searchTerm) ||
      item?.BKId?.toLowerCase().includes(searchTerm) ||
      item?.phoneNumber?.toLowerCase().includes(searchTerm)
    );
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key] || '';
    const bVal = b[sortConfig.key] || '';
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-1 h-3 w-3 text-slate-400" />;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="ml-1 h-3 w-3 text-[#F57F3D]" /> : 
      <ArrowDown className="ml-1 h-3 w-3 text-[#F57F3D]" />;
  };

  const getInitials = (name) => {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm font-inter">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 p-5 gap-4">
        <h2 className="text-lg font-bold text-[#0F1535]">Broker Queue</h2>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, ID, or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-80 rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-[#0F1535] placeholder-slate-400 outline-none transition focus:border-[#F57F3D] focus:ring-1 focus:ring-[#F57F3D]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                Broker Details
              </th>
              <th 
                className="cursor-pointer px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('BKId')}
              >
                <div className="flex items-center">ID {getSortIcon('BKId')}</div>
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                Contact & Area
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                Stats
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                Commission
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((item, index) => (
              <tr 
                key={item?.id || index} 
                className="group cursor-pointer bg-white transition-colors hover:bg-slate-50"
                onClick={() => onView?.(item)}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {getInitials(item?.fullname)}
                    </div>
                    <div>
                      <div className="font-semibold text-[#0F1535]">{item?.fullname || 'N/A'}</div>
                      <div className="text-xs text-slate-500">Broker</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-slate-600">
                  {item?.BKId || 'N/A'}
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-[#0F1535]">{item?.phoneNumber || 'N/A'}</div>
                  <div className="text-xs text-slate-500">{item?.area || 'N/A'}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-[#0F1535]">{item?.totalCustomers || '0'} Customers</div>
                  <div className="text-xs text-slate-500">₹{item?.totalBusiness?.toLocaleString() || '0'} Vol</div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm font-bold text-[#F57F3D]">₹{item?.totalCommission?.toLocaleString() || '0'}</div>
                  <div className="text-xs text-slate-500">{item?.commission ? `${item.commission}% Rate` : 'N/A'}</div>
                </td>
                <td className="px-5 py-4">
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item?.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${item?.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    {item?.isActive ? 'Active' : 'Inactive'}
                  </div>
                </td>
              </tr>
            ))}
            
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="mb-2 h-8 w-8 text-slate-300" />
                    <p>No brokers found matching your criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 bg-white rounded-b-xl">
          <div className="text-sm text-slate-500">
            Showing <span className="font-semibold text-[#0F1535]">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-[#0F1535]">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of <span className="font-semibold text-[#0F1535]">{sortedData.length}</span> results
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              // Show limited pages logic (e.g. 1 2 3 ... 10)
              if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded border text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'border-[#F57F3D] bg-[#F57F3D]/5 text-[#F57F3D]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-1 text-slate-400">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomBrokerTable;