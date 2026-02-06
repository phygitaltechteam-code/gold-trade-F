/*eslint-disable*/
import React, {useState} from 'react';
import {Receipt, Star, Clock, XCircle, CheckCircle} from 'lucide-react';
import {useGetBeneficiary} from '@/lib/react-query/beneficiary';
import {useNavigate} from '@tanstack/react-router';

interface RecipientListProps {
  searchQuery: string;
}

const RecipientList: React.FC<RecipientListProps> = ({searchQuery}) => {
  const {data: allBeneficiary} = useGetBeneficiary();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // 'all', 'pending', 'rejected', 'approved'
  const [recipients, setRecipients] = useState(allBeneficiary);

  // Get status information for a recipient
  const getStatusInfo = (recipient: any) => {
    let status = '';
    let statusColor = '';
    let statusText = '';
    let icon = null;

    // Determine status based on available fields
    if (recipient.status) {
      status = recipient.status.toLowerCase();
    } else if (recipient.isVerified) {
      status = 'approved';
    } else {
      status = 'pending';
    }

    // Set status properties
    switch (status) {
      case 'approved':
      case 'verified':
        // statusText = 'Approved';
        // statusColor = 'bg-green-100 text-green-800 border-green-200';
        // icon = <CheckCircle className="h-3 w-3" />;
        break;
      case 'rejected':
      case 'declined':
        // statusText = 'Rejected';
        // statusColor = 'bg-red-100 text-red-800 border-red-200';
        // icon = <XCircle className="h-3 w-3" />;
        break;
      case 'pending':
      default:
        // statusText = 'Pending';
        // statusColor = 'bg-amber-100 text-amber-800 border-amber-200';
        // icon = <Clock className="h-3 w-3" />;
        break;
    }

    return {status, statusText, statusColor, icon};
  };

  // Filter recipients by search query and selected status
  const filteredRecipients =
    recipients?.filter((recipient: any) => {
      // Filter by search query
      const matchesSearch =
        recipient?.fullName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        recipient?.accountNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Filter by status
      if (selectedStatus === 'all') return matchesSearch;

      const {status} = getStatusInfo(recipient);
      return matchesSearch && status === selectedStatus;
    }) || [];

  // Sort recipients: Approved -> Pending -> Rejected, then alphabetically by name
  const sortedRecipients = [...filteredRecipients].sort((a, b) => {
    // Get status order
    const statusOrder = {
      approved: 1,
      verified: 1,
      pending: 2,
      rejected: 3,
      declined: 3,
    };
    const statusA = getStatusInfo(a).status;
    const statusB = getStatusInfo(b).status;

    // Compare by status first
    const orderA = statusOrder[statusA] || 4;
    const orderB = statusOrder[statusB] || 4;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // If same status, sort alphabetically by name
    return (a.fullName || '').localeCompare(b.fullName || '');
  });

  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="mt-2 min-h-[500px] rounded-t-3xl bg-white pb-24 shadow-sm">
      <div className="px-5 pb-2 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-900 text-lg font-bold">Recent Recipients</h2>
          <div className="text-gray-500 text-xs">
            {sortedRecipients.length}{' '}
            {sortedRecipients.length === 1 ? 'recipient' : 'recipients'}
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedStatus === 'all' ? 'border border-blue-200 bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setSelectedStatus('all')}
          >
            All
          </button>
          <button
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedStatus === 'pending' ? 'border border-amber-200 bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setSelectedStatus('pending')}
          >
            Pending
          </button>
          <button
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedStatus === 'approved' ? 'border border-green-200 bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setSelectedStatus('approved')}
          >
            Approved
          </button>
          <button
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedStatus === 'rejected' ? 'border border-red-200 bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setSelectedStatus('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        {sortedRecipients.length > 0 ? (
          sortedRecipients?.map((recipient: any) => {
            const {statusText, statusColor, icon} = getStatusInfo(recipient);

            return (
              <div
                key={recipient?.id}
                onClick={() => {
                  const {status} = getStatusInfo(recipient);
                  if (status === 'approved' || status === 'verified') {
                    navigate({to: `/payment/send/${recipient?.id}`});
                  } else {
                    navigate({to: `/beneficiary/statuspending`});
                  }
                }}
                className="hover:bg-gray-50 active:bg-gray-100 flex cursor-pointer items-center justify-between border-b border-stroke p-4 transition-colors last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-transparent bg-blue-100 text-xl font-bold text-blue-600 group-hover:border-primary/10">
                      {getInitials(recipient?.fullName)}
                    </div>
                    {/* Status icon overlay */}
                    <div
                      className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border ${statusColor}`}
                    >
                      {icon}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-gray-900 text-base font-bold">
                        {recipient?.fullName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor}`}
                      >
                        {statusText}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {recipient?.accountNumber}
                    </p>
                  </div>
                </div>
                {/* Favorite button (optional) */}
                {/* <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(recipient.id);
                  }}
                  className="p-2"
                >
                  <Star
                    size={20}
                    className={`${recipient.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                  />
                </button> */}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            {selectedStatus === 'all' ? (
              <>
                <div className="bg-gray-100 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <Receipt className="text-gray-400 h-8 w-8" />
                </div>
                <h3 className="text-gray-700 mb-2 text-lg font-medium">
                  No recipients found
                </h3>
                <p className="text-gray-500 max-w-xs text-sm">
                  {searchQuery
                    ? 'No recipients match your search. Try a different search term.'
                    : 'Add beneficiaries to see them here.'}
                </p>
              </>
            ) : (
              <>
                <div
                  className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                    selectedStatus === 'approved'
                      ? 'bg-green-100'
                      : selectedStatus === 'rejected'
                        ? 'bg-red-100'
                        : 'bg-amber-100'
                  }`}
                >
                  {selectedStatus === 'approved' ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : selectedStatus === 'rejected' ? (
                    <XCircle className="h-8 w-8 text-red-600" />
                  ) : (
                    <Clock className="h-8 w-8 text-amber-600" />
                  )}
                </div>
                <h3 className="text-gray-700 mb-2 text-lg font-medium">
                  No {selectedStatus} recipients
                </h3>
                <p className="text-gray-500 max-w-xs text-sm">
                  {searchQuery
                    ? 'No matching recipients with this status.'
                    : `No recipients have "${selectedStatus}" status.`}
                </p>
                <button
                  onClick={() => setSelectedStatus('all')}
                  className="mt-4 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200"
                >
                  View all recipients
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipientList;
