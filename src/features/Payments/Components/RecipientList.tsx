/*eslint-disable*/
import React, {useState} from 'react';
import {Receipt, Star} from 'lucide-react';
import {useGetBeneficiary} from '@/lib/react-query/beneficiary';
import {useNavigate} from '@tanstack/react-router';

interface RecipientListProps {
  searchQuery: string;
}

const RecipientList: React.FC<RecipientListProps> = ({searchQuery}) => {
  // Local state for favorites to allow toggling
  const {data: allBeneficiary} = useGetBeneficiary();
  const navigate = useNavigate();
  const [recipients, setRecipients] = useState(allBeneficiary);

  // const toggleFavorite = (id: string) => {
  //   setRecipients((prev) =>
  //     prev.map((r) => (r.id === id ? {...r, isFavorite: !r.isFavorite} : r)),
  //   );
  // };

  const filteredRecipients = recipients?.filter((r: any) =>
    r?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
        <h2 className="text-gray-900 text-lg font-bold">Recent Recipients</h2>
      </div>

      <div className="flex flex-col">
        {filteredRecipients?.length > 0 ? (
          filteredRecipients?.map((recipient: any) => (
            <div
              key={recipient?.id}
              onClick={() => {
                if (recipient?.isVerified) {
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
                </div>
                <div>
                  <h3 className="text-gray-900 text-base font-bold">
                    {recipient?.fullName}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {recipient?.accountNumber}
                  </p>
                </div>
              </div>
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
          ))
        ) : (
          <div className="text-gray-500 p-8 text-center">
            No recipients found.
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipientList;
