import React, {useState} from 'react';
import {Star} from 'lucide-react';
import {RECIPIENTS} from '../constants';

interface RecipientListProps {
  searchQuery: string;
}

const RecipientList: React.FC<RecipientListProps> = ({searchQuery}) => {
  // Local state for favorites to allow toggling
  const [recipients, setRecipients] = useState(RECIPIENTS);

  const toggleFavorite = (id: string) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? {...r, isFavorite: !r.isFavorite} : r)),
    );
  };

  const filteredRecipients = recipients.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.detail.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="mt-2 min-h-[500px] rounded-t-3xl bg-white pb-24 shadow-sm">
      <div className="px-5 pb-2 pt-6">
        <h2 className="text-gray-900 text-lg font-bold">Recent Recipients</h2>
      </div>

      <div className="flex flex-col">
        {filteredRecipients.length > 0 ? (
          filteredRecipients.map((recipient) => (
            <div
              key={recipient.id}
              className="hover:bg-gray-50 active:bg-gray-100 border-gray-50 flex cursor-pointer items-center justify-between border-b p-4 transition-colors last:border-0"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${recipient.iconBgColor} ${recipient.iconColor} shadow-sm`}
                >
                  <recipient.icon size={24} />
                </div>
                <div>
                  <h3 className="text-gray-900 text-base font-bold">
                    {recipient.name}
                  </h3>
                  <p className="text-gray-500 text-sm">{recipient.detail}</p>
                </div>
              </div>
              <button
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
              </button>
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
