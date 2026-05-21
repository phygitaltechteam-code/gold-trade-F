import React, {useState} from 'react';
import {FiEdit, FiEye, FiTrash} from 'react-icons/fi';
import {GrFormNext, GrFormPrevious} from 'react-icons/gr';

const SuperBrokerTable = ({
  data = [],
  onView,
  onEdit,
  onDelete,
  refreshTrigger,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({key: null, direction: 'asc'});
  const itemsPerPage = 10;

  // Filter data based on search
  const filteredData = data.filter((item) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      item?.fullname?.toLowerCase().includes(searchTerm) ||
      item?.SBID?.toLowerCase().includes(searchTerm) ||
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
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    });
  };

  const handleViewImage = (imageUrl) => {
    if (imageUrl && typeof imageUrl === 'string') {
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-4 pb-2 pt-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Broker List (Total: {data.length})
        </h2>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-64 rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[60px] px-3 py-2.5 font-medium text-black dark:text-white">
                S.No
              </th>
              <th
                className="min-w-[120px] cursor-pointer px-3 py-2.5 font-medium text-black dark:text-white"
                onClick={() => handleSort('SBID')}
              >
                SB ID{' '}
                {sortConfig.key === 'SBID' &&
                  (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="min-w-[150px] cursor-pointer px-3 py-2.5 font-medium text-black dark:text-white"
                onClick={() => handleSort('fullname')}
              >
                Name{' '}
                {sortConfig.key === 'fullname' &&
                  (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="min-w-[120px] px-3 py-2.5 font-medium text-black dark:text-white">
                Phone Number
              </th>
              <th className="min-w-[150px] px-3 py-2.5 font-medium text-black dark:text-white">
                Area
              </th>
              <th className="min-w-[100px] px-3 py-2.5 font-medium text-black dark:text-white">
                Commision%
              </th>
              <th className="min-w-[100px] px-3 py-2.5 font-medium text-black dark:text-white">
                No. Broker
              </th>
              <th className="min-w-[150px] px-3 py-2.5 font-medium text-black dark:text-white">
                Total Buisness
              </th>
              <th className="min-w-[120px] px-3 py-2.5 font-medium text-black dark:text-white">
                Total Commision
              </th>
              <th className="min-w-[120px] px-3 py-2.5 font-medium text-black dark:text-white">
                Pending Commision
              </th>
              <th className="min-w-[100px] px-3 py-2.5 font-medium text-black dark:text-white">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={item?.id || index}
                className="hover:bg-gray-50 cursor-pointer text-sm transition-colors dark:hover:bg-meta-4"
                onClick={() => onView?.(item)}
              >
                <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                  {item?.SBID || 'N/A'}
                </td>
                <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                  {item?.fullname || 'N/A'}
                </td>
                <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                  {item?.phoneNumber || 'N/A'}
                </td>
                <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                  {item?.area || 'N/A'}
                </td>
                <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                  {item?.commission ? `${item.commission}%` : 'N/A'}
                </td>
                <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                  {item?.totalBrokers || '0'}
                </td>
                <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                  ₹{item?.totalBusiness || '0'}
                </td>
                <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                  ₹{item?.totalCommission || '0'}
                </td>
                <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                  ₹{item?.pendingCommission || '0'}
                </td>
                <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      item?.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {/* <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView?.(item);
                      }}
                      className="rounded p-1 text-blue-600 hover:bg-blue-50"
                      title="View"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(item);
                      }}
                      className="rounded p-1 text-green-600 hover:bg-green-50"
                      title="Edit"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(item);
                      }}
                      className="rounded p-1 text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <FiTrash className="h-4 w-4" />
                    </button>
                  </div>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginatedData.length === 0 && (
        <div className="text-gray-500 py-8 text-center">No brokers found</div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              className="hover:bg-gray-100 rounded border p-1.5 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <GrFormPrevious className="h-4 w-4" />
            </button>
            <button
              className="hover:bg-gray-100 rounded border p-1.5 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <GrFormNext className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperBrokerTable;
