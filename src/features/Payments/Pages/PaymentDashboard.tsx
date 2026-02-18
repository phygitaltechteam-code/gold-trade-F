// import React, {useState} from 'react';
// import {ArrowLeft, Plus, ScanLine, Search} from 'lucide-react';
// import QuickSend from '../Components/QuickSend';
// import RecipientList from '../Components/RecipientList';
// import {useNavigate} from '@tanstack/react-router';

// const PaymentDashboard: React.FC = () => {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState('');

//   return (
//     <div className="bg-gray-50 flex min-h-screen items-start justify-center pt-0 md:pt-10">
//       <div className="relative flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl md:min-h-[850px] md:rounded-3xl">
//         <header className="z-10 flex items-center justify-between bg-white px-5 py-4">
//           <button
//             className="text-gray-800 hover:bg-gray-100 -ml-2 rounded-full p-2 transition-colors"
//             onClick={() => navigate({to: '/dashboard'})}
//           >
//             <ArrowLeft size={24} strokeWidth={2.5} />
//           </button>
//           <h1 className="text-gray-900 text-xl font-extrabold">
//             Select Recipient
//           </h1>
//           <button className="-mr-2 rounded-full p-2 text-primary transition-colors hover:bg-primary/10">
//             <ScanLine size={24} strokeWidth={2.5} />
//           </button>
//         </header>

//         <div className="bg-white px-5 py-4">
//           <div className="flex items-center gap-3">
//             {/* Search Bar - Takes remaining space */}
//             <div className="relative flex-1">
//               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
//                 <Search size={20} className="text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search name, phone, or account..."
//                 className="bg-gray-50 text-gray-900 placeholder-gray-400 block w-full rounded-2xl border-none py-3.5 pl-11 pr-4 text-sm font-medium shadow-inner transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>

//             {/* Add New Button - Fixed width */}
//             <div className="flex flex-col items-center">
//               <button
//                 className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-primary/20 bg-primary/5 text-primary transition-colors hover:bg-primary/10"
//                 onClick={() => navigate({to: '/beneficiary/addbeneficiaryy'})}
//               >
//                 <Plus size={18} strokeWidth={2.5} />
//               </button>
//               <span className="text-gray-600 mt-1 text-[10px] font-medium">
//                 Add New
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Scrollable Content Area */}
//         <main className="no-scrollbar flex-1 overflow-y-auto bg-white">
//           <div className="bg-gray-50">
//             <RecipientList searchQuery={searchQuery} />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default PaymentDashboard;

import React, {useState} from 'react';
import {ArrowLeft, Plus, ScanLine, Search} from 'lucide-react';
import QuickSend from '../Components/QuickSend';
import RecipientList from '../Components/RecipientList';
import {useNavigate} from '@tanstack/react-router';

const PaymentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-gray-50 flex min-h-screen items-start justify-center pt-0">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white shadow-2xl md:rounded-3xl">
        <header className="z-10 flex items-center justify-between bg-white px-5 py-4 md:px-8 md:py-6">
          <button
            className="text-gray-800 hover:bg-gray-100 -ml-2 rounded-full p-2 transition-colors md:p-3"
            onClick={() => navigate({to: '/dashboard'})}
          >
            <ArrowLeft size={24} strokeWidth={2.5} className="md:h-6 md:w-6" />
          </button>
          <h1 className="text-gray-900 text-xl font-extrabold md:text-2xl lg:text-3xl">
            Select Recipient
          </h1>
          <button className="-mr-2 rounded-full p-2 text-primary transition-colors hover:bg-primary/10 md:p-3">
            {/* <ScanLine size={24} strokeWidth={2.5} className="md:h-6 md:w-6" /> */}
          </button>
        </header>

        <div className="bg-white px-5 py-4 md:px-8 md:py-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 md:pl-5">
                <Search size={20} className="text-gray-400 md:h-5 md:w-5" />
              </div>
              <input
                type="text"
                placeholder="Search name, phone, or account..."
                className="bg-gray-50 text-gray-900 placeholder-gray-400 block w-full rounded-2xl border-none py-3.5 pl-11 pr-4 text-sm font-medium shadow-inner transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 md:py-4 md:pl-12 md:text-base lg:py-5"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col items-center md:items-start">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-primary/20 bg-primary/5 text-primary transition-colors hover:bg-primary/10 md:h-12 md:w-12"
                onClick={() => navigate({to: '/beneficiary/addbeneficiaryy'})}
              >
                <Plus size={18} strokeWidth={2.5} className="md:h-5 md:w-5" />
              </button>
              <span className="text-gray-600 mt-1 text-[10px] font-medium md:text-xs">
                Add New
              </span>
            </div>
          </div>
        </div>

        <main className="no-scrollbar flex-1 overflow-y-auto bg-white">
          <div className="bg-gray-50">
            <RecipientList searchQuery={searchQuery} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentDashboard;
