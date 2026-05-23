// // import React, {useState} from 'react';
// // import {FiEdit, FiEye} from 'react-icons/fi';
// // import {GrFormNext, GrFormPrevious} from 'react-icons/gr';
// // import {MdDelete} from 'react-icons/md';

// // type Button<T> = {
// //   label: string;
// //   onClick: (item: T) => void;
// //   className?: string;
// //   icon?: React.ReactNode;
// // };

// // export type Column<T> = {
// //   header: string;
// //   accessor: keyof T | ((item: T) => React.ReactNode);
// //   render?: (item: T) => React.ReactNode;
// //   className?: string;
// //   buttons?: Button<T>[];
// //   sortable?: boolean;
// //   action?: boolean;
// //   onEdit?: (item: T) => void;
// //   onDelete?: (item: T) => void;
// //   onView?: (item: T) => void;
// // };

// // type GenericTableProps<T> = {
// //   data: T[];
// //   columns: Column<T>[];
// //   itemsPerPage?: number;
// //   searchAble?: boolean;
// //   title?: string;
// //   action?: boolean;
// //   onEdit?: (item: T) => void;
// //   onDelete?: (item: T) => void;
// //   onView?: (item: T) => void;
// //   paginationOff?: boolean;
// //   viewTooltip?: string;
// //   editTooltip?: string;
// //   deleteTooltip?: string;
// // };

