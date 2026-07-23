import React, { useState, useMemo } from 'react';
import {
  useGetBrokerData,
  useGetSuperBrokerData,
  useDeleteBroker,
  useApproveBroker,
  useUpdateBroker,
} from '@/lib/api/addbroker';
import GenericTable, { Column } from '@/components/Forms/Table/GenericTable';
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
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useAcceptCustomer,
  useDeleteCustomer,
  useGetCustomer,
  useUpdateCustomer,
} from '@/lib/api/customer';
import { useNavigate } from '@tanstack/react-router';

const PendingApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'brokers' | 'clients'>('brokers');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'ALL'>(
    'PENDING',
  );

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'delete';
    item: any;
    isBroker: boolean;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Queries
  const {
    data: brokerResponse,
    isLoading: isLoadingBrokers,
    refetch: refetchBrokers,
  } = useGetBrokerData();

  const { data: superBrokerResponse } = useGetSuperBrokerData();

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

  // Format date and time - Date above, Time below
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

    return (
      <div className="flex flex-col">
        <span className="font-mono text-sm">{formattedDate}</span>
        <span className="font-mono text-xs text-gray-500">{formattedTime}</span>
      </div>
    );
  };

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

  // Row click handlers - Different route from edit
  const handleBrokerRowClick = (broker: any) => {
    navigate({ to: `/companybroker/pedningbrokerprofile/${broker.id}` });
  };

  const handleClientRowClick = (client: any) => {
    navigate({ to: `/companybroker/pendingtradeprofile/${client.id}` });
  };

  // Open confirmation modal for Broker Approve
  const handleApproveBroker = (broker: any) => {
    setConfirmAction({ type: 'approve', item: broker, isBroker: true });
    setShowConfirmModal(true);
  };

  // Open confirmation modal for Broker Delete
  const handleDeleteBroker = (broker: any) => {
    setConfirmAction({ type: 'delete', item: broker, isBroker: true });
    setShowConfirmModal(true);
  };

  // Open confirmation modal for Client Approve
  const handleApproveClient = (client: any) => {
    setConfirmAction({ type: 'approve', item: client, isBroker: false });
    setShowConfirmModal(true);
  };

  // Open confirmation modal for Client Delete
  const handleDeleteClient = (client: any) => {
    setConfirmAction({ type: 'delete', item: client, isBroker: false });
    setShowConfirmModal(true);
  };

  // Handle confirmation action
  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    setIsProcessing(true);
    try {
      if (confirmAction.type === 'approve') {
        if (confirmAction.isBroker) {
          await approveBrokerMutation.mutateAsync({
            id: confirmAction.item.id,
            superBrokerId: confirmAction.item.superBrokerId || null,
          });
          // toast.success('Broker approved successfully!');
          refetchBrokers();
        } else {
          await acceptCustomerMutation.mutateAsync(confirmAction.item.id);
          // toast.success('Customer verified successfully!');
          refetchCustomers();
        }
      } else if (confirmAction.type === 'delete') {
        if (confirmAction.isBroker) {
          await deleteBrokerMutation.mutateAsync(confirmAction.item.id);
          // toast.success('Broker deleted successfully!');
          refetchBrokers();
        } else {
          await deleteCustomerMutation.mutateAsync(confirmAction.item.id);
          // toast.success('Customer deleted successfully!');
          refetchCustomers();
        }
      }

      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error?.response?.data?.message || 'Failed to process request.');
    } finally {
      setIsProcessing(false);
    }
  };

  // EDIT BROKER - Different route from row click
  const handleEditBroker = (broker: any) => {
    navigate({ to: `/companybroker/pendingbrokerby/${broker.id}` });
  };

  const handleSaveBrokerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBroker) return;

    try {
      await updateBrokerMutation.mutateAsync({
        id: editingBroker.id,
        data: {
          fullname: editingBroker.fullname,
          email: editingBroker.email,
          phoneNumber: editingBroker.phoneNumber,
          area: editingBroker.area,
          brokeragePercent: editingBroker.brokeragePercent,
          aadharCardNumber: editingBroker.aadharCardNumber,
          panCardNumber: editingBroker.panCardNumber,
          address: editingBroker.address,
        },
      });
      setEditingBroker(null);
      refetchBrokers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update broker');
    }
  };

  // EDIT CLIENT - Different route from row click
  const handleEditClient = (client: any) => {
    navigate({ to: `/companybroker/companytradebyid/${client.id}` });
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

  // Check if actions should be shown - only when PENDING filter is active
  const showActions = statusFilter === 'PENDING';

  // BROKER TABLE COLUMNS
  const brokerColumns: Column<any>[] = [
    {
      header: 'Date & Time',
      accessor: 'createdAt',
      render: (item: any) => formatDateTime(item.createdAt),
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
          item?.superBroker?.user?.fullname ||
          item?.superBroker?.fullname ||
          'Unassigned';
        return (
          <span className="text-gray-700 text-sm">
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
    ...(showActions
      ? [{
        header: 'Actions', accessor: 'id', render: (item: any) => {
          const isVerified = item?.user?.isVerified;
          const isRejected = item?.user?.isRejected;
          const isPending = !isVerified && !isRejected;

          if (!showActions || !isPending) {
            return <span className="text-gray-400 text-sm">-</span>;
          }

          return (
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveBroker(item);
                }}
                disabled={approveBrokerMutation.isPending}
                className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition-all hover:bg-emerald-100 hover:text-emerald-700 active:scale-95 disabled:opacity-50"
                title="Verify Broker"
              >
                <UserCheck className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditBroker(item);
                }}
                className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-all hover:bg-blue-100 hover:text-blue-700 active:scale-95"
                title="Edit Broker"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBroker(item);
                }}
                disabled={deleteBrokerMutation.isPending}
                className="rounded-lg bg-rose-50 p-2 text-rose-600 transition-all hover:bg-rose-100 hover:text-rose-700 active:scale-95 disabled:opacity-50"
                title="Delete Broker"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      }] : []),
  ];

  // CLIENT TABLE COLUMNS
  const clientColumns: Column<any>[] = [
    {
      header: 'Date & Time',
      accessor: 'createdAt',
      render: (item: any) => formatDateTime(item.createdAt),
    },
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
      accessor: 'superBroker',
      render: (item: any) => {
        const superBrokerName =
          item?.broker?.superBroker?.user?.fullname ||
          item?.broker?.superBroker?.fullname ||
          'Unassigned';

        return (
          <span className="text-gray-700 text-sm">
            {superBrokerName}
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
    ...(showActions ? [{
      header: 'Actions',
      accessor: 'id',
      render: (item: any) => {
        const isVerified = item?.user?.isVerified;
        const isRejected = item?.user?.isRejected;
        const isPending = !isVerified && !isRejected;

        if (!isPending) {
          return <span className="text-gray-400 text-sm">-</span>;
        }

        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleApproveClient(item);
              }}
              disabled={acceptCustomerMutation.isPending}
              className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition-all hover:bg-emerald-100 hover:text-emerald-700 active:scale-95 disabled:opacity-50"
              title="Verify Customer"
            >
              <UserCheck className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditClient(item);
              }}
              className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-all hover:bg-blue-100 hover:text-blue-700 active:scale-95"
              title="Edit Customer"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClient(item);
              }}
              disabled={deleteCustomerMutation.isPending}
              className="rounded-lg bg-rose-50 p-2 text-rose-600 transition-all hover:bg-rose-100 hover:text-rose-700 active:scale-95 disabled:opacity-50"
              title="Delete Customer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    }] : []),
  ];

  // Get counts for tabs
  const pendingBrokersCount = brokerList.filter(
    (b: any) => !b.isVerified,
  ).length;
  const pendingClientsCount = customerList.filter((c: any) => {
    const user = c?.user;
    return user && !user.isVerified && !user.isRejected;
  }).length;

  // Get item name for confirmation modal
  const getItemName = () => {
    if (!confirmAction) return '';
    if (confirmAction.isBroker) {
      return confirmAction.item?.fullname || 'this broker';
    }
    return confirmAction.item?.user?.fullname || confirmAction.item?.fullname || 'this customer';
  };

  return (
    <>
      <div className="bg-gray-50/50 font-inter min-h-screen p-4 md:p-6 lg:p-8 bg-[#f8fafc]">
        <div className="mx-auto max-w-[2000px]">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="flex items-center text-2xl font-semibold text-slate-900 md:text-3xl">
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
                  className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-all md:px-6 ${activeTab === 'brokers'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Building className="h-4 w-4" />
                  Brokers
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-xs ${activeTab === 'brokers'
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
                  className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-all md:px-6 ${activeTab === 'clients'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Users className="h-4 w-4" />
                  Traders
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-xs ${activeTab === 'clients'
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
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all md:px-4 md:text-sm ${statusFilter === 'PENDING'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Pending Only
                </button>
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all md:px-4 md:text-sm ${statusFilter === 'ALL'
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
                  {/* Search Bar */}
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

                  {/* Super Broker Filter - Updated to match the style */}
                  <div className="relative w-full">
                    <select
                      value={selectedSuperBroker}
                      onChange={(e) => setSelectedSuperBroker(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 md:py-3"
                    >
                      <option value="">All Super Brokers</option>
                      {superBrokerList.map((sb: any) => (
                        <option key={sb.id} value={sb.id}>
                          {sb.fullname} ({sb.SBID || sb.id?.substring(0, 6)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Broker Filter - Updated to match the style */}
                  <div className="relative w-full">
                    <select
                      value={selectedBroker}
                      onChange={(e) => setSelectedBroker(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 md:py-3"
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

              {/* Broker Table with Row Click */}
              {isLoadingBrokers ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <GenericTable
                    data={filteredBrokers}
                    columns={brokerColumns}
                    onRowClick={handleBrokerRowClick}
                    clickable={true}
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
                  {/* Search Bar */}
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

                  {/* Super Broker Filter */}
                  <div className="relative w-full">

                    <select
                      value={clientSelectedSuperBroker}
                      onChange={(e) => setClientSelectedSuperBroker(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pl-10 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 md:py-3"
                    >
                      <option value="all">All Super Brokers</option>
                      {superBrokerList.map((sb: any) => (
                        <option key={sb.id} value={sb.id}>
                          {sb.fullname} ({sb.SBID || sb.id?.substring(0, 6)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Broker Filter */}
                  <div className="relative w-full">

                    <select
                      value={clientSelectedBroker}
                      onChange={(e) => setClientSelectedBroker(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pl-10 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 md:py-3"
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

              {/* Client Table with Row Click */}
              {isLoadingCustomers ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <GenericTable
                    data={filteredClients}
                    columns={clientColumns}
                    onRowClick={handleClientRowClick}
                    clickable={true}
                    searchAble={false}
                    itemsPerPage={10}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
            <div className="flex items-start gap-4 mb-4">
              <div className={`rounded-full p-2 ${confirmAction.type === 'approve'
                ? 'bg-emerald-100'
                : 'bg-red-100'
                }`}>
                {confirmAction.type === 'approve' ? (
                  <UserCheck className={`h-6 w-6 ${confirmAction.type === 'approve'
                    ? 'text-emerald-600'
                    : 'text-red-600'
                    }`} />
                ) : (
                  <Trash2 className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  {confirmAction.type === 'approve' ? 'Confirm Approval' : 'Confirm Delete'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {confirmAction.type === 'approve'
                    ? `Are you sure you want to approve ${getItemName()}?`
                    : `Are you sure you want to delete ${getItemName()}? This action cannot be undone.`
                  }
                </p>
              </div>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isProcessing}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium text-white shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmAction.type === 'approve'
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                  : 'bg-red-500 hover:bg-red-600 shadow-red-200'
                  }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </span>
                ) : (
                  confirmAction.type === 'approve' ? 'Approve' : 'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PendingApprovals;