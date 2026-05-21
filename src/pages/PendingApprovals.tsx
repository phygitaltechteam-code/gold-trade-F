import React, {useState, useMemo} from 'react';
import {
  useGetBrokerData,
  useGetSuperBrokerData,
  useDeleteBroker,
  useApproveBroker,
  useUpdateBroker,
} from '@/lib/api/addbroker';
import {
  useGetCustomer,
  useAcceptCustomer,
  useDeleteCustomer,
  useUpdateCustomer,
} from '@/lib/react-query/Customer';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {
  Search,
  Filter,
  CheckCircle,
  Edit3,
  Trash2,
  X,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PendingApprovals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'brokers' | 'clients'>('brokers');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'ALL'>(
    'PENDING',
  );

  // Broker Filters
  const [brokerSearch, setBrokerSearch] = useState('');
  const [selectedSuperBroker, setSelectedSuperBroker] = useState('');
  const [selectedBroker, setSelectedBroker] = useState('');

  // Client Filters
  const [clientSearch, setClientSearch] = useState('');
  const [clientSelectedBroker, setClientSelectedBroker] = useState('');

  // Modals state
  const [editingBroker, setEditingBroker] = useState<any | null>(null);
  const [editingClient, setEditingClient] = useState<any | null>(null);

  // Queries
  const {
    data: brokerResponse,
    isLoading: isLoadingBrokers,
    refetch: refetchBrokers,
  } = useGetBrokerData();
  const {data: superBrokerResponse, isLoading: isLoadingSuperBrokers} =
    useGetSuperBrokerData();
  const {
    data: customerResponse,
    isLoading: isLoadingCustomers,
    refetch: refetchCustomers,
  } = useGetCustomer();

  // Mutations
  const approveBrokerMutation = useApproveBroker();
  const deleteBrokerMutation = useDeleteBroker();
  const updateBrokerMutation = useUpdateBroker();

  const acceptCustomerMutation = useAcceptCustomer();
  const deleteCustomerMutation = useDeleteCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  // Extract Lists Safely
  const brokerList = useMemo(() => {
    let list: any[] = [];
    if (brokerResponse?.data?.data) list = brokerResponse.data.data;
    else if (brokerResponse?.data) list = brokerResponse.data;
    else if (Array.isArray(brokerResponse)) list = brokerResponse;
    return list;
  }, [brokerResponse]);

  const superBrokerList = useMemo(() => {
    let list: any[] = [];
    if (superBrokerResponse?.data?.data) list = superBrokerResponse.data.data;
    else if (superBrokerResponse?.data) list = superBrokerResponse.data;
    else if (Array.isArray(superBrokerResponse)) list = superBrokerResponse;
    return list;
  }, [superBrokerResponse]);

  const customerList = useMemo(() => {
    let list: any[] = [];
    if (customerResponse?.data && Array.isArray(customerResponse.data))
      list = customerResponse.data;
    else if (Array.isArray(customerResponse)) list = customerResponse;
    return list;
  }, [customerResponse]);

  // Handlers for Broker
  const handleApproveBroker = async (broker: any) => {
    try {
      await approveBrokerMutation.mutateAsync(broker.id);
      refetchBrokers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteBroker = async (broker: any) => {
    if (
      window.confirm(
        `Are you sure you want to delete broker ${broker.fullname || ''}?`,
      )
    ) {
      try {
        await deleteBrokerMutation.mutateAsync(broker.id);
        refetchBrokers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSaveBrokerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBroker) return;
    try {
      await updateBrokerMutation.mutateAsync({
        id: editingBroker.id,
        data: editingBroker,
      });
      setEditingBroker(null);
      refetchBrokers();
    } catch (error) {
      console.error(error);
    }
  };

  // Handlers for Client
  const handleApproveClient = async (client: any) => {
    try {
      await acceptCustomerMutation.mutateAsync(client.id);
      refetchCustomers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClient = async (client: any) => {
    if (
      window.confirm(
        `Are you sure you want to delete client ${client?.user?.fullname || client?.fullname || ''}?`,
      )
    ) {
      try {
        await deleteCustomerMutation.mutateAsync(client.id);
        refetchCustomers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSaveClientEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    try {
      await updateCustomerMutation.mutateAsync({
        id: editingClient.id,
        data: editingClient,
      });
      setEditingClient(null);
      refetchCustomers();
    } catch (error) {
      console.error(error);
    }
  };

  // Filtered Brokers
  const filteredBrokers = useMemo(() => {
    return brokerList.filter((b: any) => {
      // Status Filter
      if (statusFilter === 'PENDING') {
        const isPending =
          !b.isActive || !b.isVerified || b.status === 'PENDING';
        if (!isPending) return false;
      }

      // Search Query
      if (brokerSearch.trim()) {
        const query = brokerSearch.toLowerCase();
        const name = (b.fullname || '').toLowerCase();
        const phone = (b.phoneNumber || '').toLowerCase();
        if (!name.includes(query) && !phone.includes(query)) return false;
      }

      // Super Broker Dropdown Filter
      if (selectedSuperBroker) {
        if (
          b.superBrokerId !== selectedSuperBroker &&
          b.superBroker?.id !== selectedSuperBroker
        ) {
          return false;
        }
      }

      // Broker Dropdown Filter
      if (selectedBroker) {
        if (b.id !== selectedBroker) return false;
      }

      return true;
    });
  }, [
    brokerList,
    statusFilter,
    brokerSearch,
    selectedSuperBroker,
    selectedBroker,
  ]);

  // Filtered Clients
  const filteredClients = useMemo(() => {
    return customerList.filter((c: any) => {
      const u = c?.user || c;
      // Status Filter
      if (statusFilter === 'PENDING') {
        const isVerified = u.isVerified;
        const isRejected = u.isRejected;
        if (isVerified || isRejected) return false;
      }

      // Search Query
      if (clientSearch.trim()) {
        const query = clientSearch.toLowerCase();
        const name = (u.fullname || '').toLowerCase();
        const phone = (u.phoneNumber || '').toLowerCase();
        if (!name.includes(query) && !phone.includes(query)) return false;
      }

      // Broker Dropdown Filter
      if (clientSelectedBroker) {
        if (
          c.brokerId !== clientSelectedBroker &&
          c.broker?.id !== clientSelectedBroker
        ) {
          return false;
        }
      }

      return true;
    });
  }, [customerList, statusFilter, clientSearch, clientSelectedBroker]);

  // Columns for Broker Table
  const brokerColumns: Column<any>[] = [
    {
      header: 'Sr',
      accessor: (item: any) => filteredBrokers.indexOf(item) + 1,
      className: 'w-16 font-semibold text-gray-600',
    },
    {
      header: 'Name',
      accessor: 'fullname',
      render: (item: any) => (
        <div>
          <div className="text-gray-900 font-semibold">
            {item.fullname || 'N/A'}
          </div>
          <div className="text-gray-500 text-xs">
            Broker ID: {item.BKId || item.id?.substring(0, 8)}
          </div>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: 'phoneNumber',
      render: (item: any) => (
        <span className="font-mono text-sm">{item.phoneNumber || 'N/A'}</span>
      ),
    },
    {
      header: 'Super Broker',
      accessor: 'superBrokerId',
      render: (item: any) => (
        <span className="text-gray-700 text-sm font-medium">
          {item.superBroker?.fullname || item.superBrokerId || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Aadhar Card Number',
      accessor: 'aadharCardNumber',
      render: (item: any) => (
        <span className="font-mono text-sm">
          {item.aadharCardNumber || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Area',
      accessor: 'area',
      render: (item: any) => (
        <span className="text-sm">{item.area || 'N/A'}</span>
      ),
    },
    {
      header: 'Commission',
      accessor: 'commission',
      render: (item: any) => (
        <span className="rounded border border-orange-100 bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600">
          {item.commission ? `${item.commission}%` : '0%'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleApproveBroker(item)}
            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
          >
            <CheckCircle className="h-3.5 w-3.5" /> Approve
          </button>
          <button
            onClick={() => setEditingBroker({...item})}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
          >
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={() => handleDeleteBroker(item)}
            className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-rose-700 active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      ),
    },
  ];

  // Columns for Client Table
  const clientColumns: Column<any>[] = [
    {
      header: 'Sr',
      accessor: (item: any) => filteredClients.indexOf(item) + 1,
      className: 'w-16 font-semibold text-gray-600',
    },
    {
      header: 'Name',
      accessor: (item: any) => item?.user?.fullname || item?.fullname || 'N/A',
      render: (item: any) => (
        <div>
          <div className="text-gray-900 font-semibold">
            {item?.user?.fullname || item?.fullname || 'N/A'}
          </div>
          <div className="text-gray-500 text-xs">
            {item?.user?.email || item?.email || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: (item: any) =>
        item?.user?.phoneNumber || item?.phoneNumber || 'N/A',
      render: (item: any) => (
        <span className="font-mono text-sm">
          {item?.user?.phoneNumber || item?.phoneNumber || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Super Broker',
      accessor: 'superBroker',
      render: (item: any) => (
        <span className="text-gray-700 text-sm font-medium">
          {item.superBroker?.fullname ||
            item.broker?.superBroker?.fullname ||
            'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Broker',
      accessor: 'broker',
      render: (item: any) => (
        <span className="text-gray-700 text-sm font-medium">
          {item.broker?.fullname || item.brokerId || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Aadhar Card Number',
      accessor: (item: any) =>
        item?.aadharCard || item?.user?.aadharCard || 'N/A',
      render: (item: any) => (
        <span className="font-mono text-sm">
          {item?.aadharCard || item?.user?.aadharCard || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleApproveClient(item)}
            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
          >
            <CheckCircle className="h-3.5 w-3.5" /> Approve
          </button>
          <button
            onClick={() =>
              setEditingClient({
                id: item.id,
                fullname: item?.user?.fullname || item?.fullname || '',
                phoneNumber: item?.user?.phoneNumber || item?.phoneNumber || '',
                aadharCard: item?.aadharCard || item?.user?.aadharCard || '',
                brokerId: item?.brokerId || '',
              })
            }
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
          >
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={() => handleDeleteClient(item)}
            className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-rose-700 active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gray-50/50 font-inter min-h-screen p-2 md:p-8">
      <div className="mx-auto max-w-[2000px]">
        {/* Header & Status Toggle */}
        <div className="border-gray-200 mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-b border-stroke bg-white p-6 pb-6 shadow-sm md:flex-row md:items-center">
          <div>
            <h1 className="text-gray-900 flex items-center gap-3 text-2xl font-extrabold tracking-tight md:text-3xl">
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                Pending Approvals Dashboard
              </span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Review, edit, delete, and approve pending registrations for
              Brokers and Clients.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                refetchBrokers();
                refetchCustomers();
              }}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition-all active:scale-95"
            >
              <RefreshCw className="text-gray-500 animate-spin-hover h-4 w-4" />{' '}
              Refresh
            </button>
            <div className="bg-gray-100 border-gray-200 flex rounded-xl border p-1">
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                  statusFilter === 'PENDING'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending Only
              </button>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Records
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-gray-200 mb-6 flex gap-3 border-b pb-4">
          <button
            onClick={() => setActiveTab('brokers')}
            className={`flex items-center gap-2 rounded-xl px-1 py-1.5 text-sm font-bold transition-all ${
              activeTab === 'brokers'
                ? 'scale-105 bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50 border bg-white'
            }`}
          >
            Broker Pending Requests
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${activeTab === 'brokers' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}
            >
              {filteredBrokers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 rounded-xl px-2 py-3 text-sm font-bold transition-all ${
              activeTab === 'clients'
                ? 'scale-105 bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50 border bg-white'
            }`}
          >
            Customer Pending Requests
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${activeTab === 'clients' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}
            >
              {filteredClients.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'brokers' ? (
          <div className="rounded-2xl border border-stroke bg-white p-6 shadow-sm">
            {/* Broker Filters Toolbar */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="text-gray-400 absolute left-3.5 top-3 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search broker by name or phone..."
                  value={brokerSearch}
                  onChange={(e) => setBrokerSearch(e.target.value)}
                  className="border-gray-200 bg-gray-50/50 text-gray-900 w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="relative">
                <Filter className="text-gray-400 absolute left-3.5 top-3 h-4 w-4" />
                <select
                  value={selectedSuperBroker}
                  onChange={(e) => setSelectedSuperBroker(e.target.value)}
                  className="border-gray-200 bg-gray-50/50 text-gray-900 w-full cursor-pointer appearance-none rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="">Filter by Super Broker (All)</option>
                  {superBrokerList.map((sb: any) => (
                    <option key={sb.id} value={sb.id}>
                      {sb.fullname} ({sb.SBID || sb.id?.substring(0, 6)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="text-gray-400 absolute left-3.5 top-3 h-4 w-4" />
                <select
                  value={selectedBroker}
                  onChange={(e) => setSelectedBroker(e.target.value)}
                  className="border-gray-200 bg-gray-50/50 text-gray-900 w-full cursor-pointer appearance-none rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="">Filter by Broker (All)</option>
                  {brokerList.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.fullname} ({b.BKId || b.id?.substring(0, 6)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Broker Generic Table */}
            {isLoadingBrokers ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
              </div>
            ) : (
              <GenericTable
                data={filteredBrokers}
                columns={brokerColumns}
                action={false} // Using custom Action column
                searchAble={false}
                itemsPerPage={10}
              />
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-stroke bg-white p-6 shadow-sm">
            {/* Client Filters Toolbar */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="text-gray-400 absolute left-3.5 top-3 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search client by name or phone..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="border-gray-200 bg-gray-50/50 text-gray-900 w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="relative">
                <Filter className="text-gray-400 absolute left-3.5 top-3 h-4 w-4" />
                <select
                  value={clientSelectedBroker}
                  onChange={(e) => setClientSelectedBroker(e.target.value)}
                  className="border-gray-200 bg-gray-50/50 text-gray-900 w-full cursor-pointer appearance-none rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="">Filter by Broker (All)</option>
                  {brokerList.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.fullname} ({b.BKId || b.id?.substring(0, 6)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Client Generic Table */}
            {isLoadingCustomers ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
              </div>
            ) : (
              <GenericTable
                data={filteredClients}
                columns={clientColumns}
                action={false} // Using custom Action column
                searchAble={false}
                itemsPerPage={10}
              />
            )}
          </div>
        )}

        {/* Edit Broker Modal */}
        {editingBroker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="animate-in fade-in zoom-in-95 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl duration-200">
              <div className="border-gray-100 flex items-center justify-between border-b pb-4">
                <h3 className="text-gray-900 text-xl font-bold">
                  Edit Broker Request
                </h3>
                <button
                  onClick={() => setEditingBroker(null)}
                  className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg p-1 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBrokerEdit} className="mt-4 space-y-4">
                <div>
                  <label className="text-gray-700 text-sm font-semibold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editingBroker.fullname || ''}
                    onChange={(e) =>
                      setEditingBroker({
                        ...editingBroker,
                        fullname: e.target.value,
                      })
                    }
                    className="border-gray-200 text-gray-900 mt-1 w-full rounded-xl border p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-semibold">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editingBroker.phoneNumber || ''}
                    onChange={(e) =>
                      setEditingBroker({
                        ...editingBroker,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="border-gray-200 text-gray-900 mt-1 w-full rounded-xl border p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-semibold">
                    Aadhar Card Number
                  </label>
                  <input
                    type="text"
                    value={editingBroker.aadharCardNumber || ''}
                    onChange={(e) =>
                      setEditingBroker({
                        ...editingBroker,
                        aadharCardNumber: e.target.value,
                      })
                    }
                    className="border-gray-200 text-gray-900 mt-1 w-full rounded-xl border p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-semibold">
                    Area
                  </label>
                  <input
                    type="text"
                    value={editingBroker.area || ''}
                    onChange={(e) =>
                      setEditingBroker({...editingBroker, area: e.target.value})
                    }
                    className="border-gray-200 text-gray-900 mt-1 w-full rounded-xl border p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-semibold">
                    Commission %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBroker.commission || ''}
                    onChange={(e) =>
                      setEditingBroker({
                        ...editingBroker,
                        commission: e.target.value,
                      })
                    }
                    className="border-gray-200 text-gray-900 mt-1 w-full rounded-xl border p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="border-gray-100 flex justify-end gap-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingBroker(null)}
                    className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-red-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Client Modal */}
        {editingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="animate-in fade-in zoom-in-95 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl duration-200">
              <div className="border-gray-100 flex items-center justify-between border-b pb-4">
                <h3 className="text-gray-900 text-xl font-bold">
                  Edit Customer Request
                </h3>
                <button
                  onClick={() => setEditingClient(null)}
                  className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg p-1 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveClientEdit} className="mt-4 space-y-4">
                <div>
                  <label className="text-gray-700 text-sm font-semibold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editingClient.fullname || ''}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        fullname: e.target.value,
                      })
                    }
                    className="border-gray-200 text-gray-900 mt-1 w-full rounded-xl border p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-semibold">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editingClient.phoneNumber || ''}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="border-gray-200 text-gray-900 mt-1 w-full rounded-xl border p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-semibold">
                    Aadhar Card Number
                  </label>
                  <input
                    type="text"
                    value={editingClient.aadharCard || ''}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        aadharCard: e.target.value,
                      })
                    }
                    className="border-gray-200 text-gray-900 mt-1 w-full rounded-xl border p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-semibold">
                    Assign Broker
                  </label>
                  <select
                    value={editingClient.brokerId || ''}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        brokerId: e.target.value,
                      })
                    }
                    className="border-gray-200 text-gray-900 mt-1 w-full cursor-pointer appearance-none rounded-xl border bg-white p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="">None / Unassigned</option>
                    {brokerList.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.fullname} ({b.BKId || b.id?.substring(0, 6)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-gray-100 flex justify-end gap-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingClient(null)}
                    className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-red-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApprovals;
