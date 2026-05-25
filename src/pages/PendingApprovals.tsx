import React, {useState, useMemo} from 'react';
import {
  useGetBrokerData,
  useGetSuperBrokerData,
  useDeleteBroker,
  useApproveBroker,
  useUpdateBroker,
} from '@/lib/api/addbroker';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {
  Search,
  Filter,
  CheckCircle,
  Edit3,
  Trash2,
  X,
  RefreshCw,
  UserCheck,
  UserX,
  Building,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useAcceptCustomer,
  useDeleteCustomer,
  useGetCustomer,
  useUpdateCustomer,
} from '@/lib/api/customer';

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
  const [clientSelectedSuperBroker, setClientSelectedSuperBroker] =
    useState('');
  const [clientSelectedBroker, setClientSelectedBroker] = useState('');

  // Modals state
  const [editingBroker, setEditingBroker] = useState<any | null>(null);
  const [editingClient, setEditingClient] = useState<any | null>(null);

  // Approve Broker Modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [brokerToApprove, setBrokerToApprove] = useState<any | null>(null);
  const [selectedSuperBrokerForApprove, setSelectedSuperBrokerForApprove] =
    useState<string>('');
  // Queries
  const {
    data: brokerResponse,
    isLoading: isLoadingBrokers,
    refetch: refetchBrokers,
  } = useGetBrokerData();

  const {data: superBrokerResponse} = useGetSuperBrokerData();

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

  // Extract Broker Lists Safely
  const brokerList = useMemo(() => {
    let list: any[] = [];
    if (
      brokerResponse?.data?.data?.data &&
      Array.isArray(brokerResponse.data.data.data)
    ) {
      list = brokerResponse.data.data.data;
    } else if (
      brokerResponse?.data?.data &&
      Array.isArray(brokerResponse.data.data)
    ) {
      list = brokerResponse.data.data;
    } else if (brokerResponse?.data && Array.isArray(brokerResponse.data)) {
      list = brokerResponse.data;
    } else if (Array.isArray(brokerResponse)) {
      list = brokerResponse;
    }
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
    if (
      customerResponse?.statusCode === 200 &&
      Array.isArray(customerResponse?.data)
    ) {
      list = customerResponse.data;
    } else if (customerResponse?.data && Array.isArray(customerResponse.data)) {
      list = customerResponse.data;
    } else if (Array.isArray(customerResponse)) {
      list = customerResponse;
    }
    return list;
  }, [customerResponse]);

  // Handlers for Broker
  const handleApproveBroker = (broker: any) => {
    setBrokerToApprove(broker);
    setSelectedSuperBrokerForApprove('');
    setShowApproveModal(true);
  };

  const confirmApproveBroker = async () => {
    if (!selectedSuperBrokerForApprove) {
      toast.error('Please select a Super Broker');
      return;
    }

    try {
      await approveBrokerMutation.mutateAsync({
        id: brokerToApprove.id,
        superBrokerId: selectedSuperBrokerForApprove,
      });
      toast.success('Broker approved successfully');
      setShowApproveModal(false);
      setBrokerToApprove(null);
      setSelectedSuperBrokerForApprove('');
      refetchBrokers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve broker');
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
        toast.success('Broker deleted successfully');
        refetchBrokers();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete broker');
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
      toast.success('Broker updated successfully');
      setEditingBroker(null);
      refetchBrokers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update broker');
    }
  };

  // Handlers for Client
  const handleApproveClient = async (client: any) => {
    try {
      await acceptCustomerMutation.mutateAsync(client.id);
      toast.success('Customer verified successfully');
      refetchCustomers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to verify customer');
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
        toast.success('Customer deleted successfully');
        refetchCustomers();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete customer');
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
      toast.success('Customer updated successfully');
      setEditingClient(null);
      refetchCustomers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update customer');
    }
  };

  // Filtered Brokers
  const filteredBrokers = useMemo(() => {
    return brokerList.filter((b: any) => {
      if (statusFilter === 'PENDING') {
        const isVerified = b.isVerified;
        if (isVerified) return false;
      }

      if (brokerSearch.trim()) {
        const query = brokerSearch.toLowerCase();
        const name = (b.fullname || '').toLowerCase();
        const phone = (b.phoneNumber || '').toLowerCase();
        const bkId = (b.BKId || '').toLowerCase();
        if (
          !name.includes(query) &&
          !phone.includes(query) &&
          !bkId.includes(query)
        )
          return false;
      }

      if (selectedSuperBroker) {
        if (b.superBrokerId !== selectedSuperBroker) {
          return false;
        }
      }

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
      const user = c?.user;

      if (statusFilter === 'PENDING') {
        const isVerified = user?.isVerified;
        const isRejected = user?.isRejected;
        if (isVerified || isRejected) return false;
      }

      if (clientSearch.trim()) {
        const query = clientSearch.toLowerCase();
        const name = (user?.fullname || '').toLowerCase();
        const phone = (user?.phoneNumber || '').toLowerCase();
        const email = (user?.email || '').toLowerCase();
        const crn = (c.CRN || '').toLowerCase();

        if (
          !name.includes(query) &&
          !phone.includes(query) &&
          !email.includes(query) &&
          !crn.includes(query)
        ) {
          return false;
        }
      }

      if (clientSelectedSuperBroker) {
        if (c.superBrokerId !== clientSelectedSuperBroker) {
          return false;
        }
      }

      if (clientSelectedBroker) {
        if (c.brokerId !== clientSelectedBroker) {
          return false;
        }
      }

      return true;
    });
  }, [
    customerList,
    statusFilter,
    clientSearch,
    clientSelectedSuperBroker,
    clientSelectedBroker,
  ]);

  // BROKER TABLE COLUMNS - with icon actions
  const brokerColumns: Column<any>[] = [
    {
      header: 'Name',
      accessor: 'fullname',
      render: (item: any) => (
        <div>
          <div className="text-gray-900 font-semibold">
            {item.fullname || 'N/A'}
          </div>
          <div className="text-gray-500 text-xs">
            BK ID: {item.BKId || 'N/A'}
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
      accessor: 'superBroker',
      render: (item: any) => {
        const superBrokerName =
          item.superBroker?.user?.fullname ||
          item.superBroker?.fullname ||
          'Unassigned';
        return (
          <span className="text-gray-700 text-sm font-medium">
            {superBrokerName}
          </span>
        );
      },
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
      accessor: 'brokeragePercent',
      render: (item: any) => (
        <span className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">
          {item.brokeragePercent ? `${item.brokeragePercent}%` : '0%'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (item: any) => {
        const isVerified = item.isVerified;

        return (
          <div className="flex items-center gap-1.5">
            {!isVerified && (
              <button
                onClick={() => handleApproveBroker(item)}
                disabled={approveBrokerMutation.isPending}
                className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition-all hover:bg-emerald-100 hover:text-emerald-700 active:scale-95 disabled:opacity-50"
                title="Approve Broker"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
            {isVerified && (
              <button
                disabled={true}
                className="bg-gray-100 text-gray-400 cursor-not-allowed rounded-lg p-2"
                title="Already Verified"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setEditingBroker({...item})}
              className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-all hover:bg-blue-100 hover:text-blue-700 active:scale-95"
              title="Edit Broker"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteBroker(item)}
              disabled={deleteBrokerMutation.isPending}
              className="rounded-lg bg-rose-50 p-2 text-rose-600 transition-all hover:bg-rose-100 hover:text-rose-700 active:scale-95 disabled:opacity-50"
              title="Delete Broker"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  // CLIENT TABLE COLUMNS - with icon actions
  const clientColumns: Column<any>[] = [
    {
      header: 'Name',
      accessor: (item: any) => item?.user?.fullname || 'N/A',
      render: (item: any) => (
        <div>
          <div className="text-gray-900 font-semibold">
            {item?.user?.fullname || 'N/A'}
          </div>
          <div className="text-gray-500 text-xs">CRN: {item.CRN || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: (item: any) => item?.user?.phoneNumber || 'N/A',
      render: (item: any) => (
        <span className="font-mono text-sm">
          {item?.user?.phoneNumber || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Super Broker',
      accessor: 'superBrokerId',
      render: (item: any) => {
        const superBroker = superBrokerList.find(
          (sb: any) => sb.id === item.superBrokerId,
        );
        return (
          <span className="text-gray-700 text-sm">
            {superBroker?.fullname ||
              item.superBrokerId?.substring(0, 8) + '...' ||
              'Unassigned'}
          </span>
        );
      },
    },
    {
      header: 'Broker',
      accessor: 'brokerId',
      render: (item: any) => {
        const broker = brokerList.find((b: any) => b.id === item.brokerId);
        return (
          <span className="text-gray-700 text-sm">
            {broker?.fullname ||
              item.brokerId?.substring(0, 8) + '...' ||
              'Unassigned'}
          </span>
        );
      },
    },
    {
      header: 'Address',
      accessor: 'address',
      render: (item: any) => (
        <span className="text-sm">
          {item.address || item.city || item.area || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (item: any) => {
        const isVerified = item?.user?.isVerified;
        const isRejected = item?.user?.isRejected;
        const isPending = !isVerified && !isRejected;

        return (
          <div className="flex items-center gap-1.5">
            {isPending && (
              <button
                onClick={() => handleApproveClient(item)}
                disabled={acceptCustomerMutation.isPending}
                className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition-all hover:bg-emerald-100 hover:text-emerald-700 active:scale-95 disabled:opacity-50"
                title="Verify Customer"
              >
                <UserCheck className="h-4 w-4" />
              </button>
            )}
            {isVerified && (
              <button
                disabled={true}
                className="bg-gray-100 text-gray-400 cursor-not-allowed rounded-lg p-2"
                title="Already Verified"
              >
                <UserCheck className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() =>
                setEditingClient({
                  id: item.id,
                  fullname: item?.user?.fullname || '',
                  email: item?.user?.email || '',
                  phoneNumber: item?.user?.phoneNumber || '',
                  brokerId: item?.brokerId || '',
                  area: item?.area || '',
                  commission: item?.brokeragePercent || '',
                })
              }
              className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-all hover:bg-blue-100 hover:text-blue-700 active:scale-95"
              title="Edit Customer"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteClient(item)}
              disabled={deleteCustomerMutation.isPending}
              className="rounded-lg bg-rose-50 p-2 text-rose-600 transition-all hover:bg-rose-100 hover:text-rose-700 active:scale-95 disabled:opacity-50"
              title="Delete Customer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  // Get counts for tabs
  const pendingBrokersCount = brokerList.filter(
    (b: any) => !b.isVerified,
  ).length;
  const pendingClientsCount = customerList.filter((c: any) => {
    const user = c?.user;
    return user && !user.isVerified && !user.isRejected;
  }).length;

  return (
    <div className="bg-gray-50/50 font-inter min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[2000px]">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Pending Approvals
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Review and manage pending registrations for brokers and customers.
          </p>
        </div>

        {/* Tabs with Filter Integration */}
        <div className="mb-6 border-b border-stroke">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab('brokers');
                  setStatusFilter('PENDING');
                }}
                className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-all md:px-6 ${
                  activeTab === 'brokers'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Building className="h-4 w-4" />
                Brokers
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                    activeTab === 'brokers'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {pendingBrokersCount}
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('clients');
                  setStatusFilter('PENDING');
                }}
                className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-all md:px-6 ${
                  activeTab === 'clients'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="h-4 w-4" />
                Customers
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                    activeTab === 'clients'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {pendingClientsCount}
                </span>
              </button>
            </div>

            {/* Status Filter Toggle */}
            <div className="flex items-center gap-2 rounded-lg border border-stroke bg-white p-1">
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all md:px-4 md:text-sm ${
                  statusFilter === 'PENDING'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Pending Only
              </button>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all md:px-4 md:text-sm ${
                  statusFilter === 'ALL'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Records
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content - Brokers */}
        {activeTab === 'brokers' && (
          <div className="rounded-2xl border border-stroke bg-white shadow-sm">
            {/* Broker Filters Toolbar */}
            <div className="border-b border-stroke p-4 md:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="text-gray-400 absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, phone or BK ID..."
                    value={brokerSearch}
                    onChange={(e) => setBrokerSearch(e.target.value)}
                    className="bg-gray-50/50 text-gray-900 w-full rounded-xl border border-stroke py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="relative">
                  <Filter className="text-gray-400 absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <select
                    value={selectedSuperBroker}
                    onChange={(e) => setSelectedSuperBroker(e.target.value)}
                    className="bg-gray-50/50 text-gray-900 w-full cursor-pointer appearance-none rounded-xl border border-stroke py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="">All Super Brokers</option>
                    {superBrokerList.map((sb: any) => (
                      <option key={sb.id} value={sb.id}>
                        {sb.fullname} ({sb.SBID || sb.id?.substring(0, 6)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Filter className="text-gray-400 absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <select
                    value={selectedBroker}
                    onChange={(e) => setSelectedBroker(e.target.value)}
                    className="bg-gray-50/50 text-gray-900 w-full cursor-pointer appearance-none rounded-xl border border-stroke py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="">All Brokers</option>
                    {brokerList.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.fullname} ({b.BKId || b.id?.substring(0, 6)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Broker Table */}
            {isLoadingBrokers ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <GenericTable
                  data={filteredBrokers}
                  columns={brokerColumns}
                  action={false}
                  searchAble={false}
                  itemsPerPage={10}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab Content - Clients */}
        {activeTab === 'clients' && (
          <div className="rounded-2xl border border-stroke bg-white shadow-sm">
            {/* Client Filters Toolbar */}
            <div className="border-b border-stroke p-4 md:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="text-gray-400 absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, phone, email or CRN..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="bg-gray-50/50 text-gray-900 w-full rounded-xl border border-stroke py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="relative">
                  <Filter className="text-gray-400 absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <select
                    value={clientSelectedSuperBroker}
                    onChange={(e) =>
                      setClientSelectedSuperBroker(e.target.value)
                    }
                    className="bg-gray-50/50 text-gray-900 w-full cursor-pointer appearance-none rounded-xl border border-stroke py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="">All Super Brokers</option>
                    {superBrokerList.map((sb: any) => (
                      <option key={sb.id} value={sb.id}>
                        {sb.fullname} ({sb.SBID || sb.id?.substring(0, 6)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Filter className="text-gray-400 absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <select
                    value={clientSelectedBroker}
                    onChange={(e) => setClientSelectedBroker(e.target.value)}
                    className="bg-gray-50/50 text-gray-900 w-full cursor-pointer appearance-none rounded-xl border border-stroke py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="">All Brokers</option>
                    {brokerList.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.fullname} ({b.BKId || b.id?.substring(0, 6)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Client Table */}
            {isLoadingCustomers ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <GenericTable
                  data={filteredClients}
                  columns={clientColumns}
                  action={false}
                  searchAble={false}
                  itemsPerPage={10}
                />
              </div>
            )}
          </div>
        )}

        {/* Approve Broker Modal */}
        {showApproveModal && brokerToApprove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="animate-in fade-in zoom-in-95 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl duration-200">
              <div className="flex items-center justify-between border-b border-stroke pb-4">
                <h3 className="text-gray-900 text-xl font-bold">
                  Approve Broker
                </h3>
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg p-1 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">
                    Assign a Super Broker to{' '}
                    <span className="font-semibold">
                      {brokerToApprove.fullname}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-semibold">
                    Select Super Broker <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSuperBrokerForApprove}
                    onChange={(e) =>
                      setSelectedSuperBrokerForApprove(e.target.value)
                    }
                    className="text-gray-900 mt-1 w-full cursor-pointer appearance-none rounded-xl border border-stroke bg-white p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  >
                    <option value="">Select Super Broker</option>
                    {superBrokerList.map((sb: any) => (
                      <option key={sb.id} value={sb.id}>
                        {sb.fullname} ({sb.SBID || sb.id?.substring(0, 6)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 border-t border-stroke pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApproveModal(false)}
                    className="text-gray-600 hover:bg-gray-50 rounded-xl border border-stroke px-5 py-2.5 text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmApproveBroker}
                    disabled={approveBrokerMutation.isPending}
                    className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
                  >
                    {approveBrokerMutation.isPending
                      ? 'Approving...'
                      : 'Confirm Approval'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Broker Modal */}
        {editingBroker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="animate-in fade-in zoom-in-95 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl duration-200">
              <div className="flex items-center justify-between border-b border-stroke pb-4">
                <h3 className="text-gray-900 text-xl font-bold">Edit Broker</h3>
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
                    className="text-gray-900 mt-1 w-full rounded-xl border border-stroke p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
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
                    className="text-gray-900 mt-1 w-full rounded-xl border border-stroke p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
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
                      setEditingBroker({
                        ...editingBroker,
                        area: e.target.value,
                      })
                    }
                    className="text-gray-900 mt-1 w-full rounded-xl border border-stroke p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-semibold">
                    Commission %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBroker.brokeragePercent || ''}
                    onChange={(e) =>
                      setEditingBroker({
                        ...editingBroker,
                        brokeragePercent: parseFloat(e.target.value),
                      })
                    }
                    className="text-gray-900 mt-1 w-full rounded-xl border border-stroke p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-stroke pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingBroker(null)}
                    className="text-gray-600 hover:bg-gray-50 rounded-xl border border-stroke px-5 py-2.5 text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateBrokerMutation.isPending}
                    className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
                  >
                    {updateBrokerMutation.isPending
                      ? 'Saving...'
                      : 'Save Changes'}
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
              <div className="flex items-center justify-between border-b border-stroke pb-4">
                <h3 className="text-gray-900 text-xl font-bold">
                  Edit Customer
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
                    className="text-gray-900 mt-1 w-full rounded-xl border border-stroke p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-semibold">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingClient.email || ''}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        email: e.target.value,
                      })
                    }
                    className="text-gray-900 mt-1 w-full rounded-xl border border-stroke p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
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
                    className="text-gray-900 mt-1 w-full rounded-xl border border-stroke p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-semibold">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editingClient.address || editingClient.area || ''}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        address: e.target.value,
                      })
                    }
                    className="text-gray-900 mt-1 w-full rounded-xl border border-stroke p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
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
                    className="text-gray-900 mt-1 w-full cursor-pointer appearance-none rounded-xl border border-stroke bg-white p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="">Select Broker</option>
                    {brokerList.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.fullname} ({b.BKId || b.id?.substring(0, 6)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 border-t border-stroke pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingClient(null)}
                    className="text-gray-600 hover:bg-gray-50 rounded-xl border border-stroke px-5 py-2.5 text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateCustomerMutation.isPending}
                    className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
                  >
                    {updateCustomerMutation.isPending
                      ? 'Saving...'
                      : 'Save Changes'}
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
