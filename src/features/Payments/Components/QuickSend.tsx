/*eslint-disable*/
import React from 'react';
import {Plus} from 'lucide-react';
import {useNavigate} from '@tanstack/react-router';
import {useGetBeneficiary} from '@/lib/react-query/beneficiary';

const QuickSend: React.FC = () => {
  const navigate = useNavigate();
  const {data: allBeneficiary} = useGetBeneficiary();
  console.log('all beneficiary', allBeneficiary);

  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="px-5 py-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-gray-900 text-lg font-bold">Quick Send</h2>
        <button className="hover:text-primary-800 text-sm font-medium text-primary">
          View all
        </button>
      </div>

      <div className="no-scrollbar flex space-x-6 overflow-x-auto pb-2">
        {/* Add New Button */}
        <div className="flex min-w-[64px] flex-col items-center gap-2">
          <button
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-primary/20 bg-primary/5 text-primary transition-colors hover:bg-primary/10"
            onClick={() => navigate({to: '/beneficiary/addbeneficiaryy'})}
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
          <span className="text-gray-600 text-xs font-medium">Add New</span>
        </div>

        {allBeneficiary?.map((contact: any) => (
          <div
            key={contact.id}
            className="group relative flex min-w-[64px] cursor-pointer flex-col items-center gap-2"
            onClick={() => navigate({to: '/beneficiary/sendmoney'})}
          >
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-transparent bg-blue-100 text-xl font-bold text-blue-600 group-hover:border-primary/10">
                {getInitials(contact.fullName)}
              </div>
            </div>

            <span className="text-gray-600 text-xs font-medium">
              {contact.fullName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickSend;
