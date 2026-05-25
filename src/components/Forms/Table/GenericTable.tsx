import React, {useState, useMemo} from 'react';
import {ArrowUp, ArrowUpDown, Edit, Trash, Eye} from 'lucide-react';
import {GrFormNext, GrFormPrevious} from 'react-icons/gr';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface GenericTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  rowsPerPage?: number;
  clickable?: boolean;
}

const GenericTable = <T extends {id?: string}>({
  columns,
  data,
  onRowClick,
  rowsPerPage = 10,
  clickable = true,
}: GenericTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const hasSortable = columns.some((col) => col.sortable);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) =>
      columns.some((col) => {
        if (typeof col.accessor === 'function') {
          const value = col.accessor(row);
          return String(value ?? '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        }

        const value = row[col.accessor];
        return String(value ?? '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      }),
    );
  }, [searchTerm, data, columns]);

  const totalPages = Math.ceil(filteredData?.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData?.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  const formatDateInIST = (value: string) => {
    if (!value) return '-';

    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    const hasTime =
      value.includes('T') || value.includes(':') || value.match(/\d{2}:\d{2}/);

    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(hasTime && {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    });
  };

  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((p) => Math.min(p + 1, totalPages));

  const handleRowClick = (row: T) => {
    if (clickable && onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-boxdark">
      {hasSortable && (
        <div className="mb-2 flex items-center justify-between px-4 py-2 dark:bg-boxdark">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-stroke bg-neutral-100 dark:border-strokedark dark:bg-meta-4">
              <th className="px-4 py-3 text-left font-semibold text-black dark:text-white">
                Sr. No.
              </th>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="text-md px-4 py-3 text-left font-semibold text-black dark:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <ArrowUp className="text-gray-400 h-4 w-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-stroke dark:divide-strokedark">
            {paginatedData?.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={(row.id as string) || rowIndex}
                  onClick={() => handleRowClick(row)}
                  className={`${clickable && onRowClick ? 'hover:bg-gray-50 cursor-pointer transition-colors dark:hover:bg-meta-4' : ''} ${
                    row.isDummy
                      ? 'bg-[#eff4ff]'
                      : row.perticular === 'BREAK'
                        ? 'bg-[#f5f2e5] text-orange-700'
                        : rowIndex % 2 === 0
                          ? 'bg-white dark:bg-boxdark'
                          : 'bg-neutral-50 dark:bg-meta-4'
                  }`}
                >
                  <td className="text-gray-700 dark:text-gray-300 px-4 py-4.5 text-sm">
                    {(currentPage - 1) * rowsPerPage + rowIndex + 1}
                  </td>
                  {columns.map((col, colIndex) => {
                    if (col.render) {
                      return (
                        <td
                          key={colIndex}
                          className="dark:text-gray-300 px-4 py-3 text-sm text-black"
                        >
                          {col.render(row)}
                        </td>
                      );
                    }

                    let cellValue: any;
                    if (typeof col.accessor === 'function') {
                      cellValue = col.accessor(row);
                    } else {
                      cellValue = row[col.accessor];
                    }

                    if (
                      (typeof col.accessor === 'string' &&
                        col.accessor.toLowerCase() === 'status') ||
                      col.header.toLowerCase() === 'status'
                    ) {
                      return (
                        <td
                          key={colIndex}
                          className="text-gray-700 dark:text-gray-300 px-4 py-4 text-sm"
                        >
                          {cellValue}
                        </td>
                      );
                    }

                    const isValidDateString = (value: string) => {
                      return (
                        /^\d{4}-\d{2}-\d{2}/.test(value) ||
                        /^\d{4}-\d{2}-\d{2}T/.test(value)
                      );
                    };

                    const displayValue =
                      typeof cellValue === 'string' &&
                      isValidDateString(cellValue)
                        ? formatDateInIST(cellValue)
                        : (cellValue ?? '-');

                    return (
                      <td
                        key={colIndex}
                        className="text-gray-700 dark:text-gray-300 px-4 py-3 text-sm"
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-gray-500 dark:text-gray-400 px-6 py-8 text-center text-sm"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-gray-100 dark:bg-gray-700 flex h-12 w-12 items-center justify-center rounded-full">
                      <span className="text-2xl">📝</span>
                    </div>
                    <p>No data available</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.length > 0 && (
        <div className="flex items-center justify-between border-t border-stroke px-4 py-2 dark:border-strokedark">
          <span className="dark:text-gray-300 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <div className="space-x-2">
            <button
              className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <GrFormPrevious className="h-4 w-4" />
            </button>
            <button
              className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
              onClick={handleNextPage}
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

export default GenericTable;
