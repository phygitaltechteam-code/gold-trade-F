import React, {useEffect, useState} from 'react';
import toast from 'react-hot-toast';
import {useGetScriptsData} from '@/lib/api/addbroker';

type Script = {
  id: number | string;
  symbol: string;
  name: string;
  type: string;
  lastPrice: string;
  expiry: string;
  instrumentsToken: number;
  isActive?: boolean;
};

type Column = {
  header: string;
  accessor: keyof Script | ((script: Script, index: number) => any);
  cell?: (value: any, row: Script) => React.ReactNode;
};

export const DisplayScripts: React.FC = () => {
  const {data, isLoading, isPending, isSuccess} = useGetScriptsData();

  const [scripts, setScripts] = useState<Script[]>([]);
  const [togglingId, setTogglingId] = useState<number | string | null>(null);

  useEffect(() => {
    // CASE 1: API returns direct array
    if (Array.isArray(data)) {
      const formattedData = data.map((item: Script) => ({
        ...item,
        isActive: false,
      }));

      setScripts(formattedData);
    }

    // CASE 3: API returns { scripts: [] }
  }, [data, isLoading, isPending, isSuccess]);

  const handleToggle = async (script: Script) => {
    setTogglingId(script.id);

    try {
      // Fake API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setScripts((prev) =>
        prev.map((s) =>
          s.id === script.id ? {...s, isActive: !s.isActive} : s,
        ),
      );

      toast.success(
        `Script ${!script.isActive ? 'enabled' : 'disabled'} successfully!`,
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle script');
    } finally {
      setTogglingId(null);
    }
  };

  const columns: Column[] = [
    {
      header: 'Sr No',
      accessor: (_: Script, index: number) => index + 1,
    },
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Symbol',
      accessor: 'symbol',
    },
    {
      header: 'Type',
      accessor: 'type',
    },
    {
      header: 'Price',
      accessor: 'lastPrice',
      cell: (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`,
    },
    {
      header: 'Expiry',
      accessor: 'expiry',
      cell: (value) =>
        value ? new Date(value).toLocaleDateString('en-IN') : '-',
    },
    {
      header: 'Status',
      accessor: 'isActive',
      cell: (value) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'isActive',
      cell: (value, row) => (
        <button
          onClick={() => handleToggle(row)}
          disabled={togglingId === row?.id}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            value ? 'bg-blue-600' : 'bg-slate-400'
          } ${
            togglingId === row?.id
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              value ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSuccess) {
    return <div className="p-6 text-red-600">Failed to load scripts</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-gray-900 text-2xl font-semibold">
          Scripts Management
        </h1>

        <p className="text-gray-500 mt-1 text-sm">
          Manage your trading scripts and their status
        </p>
      </div>

      {/* DEBUG */}
      {/* <div className="mb-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div> */}

      <div className="border-gray-200 overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="divide-gray-200 min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="text-gray-500 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-gray-200 divide-y bg-white">
              {scripts.length > 0 ? (
                scripts.map((script, index) => (
                  <tr
                    key={script.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((col, colIdx) => {
                      const value =
                        typeof col.accessor === 'function'
                          ? col.accessor(script, index)
                          : script[col.accessor];

                      return (
                        <td
                          key={colIdx}
                          className="text-gray-900 whitespace-nowrap px-6 py-4 text-sm"
                        >
                          {col.cell ? col.cell(value, script) : value}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-gray-500 px-6 py-12 text-center"
                  >
                    No scripts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisplayScripts;
