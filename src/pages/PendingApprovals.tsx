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

  // Handlers for Broker - Approve with confirmation
  const handleApproveBroker = (broker: any) => {
    confirmAlert({
      title: 'Confirm Approval',
      message: `Are you sure you want to approve broker "${broker.fullname || ''}"?`,
      buttons: [
        {
          label: 'Approve',
          onClick: async () => {
            try {
              await approveBrokerMutation.mutateAsync({
                id: broker.id,
                superBrokerId: broker.superBrokerId || null,
              });
              refetchBrokers();
            } catch (error) {
              console.error(error);
              toast.error('Failed to approve broker');
            }
          },
          className: 'bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition',
        },
        {
          label: 'Cancel',
          onClick: () => { },
          className: 'bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition ml-2',
        },
      ],
      overlayClassName: 'react-confirm-alert-overlay-custom',
      customUI: ({ onClose }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-sm rounded-2xl border-l-4 border-emerald-600 bg-white p-8 shadow-2xl">
            <h1 className="mb-3 text-xl font-bold text-text-charcoal">
              Confirm Approval
            </h1>
            <p className="mb-6 text-base leading-relaxed text-text-charcoal">
              Are you sure you want to approve broker "{broker.fullname || ''}"?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => onClose()}
                className="rounded-lg bg-gray-300 px-6 py-2 font-semibold text-text-charcoal transition hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await approveBrokerMutation.mutateAsync({
                      id: broker.id,
                      superBrokerId: broker.superBrokerId || null,
                    });
                    refetchBrokers();
                    onClose();
                  } catch (error) {
                    console.error(error);
                    toast.error('Failed to approve broker');
                  }
                }}
                className="rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white transition hover:bg-emerald-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  // DELETE CONFIRMATION POPUP FOR BROKER
  const handleDeleteBroker = (broker: any) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete broker "${broker.fullname || ''}"? This action cannot be undone.`,
      buttons: [
        {
          label: 'Delete',
          onClick: async () => {
            try {
              await deleteBrokerMutation.mutateAsync(broker.id);
              refetchBrokers();
            } catch (error) {
              console.error(error);
              toast.error('Failed to delete broker');
            }
          },
          className: 'bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition',
        },
        {
          label: 'Cancel',
          onClick: () => { },
          className: 'bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition ml-2',
        },
      ],
      overlayClassName: 'react-confirm-alert-overlay-custom',
      customUI: ({ onClose }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-sm rounded-2xl border-l-4 border-red-600 bg-white p-8 shadow-2xl">
            <h1 className="mb-3 text-xl font-bold text-text-charcoal">
              Confirm Delete
            </h1>
            <p className="mb-6 text-base leading-relaxed text-text-charcoal">
              Are you sure you want to delete broker "{broker.fullname || ''}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => onClose()}
                className="rounded-lg bg-gray-300 px-6 py-2 font-semibold text-text-charcoal transition hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteBrokerMutation.mutateAsync(broker.id);
                    refetchBrokers();
                    onClose();
                  } catch (error) {
                    console.error(error);
                    toast.error('Failed to delete broker');
                  }
                }}
                className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ),
    });
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

  // Handlers for Client - Verify with confirmation
  const handleApproveClient = (client: any) => {
    confirmAlert({
      title: 'Confirm Verify',
      message: `Are you sure you want to verify customer "${client?.user?.fullname || client?.fullname || ''}"?`,
      buttons: [
        {
          label: 'Verify',
          onClick: async () => {
            try {
              await acceptCustomerMutation.mutateAsync(client.id);
              refetchCustomers();
            } catch (error) {
              console.error(error);
              toast.error('Failed to verify customer');
            }
          },
          className: 'bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition',
        },
        {
          label: 'Cancel',
          onClick: () => { },
          className: 'bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition ml-2',
        },
      ],
      overlayClassName: 'react-confirm-alert-overlay-custom',
      customUI: ({ onClose }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-sm rounded-2xl border-l-4 border-emerald-600 bg-white p-8 shadow-2xl">
            <h1 className="mb-3 text-xl font-bold text-text-charcoal">
              Confirm Verify
            </h1>
            <p className="mb-6 text-base leading-relaxed text-text-charcoal">
              Are you sure you want to verify customer "{client?.user?.fullname || client?.fullname || ''}"?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => onClose()}
                className="rounded-lg bg-gray-300 px-6 py-2 font-semibold text-text-charcoal transition hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await acceptCustomerMutation.mutateAsync(client.id);
                    refetchCustomers();
                    onClose();
                  } catch (error) {
                    console.error(error);
                    toast.error('Failed to verify customer');
                  }
                }}
                className="rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white transition hover:bg-emerald-700"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  // DELETE CONFIRMATION POPUP FOR CLIENT
  const handleDeleteClient = (client: any) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete client "${client?.user?.fullname || client?.fullname || ''}"? This action cannot be undone.`,
      buttons: [
        {
          label: 'Delete',
          onClick: async () => {
            try {
              await deleteCustomerMutation.mutateAsync(client.id);
              refetchCustomers();
            } catch (error) {
              console.error(error);
              toast.error('Failed to delete customer');
            }
          },
          className: 'bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition',
        },
        {
          label: 'Cancel',
          onClick: () => { },
          className: 'bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition ml-2',
        },
      ],
      overlayClassName: 'react-confirm-alert-overlay-custom',
      customUI: ({ onClose }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-sm rounded-2xl border-l-4 border-red-600 bg-white p-8 shadow-2xl">
            <h1 className="mb-3 text-xl font-bold text-text-charcoal">
              Confirm Delete
            </h1>
            <p className="mb-6 text-base leading-relaxed text-text-charcoal">
              Are you sure you want to delete client "{client?.user?.fullname || client?.fullname || ''}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => onClose()}
                className="rounded-lg bg-gray-300 px-6 py-2 font-semibold text-text-charcoal transition hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteCustomerMutation.mutateAsync(client.id);
                    refetchCustomers();
                    onClose();
                  } catch (error) {
                    console.error(error);
                    toast.error('Failed to delete customer');
                  }
                }}
                className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ),
    });
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

          // Only show actions if showActions is true AND item is pending
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

        // Only show actions for pending items
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

  return (
    <div className="bg-gray-50/50 font-inter min-h-screen p-4 md:p-6 lg:p-8">
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
                    <option value="all">All Super Brokers</option>
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
  );
};

export default PendingApprovals;