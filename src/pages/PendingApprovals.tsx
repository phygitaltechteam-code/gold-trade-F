import React, { useState, useMemo } from 'react';
import { useGetBrokerData, useGetSuperBrokerData, useDeleteBroker, useApproveBroker, useUpdateBroker } from '@/lib/api/addbroker';
import { useGetCustomer, useAcceptCustomer, useDeleteCustomer, useUpdateCustomer } from '@/lib/react-query/Customer';
import GenericTable, { Column } from '@/components/Forms/Table/GenericTable';
import { Search, Filter, CheckCircle, Edit3, Trash2, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const PendingApprovals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'brokers' | 'clients'>('brokers');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'ALL'>('PENDING');

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
  const { data: brokerResponse, isLoading: isLoadingBrokers, refetch: refetchBrokers } = useGetBrokerData();
  const { data: superBrokerResponse, isLoading: isLoadingSuperBrokers } = useGetSuperBrokerData();
  const { data: customerResponse, isLoading: isLoadingCustomers, refetch: refetchCustomers } = useGetCustomer();

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
    if (customerResponse?.data && Array.isArray(customerResponse.data)) list = customerResponse.data;
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
    if (window.confirm(`Are you sure you want to delete broker ${broker.fullname || ''}?`)) {
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
    if (window.confirm(`Are you sure you want to delete client ${client?.user?.fullname || client?.fullname || ''}?`)) {
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
        const isPending = !b.isActive || !b.isVerified || b.status === 'PENDING';
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
        if (b.superBrokerId !== selectedSuperBroker && b.superBroker?.id !== selectedSuperBroker) {
          return false;
        }
      }

      // Broker Dropdown Filter
      if (selectedBroker) {
        if (b.id !== selectedBroker) return false;
      }

      return true;
    });
  }, [brokerList, statusFilter, brokerSearch, selectedSuperBroker, selectedBroker]);

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
        if (c.brokerId !== clientSelectedBroker && c.broker?.id !== clientSelectedBroker) {
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
          <div className="font-semibold text-gray-900">{item.fullname || 'N/A'}</div>
          <div className="text-xs text-gray-500">Broker ID: {item.BKId || item.id?.substring(0,8)}</div>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: 'phoneNumber',
      render: (item: any) => <span className="font-mono text-sm">{item.phoneNumber || 'N/A'}</span>,
    },
    {
      header: 'Super Broker',
      accessor: 'superBrokerId',
      render: (item: any) => (
        <span className="text-sm font-medium text-gray-700">
          {item.superBroker?.fullname || item.superBrokerId || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Aadhar Card Number',
      accessor: 'aadharCardNumber',
      render: (item: any) => <span className="font-mono text-sm">{item.aadharCardNumber || 'N/A'}</span>,
    },
    {
      header: 'Area',
      accessor: 'area',
      render: (item: any) => <span className="text-sm">{item.area || 'N/A'}</span>,
    },
    {
      header: 'Commission',
      accessor: 'commission',
      render: (item: any) => (
        <span className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs border border-orange-100">
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
            onClick={() => setEditingBroker({ ...item })}
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
          <div className="font-semibold text-gray-900">{item?.user?.fullname || item?.fullname || 'N/A'}</div>
          <div className="text-xs text-gray-500">{item?.user?.email || item?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: (item: any) => item?.user?.phoneNumber || item?.phoneNumber || 'N/A',
      render: (item: any) => (
        <span className="font-mono text-sm">{item?.user?.phoneNumber || item?.phoneNumber || 'N/A'}</span>
      ),
    },
    {
      header: 'Super Broker',
      accessor: 'superBroker',
      render: (item: any) => (
        <span className="text-sm font-medium text-gray-700">
          {item.superBroker?.fullname || item.broker?.superBroker?.fullname || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Broker',
      accessor: 'broker',
      render: (item: any) => (
        <span className="text-sm font-medium text-gray-700">
          {item.broker?.fullname || item.brokerId || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Aadhar Card Number',
      accessor: (item: any) => item?.aadharCard || item?.user?.aadharCard || 'N/A',
      render: (item: any) => (
        <span className="font-mono text-sm">{item?.aadharCard || item?.user?.aadharCard || 'N/A'}</span>
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
            onClick={() => setEditingClient({
              id: item.id,
              fullname: item?.user?.fullname || item?.fullname || '',
              phoneNumber: item?.user?.phoneNumber || item?.phoneNumber || '',
              aadharCard: item?.aadharCard || item?.user?.aadharCard || '',
              brokerId: item?.brokerId || '',
            })}
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
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-inter">
      <div className="mx-auto max-w-[1500px]">
        {/* Header & Status Toggle */}
        <div className="mb-8 flex flex-col justify-between items-start md:flex-row md:items-center gap-4 border-b border-gray-200 pb-6 bg-white p-6 rounded-2xl shadow-sm border border-stroke">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                Pending Approvals Dashboard
              </span>
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review, edit, delete, and approve pending registrations for Brokers and Clients.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                refetchBrokers();
                refetchCustomers();
              }}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
            >
              <RefreshCw className="h-4 w-4 text-gray-500 animate-spin-hover" /> Refresh
            </button>
            <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
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
        <div className="mb-6 flex gap-3 border-b border-gray-200 pb-4">
          <button
            onClick={() => setActiveTab('brokers')}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-sm transition-all ${
              activeTab === 'brokers'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20 scale-105'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Broker Pending Requests
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'brokers' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>
              {filteredBrokers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-sm transition-all ${
              activeTab === 'clients'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20 scale-105'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Customer Pending Requests
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'clients' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>
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
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search broker by name or phone..."
                  value={brokerSearch}
                  onChange={(e) => setBrokerSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={selectedSuperBroker}
                  onChange={(e) => setSelectedSuperBroker(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 appearance-none cursor-pointer"
                >
                  <option value="">Filter by Super Broker (All)</option>
                  {superBrokerList.map((sb: any) => (
                    <option key={sb.id} value={sb.id}>
                      {sb.fullname} ({sb.SBID || sb.id?.substring(0,6)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={selectedBroker}
                  onChange={(e) => setSelectedBroker(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 appearance-none cursor-pointer"
                >
                  <option value="">Filter by Broker (All)</option>
                  {brokerList.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.fullname} ({b.BKId || b.id?.substring(0,6)})
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
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search client by name or phone..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={clientSelectedBroker}
                  onChange={(e) => setClientSelectedBroker(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 appearance-none cursor-pointer"
                >
                  <option value="">Filter by Broker (All)</option>
                  {brokerList.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.fullname} ({b.BKId || b.id?.substring(0,6)})
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900">Edit Broker Request</h3>
                <button
                  onClick={() => setEditingBroker(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBrokerEdit} className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={editingBroker.fullname || ''}
                    onChange={(e) => setEditingBroker({ ...editingBroker, fullname: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    value={editingBroker.phoneNumber || ''}
                    onChange={(e) => setEditingBroker({ ...editingBroker, phoneNumber: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Aadhar Card Number</label>
                  <input
                    type="text"
                    value={editingBroker.aadharCardNumber || ''}
                    onChange={(e) => setEditingBroker({ ...editingBroker, aadharCardNumber: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Area</label>
                  <input
                    type="text"
                    value={editingBroker.area || ''}
                    onChange={(e) => setEditingBroker({ ...editingBroker, area: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Commission %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBroker.commission || ''}
                    onChange={(e) => setEditingBroker({ ...editingBroker, commission: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingBroker(null)}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-red-700 transition-all"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900">Edit Customer Request</h3>
                <button
                  onClick={() => setEditingClient(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveClientEdit} className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={editingClient.fullname || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, fullname: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    value={editingClient.phoneNumber || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, phoneNumber: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Aadhar Card Number</label>
                  <input
                    type="text"
                    value={editingClient.aadharCard || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, aadharCard: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Assign Broker</label>
                  <select
                    value={editingClient.brokerId || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, brokerId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 cursor-pointer appearance-none bg-white"
                  >
                    <option value="">None / Unassigned</option>
                    {brokerList.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.fullname} ({b.BKId || b.id?.substring(0,6)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingClient(null)}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-red-700 transition-all"
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