// // const GenericTable = <T,>({
// //   data,
// //   columns,
// //   itemsPerPage = 5,
// //   searchAble,
// //   action,
// //   title,
// //   onEdit: handleEdit,
// //   onDelete: handleDelete,
// //   onView: handleView,
// //   paginationOff = false,
// //   viewTooltip,
// //   editTooltip,
// //   deleteTooltip,
// // }: GenericTableProps<T>) => {
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [sortConfig, setSortConfig] = useState<{
// //     key: keyof T;
// //     direction: 'asc' | 'desc';
// //   } | null>(null);

// //   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     setSearchQuery(e.target.value);
// //     setCurrentPage(1);
// //   };

// //   const sortedData = React.useMemo(() => {
// //     const sortableData = [...data];
// //     if (sortConfig !== null) {
// //       sortableData.sort((a, b) => {
// //         const aValue =
// //           typeof sortConfig.key === 'function'
// //             ? (sortConfig.key as (a: T) => string | number | boolean)(a)
// //             : a[sortConfig.key];
// //         const bValue =
// //           typeof sortConfig.key === 'function'
// //             ? (sortConfig.key as (a: T) => string | number | boolean)(b)
// //             : b[sortConfig.key];

// //         if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
// //         if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
// //         return 0;
// //       });
// //     }
// //     return sortableData;
// //   }, [data, sortConfig]);

// //   const handleSort = (key: keyof T) => {
// //     let direction: 'asc' | 'desc' = 'asc';
// //     if (
// //       sortConfig &&
// //       sortConfig.key === key &&
// //       sortConfig.direction === 'asc'
// //     ) {
// //       direction = 'desc';
// //     }
// //     setSortConfig({key, direction});
// //   };

// //   const filteredData = sortedData.filter((item) =>
// //     columns.some((column) => {
// //       const value =
// //         typeof column.accessor === 'function'
// //           ? column.accessor(item)
// //           : item[column.accessor];

// //       // Safely convert value to string for search
// //       if (value === null || value === undefined) return false;
// //       if (typeof value === 'object') return false; // Skip objects for search
// //       return value.toString().toLowerCase().includes(searchQuery.toLowerCase());
// //     }),
// //   );

// //   const totalItems = filteredData.length;
// //   const totalPages = Math.ceil(totalItems / itemsPerPage);
// //   const startIdx = (currentPage - 1) * itemsPerPage;

// //   const paginatedData = paginationOff
// //     ? filteredData
// //     : filteredData.slice(startIdx, startIdx + itemsPerPage);

// //   // Helper function to safely render cell content
// //   const renderCellContent = (value: any): React.ReactNode => {
// //     if (value === null || value === undefined) return '-';
// //     if (typeof value === 'string') return value;
// //     if (typeof value === 'number') return value.toString();
// //     if (typeof value === 'boolean') return value ? 'Yes' : 'No';
// //     if (React.isValidElement(value)) return value;
// //     if (typeof value === 'object') {
// //       // For objects, try to stringify safely
// //       try {
// //         return JSON.stringify(value);
// //       } catch {
// //         return '[Complex Data]';
// //       }
// //     }
// //     return String(value);
// //   };

// //   return (
// //     <div className="rounded-sm border border-stroke bg-white px-2 pb-2 pt-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-1">
// //       {title && <h2 className="mb-3 text-lg font-semibold">{title}</h2>}
// //       {searchAble && (
// //         <div className="mb-3 flex justify-between">
// //           <input
// //             type="text"
// //             placeholder="Search..."
// //             value={searchQuery}
// //             onChange={handleSearch}
// //             className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
// //           />
// //         </div>
// //       )}
// //       <div className="max-w-full overflow-x-auto">
// //         <table className="w-full table-auto">
// //           <thead>
// //             <tr className="bg-gray-2 text-left dark:bg-meta-4">
// //               {columns.map((column, index) => (
// //                 <th
// //                   key={index}
// //                   className={`min-w-[120px] px-3 py-2.5 font-medium text-black dark:text-white ${column.className || ''}`}
// //                   onClick={
// //                     column.sortable
// //                       ? () => handleSort(column.accessor as keyof T)
// //                       : undefined
// //                   }
// //                   style={{cursor: column.sortable ? 'pointer' : 'default'}}
// //                 >
// //                   <div className="text-sm">
// //                     {column.header}{' '}
// //                     {sortConfig?.key === column.accessor
// //                       ? sortConfig.direction === 'asc'
// //                         ? '↑'
// //                         : '↓'
// //                       : null}
// //                   </div>
// //                 </th>
// //               ))}
// //               {action && (
// //                 <th className="min-w-[100px] px-3 py-2.5">
// //                   <div className="text-sm">Action</div>
// //                 </th>
// //               )}
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {paginatedData.map((item, rowIndex) => (
// //               <tr key={rowIndex} className="text-sm">
// //                 {columns.map((column, colIndex) => {
// //                   const value =
// //                     typeof column.accessor === 'function'
// //                       ? column.accessor(item)
// //                       : item[column.accessor];

// //                   return (
// //                     <td
// //                       key={colIndex}
// //                       className="border-b border-[#eee] px-3 py-2 dark:border-strokedark"
// //                     >
// //                       <div className="py-1.5">
// //                         {column.render
// //                           ? column.render(item)
// //                           : renderCellContent(value)}
// //                         {column.buttons && (
// //                           <div className="mt-1.5 space-x-2">
// //                             {column.buttons.map((button, btnIndex) => (
// //                               <button
// //                                 key={btnIndex}
// //                                 onClick={() => button.onClick(item)}
// //                                 className={`rounded px-2 py-1 text-xs ${button.className || ''}`}
// //                               >
// //                                 {button.icon || button.label}
// //                               </button>
// //                             ))}
// //                           </div>
// //                         )}
// //                       </div>
// //                     </td>
// //                   );
// //                 })}
// //                 {action && (
// //                   <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
// //                     <div className="flex items-center justify-center gap-0.5">
// //                       {handleView && (
// //                         <button
// //                           className="inline-flex items-center justify-center rounded p-1 hover:text-primary dark:hover:text-secondary"
// //                           onClick={() => handleView(item)}
// //                           title={viewTooltip || 'View'}
// //                           aria-label={viewTooltip || 'View'}
// //                         >
// //                           <FiEye className="h-3.5 w-3.5" />
// //                         </button>
// //                       )}
// //                       {handleEdit && (
// //                         <button
// //                           className="inline-flex items-center justify-center rounded p-1 hover:text-primary dark:hover:text-secondary"
// //                           onClick={() => handleEdit(item)}
// //                           title={editTooltip || 'Edit'}
// //                         >
// //                           <FiEdit className="h-3.5 w-3.5" />
// //                         </button>
// //                       )}
// //                       {handleDelete && (
// //                         <button
// //                           className="inline-flex items-center justify-center rounded p-1 hover:text-primary dark:hover:text-secondary"
// //                           onClick={() => handleDelete(item)}
// //                           title={deleteTooltip || 'Delete'}
// //                         >
// //                           <MdDelete className="h-3.5 w-3.5" />
// //                         </button>
// //                       )}
// //                     </div>
// //                   </td>
// //                 )}
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>

// //       {/* Pagination Controls */}
// //       {!paginationOff && totalPages > 0 && (
// //         <div className="mt-3 flex items-center justify-between">
// //           <span className="text-sm">
// //             Page {currentPage} of {totalPages}
// //           </span>
// //           <div className="space-x-2">
// //             <button
// //               className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
// //               onClick={() => setCurrentPage(currentPage - 1)}
// //               disabled={currentPage === 1}
// //             >
// //               <GrFormPrevious className="h-4 w-4" />
// //             </button>
// //             <button
// //               className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
// //               onClick={() => setCurrentPage(currentPage + 1)}
// //               disabled={currentPage === totalPages}
// //             >
// //               <GrFormNext className="h-4 w-4" />
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default GenericTable;

// import React, {useState, useMemo} from 'react';
// import {ArrowUp, ArrowUpDown, Edit, Trash} from 'lucide-react';
// import {GrFormNext, GrFormPrevious} from 'react-icons/gr';

// interface Column<T> {
//   header: string;
//   accessor: keyof T | ((row: T) => React.ReactNode);
//   sortable?: boolean;
//   render?: (item: T) => React.ReactNode;
// }

// interface GenericTableProps<T> {
//   columns: Column<T>[];
//   data: T[];
//   onEdit?: (row: T) => void;
//   onDelete?: (row: T) => void;
//   rowsPerPage?: number;
// }

// const GenericTable = <T extends {id?: string}>({
//   columns,
//   data,
//   onEdit,
//   onDelete,
//   rowsPerPage = 10,
// }: GenericTableProps<T>) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const hasSortable = columns.some((col) => col.sortable);

//   const filteredData = useMemo(() => {
//     if (!searchTerm) return data;

//     return data.filter((row) =>
//       columns.some((col) => {
//         if (typeof col.accessor === 'function') {
//           const value = col.accessor(row);
//           return String(value ?? '')
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase());
//         }

//         const value = row[col.accessor];
//         return String(value ?? '')
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase());
//       }),
//     );
//   }, [searchTerm, data, columns]);

//   const totalPages = Math.ceil(filteredData?.length / rowsPerPage);
//   const startIndex = (currentPage - 1) * rowsPerPage;
//   const paginatedData = filteredData?.slice(
//     startIndex,
//     startIndex + rowsPerPage,
//   );

//   const formatDateInIST = (value: string) => {
//     if (!value) return '-';

//     const date = new Date(value);
//     if (isNaN(date.getTime())) return value;

//     const hasTime =
//       value.includes('T') || value.includes(':') || value.match(/\d{2}:\d{2}/);

//     return date.toLocaleString('en-IN', {
//       timeZone: 'Asia/Kolkata',
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       ...(hasTime && {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true,
//       }),
//     });
//   };

//   const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
//   const handleNextPage = () =>
//     setCurrentPage((p) => Math.min(p + 1, totalPages));

//   return (
//     <div className="overflow-x-auto rounded-md bg-white pt-4 dark:bg-boxdark">
//       {hasSortable && (
//         <div className="dark:bg-boxdarkpy-2 mb-2 flex items-center justify-between">
//           <input
//             type="text"
//             placeholder="Search..."
//             className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setCurrentPage(1);
//             }}
//           />
//         </div>
//       )}

//       <table className="min-w-full border-collapse">
//         <thead className="bg-neutral-100 py-2 dark:bg-meta-4 dark:text-white">
//           <tr>
//             <th className="px-4 py-3 text-left font-semibold text-black dark:text-white">
//               Sr. No.
//             </th>
//             {columns.map((col, idx) => (
//               <th
//                 key={idx}
//                 className="text-md px-4 py-3 text-left font-semibold text-black dark:text-white"
//               >
//                 <div className="flex items-center gap-1">
//                   <span>{col.header}</span>

//                   {col.sortable && (
//                     <ArrowUp
//                       className="text-gray-400 h-4 w-3"
//                       title="Searchable column"
//                     />
//                   )}
//                 </div>
//               </th>
//             ))}

//             {(onEdit || onDelete) && (
//               <th className="text-md px-4 py-3 text-left font-semibold text-black dark:text-white">
//                 Action
//               </th>
//             )}
//           </tr>
//         </thead>

//         <tbody className="divide-y divide-stroke dark:divide-strokedark">
//           {paginatedData?.length > 0 ? (
//             paginatedData.map((row, rowIndex) => (
//               <tr
//                 key={(row.id as string) || rowIndex}
//                 className={` ${
//                   row.isDummy
//                     ? 'border-b border-[#eee] bg-[#eff4ff]'
//                     : row.perticular === 'BREAK'
//                       ? 'bg-[#f5f2e5] text-orange-700'
//                       : rowIndex % 2 === 0
//                         ? 'bg-white dark:bg-boxdark'
//                         : 'bg-neutral-50 dark:bg-meta-4'
//                 } `}
//               >
//                 <td className="text-gray-700 dark:text-gray-300 px-4 py-3 text-sm">
//                   {(currentPage - 1) * rowsPerPage + rowIndex + 1}
//                 </td>
//                 {columns.map((col, colIndex) => {
//                   if (col.render) {
//                     return (
//                       <td
//                         key={colIndex}
//                         className="dark:text-gray-300 px-4 py-3 text-sm text-black"
//                       >
//                         {col.render(row)}
//                       </td>
//                     );
//                   }

//                   let cellValue: any;
//                   if (typeof col.accessor === 'function') {
//                     cellValue = col.accessor(row);
//                   } else {
//                     cellValue = row[col.accessor];
//                   }

//                   if (
//                     (typeof col.accessor === 'string' &&
//                       col.accessor.toLowerCase() === 'status') ||
//                     col.header.toLowerCase() === 'status'
//                   ) {
//                     return (
//                       <td
//                         key={colIndex}
//                         className="text-gray-700 dark:text-gray-300 px-4 py-4 text-sm"
//                       >
//                         cellValue
//                       </td>
//                     );
//                   }

//                   const isValidDateString = (value: string) => {
//                     return (
//                       /^\d{4}-\d{2}-\d{2}/.test(value) ||
//                       /^\d{4}-\d{2}-\d{2}T/.test(value)
//                     );
//                   };

//                   const displayValue =
//                     typeof cellValue === 'string' &&
//                     isValidDateString(cellValue)
//                       ? formatDateInIST(cellValue)
//                       : (cellValue ?? '-');

//                   return (
//                     <td
//                       key={colIndex}
//                       className="text-gray-700 dark:text-gray-300 px-4 py-3 text-sm"
//                     >
//                       {displayValue}
//                     </td>
//                   );
//                 })}

//                 {(onEdit || onDelete) && (
//                   <td className="text-gray-700 dark:text-gray-300 px-4 py-3 text-sm">
//                     <div className="flex items-center gap-3">
//                       {onEdit && (
//                         <button
//                           onClick={() => onEdit(row)}
//                           className="text-[#0284C7] transition"
//                         >
//                           <Edit className="h-4 w-4" />
//                         </button>
//                       )}
//                       {onDelete && (
//                         <button
//                           onClick={() => onDelete(row)}
//                           className="text-red-400 transition hover:text-red-600"
//                         >
//                           <Trash className="h-4 w-4" />
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 )}
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td
//                 colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
//                 className="text-gray-500 dark:text-gray-400 px-6 py-8 text-center text-sm"
//               >
//                 <div className="flex flex-col items-center gap-2">
//                   <div className="bg-gray-100 dark:bg-gray-700 flex h-12 w-12 items-center justify-center rounded-full">
//                     <span className="text-2xl">📝</span>
//                   </div>
//                   <p>No data available</p>
//                 </div>
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {/* 📄 Pagination */}
//       {data?.length > 0 && (
//         <div className="flex items-center justify-between border-t border-stroke px-4 py-2 dark:border-strokedark">
//           <span className="dark:text-gray-300 text-sm">
//             Page {currentPage} of {totalPages}
//           </span>
//           <div className="space-x-2">
//             <button
//               className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
//               onClick={handlePrevPage}
//               disabled={currentPage === 1}
//             >
//               <GrFormPrevious className="h-4 w-4" />
//             </button>
//             <button
//               className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
//               onClick={handleNextPage}
//               disabled={currentPage === totalPages}
//             >
//               <GrFormNext className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default GenericTable;
import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowUpDown, Edit, Trash, Eye } from 'lucide-react';
import { GrFormNext, GrFormPrevious } from 'react-icons/gr';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface GenericTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;  // New prop for row click
  rowsPerPage?: number;
  clickable?: boolean;  // Make entire row clickable
}

const GenericTable = <T extends { id?: string }>({
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
    <div className="overflow-x-auto rounded-md bg-white pt-4 dark:bg-boxdark">
      {hasSortable && (
        <div className="dark:bg-boxdark py-2 mb-2 flex items-center justify-between">
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

      <table className="min-w-full border-collapse border border-gray-100">
        <thead className="bg-neutral-100 py-2 dark:bg-meta-4 dark:text-white">
          <tr>
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
                    <ArrowUp
                      className="text-gray-400 h-4 w-3"
                      title="Searchable column"
                    />
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
                className={`
                  ${clickable && onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors' : ''}
                  ${row.isDummy
                    ? 'border-b border-[#eee] bg-[#eff4ff]'
                    : row.perticular === 'BREAK'
                      ? 'bg-[#f5f2e5] text-orange-700'
                      : rowIndex % 2 === 0
                        ? 'bg-white dark:bg-boxdark'
                        : 'bg-neutral-50 dark:bg-meta-4'
                  }
                `}
              >
                <td className="text-gray-700 dark:text-gray-300 px-4 py-3 text-sm">
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
                    typeof cellValue === 'string' && isValidDateString(cellValue)
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

      {/* 📄 Pagination */}
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