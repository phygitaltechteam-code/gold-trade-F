import React, {useMemo, useState} from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {Edit3, Search, Trash2, UserCheck, Users, X} from 'lucide-react';
import toast from 'react-hot-toast';
import {useNavigate} from '@tanstack/react-router';
import {
  useAcceptCustomer,
  useDeleteCustomer,
  useGetCustomer,
  useUpdateCustomer,
} from '@/lib/api/masterpanelapi/masterapi';

const PendingApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'ALL'>('PENDING');
  const [clientSearch, setClientSearch] = useState('');
  const [editingClient, setEditingClient] = useState<any | null>(null);

  const {
    data: customerResponse,
    isLoading: isLoadingCustomers,
    refetch: refetchCustomers,
  } = useGetCustomer();

  const acceptCustomerMutation = useAcceptCustomer();
  const deleteCustomerMutation = useDeleteCustomer();
  const updateCustomerMutation = useUpdateCustomer();

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

  const handleClientRowClick = (client: any) => {
    navigate({to: `/companybroker/clientdetail/${client.id}`});
  };

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

      return true;
    });
  }, [customerList, statusFilter, clientSearch]);

  const clientColumns = [
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
              onClick={(e) => {
                e.stopPropagation();
                setEditingClient({
                  id: item.id,
                  fullname: item?.user?.fullname || '',
                  email: item?.user?.email || '',
                  phoneNumber: item?.user?.phoneNumber || '',
                  address: item?.address || item?.city || item?.area || '',
                });
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
    },
  ];

  const pendingClientsCount = customerList.filter((c: any) => {
    const user = c?.user;
    return user && !user.isVerified && !user.isRejected;
  }).length;

  return (
    <div className="bg-gray-50/50 font-inter min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[2000px]">
        <div className="mb-6 md:mb-8">
          <h1 className="flex items-center text-2xl font-semibold text-slate-900 md:text-3xl">
            Pending Customer Approvals
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Review and manage pending customer registrations.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stroke bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Users className="h-4 w-4" />
            Customers
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
              {pendingClientsCount}
            </span>
          </div>

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

        <div className="rounded-2xl border border-stroke bg-white shadow-sm">
          <div className="border-b border-stroke p-4 md:p-6">
            <div className="relative max-w-md">
              <Search className="text-gray-400 absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, phone, email or CRN..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="bg-gray-50/50 text-gray-900 w-full rounded-xl border border-stroke py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

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
                rowsPerPage={10}
              />
            </div>
          )}
        </div>

        {editingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="animate-in fade-in zoom-in-95 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl duration-200">
              <div className="flex items-center justify-between border-b border-stroke pb-4">
                <h3 className="text-gray-900 text-xl font-bold">Edit Customer</h3>
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
                    {updateCustomerMutation.isPending ? 'Saving...' : 'Save Changes'}
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
