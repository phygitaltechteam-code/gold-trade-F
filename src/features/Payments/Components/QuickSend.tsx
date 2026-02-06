/*eslint-disable*/
import React, {useState} from 'react';
import {CheckCircle, XCircle, Clock} from 'lucide-react';
import {useNavigate} from '@tanstack/react-router';
import {useGetBeneficiary} from '@/lib/react-query/beneficiary';

const QuickSend: React.FC = () => {
  const navigate = useNavigate();
  const {data: allBeneficiary} = useGetBeneficiary();
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // 'all', 'pending', 'rejected', 'approved'

  console.log('all beneficiary', allBeneficiary);

  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Get status information for a contact
  const getStatusInfo = (contact: any) => {
    let status = '';
    let statusText = '';
    let statusColor = '';
    let icon = null;

    // Determine status based on available fields
    if (contact.status) {
      status = contact.status.toLowerCase();
    } else if (contact.isVerified) {
      status = 'approved';
    } else {
      status = 'pending';
    }

    // Set status properties
    switch (status) {
      case 'approved':
      case 'verified':
        statusText = 'Approved';
        statusColor = 'bg-green-100 text-green-800 border-green-200';
        icon = <CheckCircle className="h-3 w-3" />;
        break;
      case 'rejected':
      case 'declined':
        statusText = 'Rejected';
        statusColor = 'bg-red-100 text-red-800 border-red-200';
        icon = <XCircle className="h-3 w-3" />;
        break;
      case 'pending':
      default:
        statusText = 'Pending';
        statusColor = 'bg-amber-100 text-amber-800 border-amber-200';
        icon = <Clock className="h-3 w-3" />;
        break;
    }

    return {status, statusText, statusColor, icon};
  };

  // Filter beneficiaries by selected status
  const filteredBeneficiaries = allBeneficiary
    ? allBeneficiary.filter((contact: any) => {
        if (selectedStatus === 'all') return true;
        const {status} = getStatusInfo(contact);
        return status === selectedStatus;
      })
    : [];

  return (
    <div className="px-5 py-2">
      <div className="mb-4">
        <h2 className="text-gray-900 text-lg font-bold">Quick Send</h2>

        {/* Status Filter Buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
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

      <div className="flex flex-wrap gap-4 pb-2">
        {filteredBeneficiaries?.map((contact: any) => {
          const {statusText, statusColor, icon} = getStatusInfo(contact);

          return (
            <div
              key={contact.id}
              className="group relative flex flex-col items-center gap-2"
              onClick={() => {
                const {status} = getStatusInfo(contact);
                if (status === 'approved' || status === 'verified') {
                  navigate({to: `/payment/send/${contact?.id}`});
                } else {
                  navigate({to: `/beneficiary/statuspending`});
                }
              }}
            >
              <div className="relative">
                {/* Avatar with initials */}
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-transparent bg-gradient-to-br from-blue-100 to-blue-50 text-lg font-bold text-blue-600 group-hover:border-primary/20">
                  {getInitials(contact.fullName)}
                </div>

                {/* Status badge on top-right corner */}
                <div
                  className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border ${statusColor}`}
                >
                  {icon}
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                {/* Contact name */}
                <span className="text-gray-700 max-w-[80px] truncate text-center text-xs font-medium">
                  {contact.fullName || contact.name || 'Unknown'}
                </span>

                {/* Status text badge */}
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor}`}
                >
                  {statusText}
                </span>
              </div>
            </div>
          );
        })}

        {/* Show message if no beneficiaries */}
        {filteredBeneficiaries.length === 0 && (
          <div className="w-full py-8 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              {selectedStatus === 'all' ? (
                <>
                  <div className="bg-gray-100 flex h-14 w-14 items-center justify-center rounded-full">
                    <Clock className="text-gray-400 h-6 w-6" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    No beneficiaries found
                  </p>
                  <p className="text-gray-400 text-xs">
                    Add beneficiaries to see them here
                  </p>
                </>
              ) : (
                <>
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${
                      selectedStatus === 'approved'
                        ? 'bg-green-100'
                        : selectedStatus === 'rejected'
                          ? 'bg-red-100'
                          : 'bg-amber-100'
                    }`}
                  >
                    {selectedStatus === 'approved' ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : selectedStatus === 'rejected' ? (
                      <XCircle className="h-6 w-6 text-red-600" />
                    ) : (
                      <Clock className="h-6 w-6 text-amber-600" />
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">
                    No {selectedStatus} beneficiaries
                  </p>
                  <p className="text-gray-400 text-xs">
                    Try another status filter
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickSend;
