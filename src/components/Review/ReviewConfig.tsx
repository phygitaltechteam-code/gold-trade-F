// /**
//  * @license
//  * SPDX-License-Identifier: Apache-2.0
//  */

// import React, {useState} from 'react';
// import {
//   Sliders,
//   Truck,
//   Database,
//   Wallet,
//   HelpCircle,
//   Plus,
//   ChevronLeft,
//   ChevronRight,
//   Edit2,
//   X,
// } from 'lucide-react';

// interface SKU {
//   id: string;
//   name: string;
//   weight: string;
//   fabCost: string;
//   status: 'Active' | 'Inactive';
// }

// export default function ReviewConfig() {
//   const [makerFee, setMakerFee] = useState('0.15');
//   const [takerFee, setTakerFee] = useState('0.25');
//   const [annualStorageFee, setAnnualStorageFee] = useState('0.50');
//   const [baseFee, setBaseFee] = useState('25.00');
//   const [variableFee, setVariableFee] = useState('0.10');
//   const [flatWithdrawalFee, setFlatWithdrawalFee] = useState('10.00');
//   const [percentageWithdrawalFee, setPercentageWithdrawalFee] =
//     useState('0.50');
//   const [showMobileMenu, setShowMobileMenu] = useState(false);

//   const skus: SKU[] = [
//     {
//       id: 'GLD-BAR-010',
//       name: '10g Cast Bar',
//       weight: '10 Grams',
//       fabCost: '$15.00',
//       status: 'Active',
//     },
//     {
//       id: 'GLD-COIN-100',
//       name: '1oz Minted Coin',
//       weight: '31.1 Grams',
//       fabCost: '$45.00',
//       status: 'Active',
//     },
//     {
//       id: 'GLD-BAR-100',
//       name: '100g Cast Bar',
//       weight: '100 Grams',
//       fabCost: '$35.00',
//       status: 'Inactive',
//     },
//   ];

//   return (
//     <div className="font-sans min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
//       {/* Simple Header */}
//       <header className="sticky top-0 z-50 border-b border-stroke bg-white">
//         <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
//           <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
//             <div>
//               <h1 className="text-lg font-bold text-[#1A1A1A] sm:text-xl lg:text-2xl">
//                 Revenue Configuration
//               </h1>
//               <p className="text-gray-500 mt-0.5 text-xs">
//                 Last updated: Today, 10:42 AM
//               </p>
//             </div>

//             {/* Desktop Actions */}
//             <div className="hidden items-center gap-3 sm:flex">
//               <button className="text-gray-600 hover:bg-gray-50 rounded-lg border border-stroke px-4 py-2 text-sm font-medium transition-colors">
//                 Discard
//               </button>
//               <button className="flex items-center gap-2 rounded-lg bg-[#F27D26] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#E06D1F]">
//                 <Database className="h-4 w-4" />
//                 Save Changes
//               </button>
//             </div>

//             {/* Mobile Menu Button */}
//             <button
//               onClick={() => setShowMobileMenu(!showMobileMenu)}
//               className="hover:bg-gray-50 self-end rounded-lg border border-stroke p-2 sm:hidden"
//             >
//               {showMobileMenu ? (
//                 <X className="h-5 w-5" />
//               ) : (
//                 <Edit2 className="h-5 w-5" />
//               )}
//             </button>
//           </div>

//           {/* Mobile Actions */}
//           {showMobileMenu && (
//             <div className="mt-3 flex flex-col gap-2 border-t border-stroke pt-3 sm:hidden">
//               <button className="text-gray-600 hover:bg-gray-50 w-full rounded-lg border border-stroke px-4 py-2.5 text-sm font-medium transition-colors">
//                 Discard Changes
//               </button>
//               <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F27D26] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#E06D1F]">
//                 <Database className="h-4 w-4" />
//                 Save Changes
//               </button>
//             </div>
//           )}
//         </div>
//       </header>

//       <main className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
//         {/* Trading Fees */}
//         <section className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm">
//           <div className="flex flex-col gap-3 border-b border-stroke p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
//             <div>
//               <h2 className="flex items-center gap-2 text-base font-semibold sm:text-lg">
//                 Trading Fees
//               </h2>
//               <p className="text-gray-500 mt-1 text-xs sm:text-sm">
//                 Configure exchange fees for Makers and Takers.
//               </p>
//             </div>
//             <div className="bg-gray-50 self-start rounded-lg p-2">
//               <Sliders className="text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
//             </div>
//           </div>
//           <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6 lg:gap-8">
//             <div className="space-y-2">
//               <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
//                 Maker Fee <HelpCircle className="h-3 w-3 cursor-help" />
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={makerFee}
//                   onChange={(e) => setMakerFee(e.target.value)}
//                   className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
//                 />
//                 <span className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 text-[10px] sm:right-4 sm:text-sm">
//                   %
//                 </span>
//               </div>
//               <p className="text-gray-400 text-[9px] sm:text-[11px]">
//                 Applied to limit orders providing liquidity.
//               </p>
//             </div>
//             <div className="space-y-2">
//               <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
//                 Taker Fee <HelpCircle className="h-3 w-3 cursor-help" />
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={takerFee}
//                   onChange={(e) => setTakerFee(e.target.value)}
//                   className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
//                 />
//                 <span className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 text-[10px] sm:right-4 sm:text-sm">
//                   %
//                 </span>
//               </div>
//               <p className="text-gray-400 text-[9px] sm:text-[11px]">
//                 Applied to market orders matching immediately.
//               </p>
//             </div>
//           </div>
//         </section>

//         {/* Logistics & Custody */}
//         <section className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm">
//           <div className="flex flex-col gap-3 border-b border-stroke p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
//             <div>
//               <h2 className="text-base font-semibold sm:text-lg">
//                 Logistics & Custody
//               </h2>
//               <p className="text-gray-500 mt-1 text-xs sm:text-sm">
//                 Manage storage costs and delivery brokerage.
//               </p>
//             </div>
//             <div className="bg-gray-50 self-start rounded-lg p-2">
//               <Truck className="text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
//             </div>
//           </div>
//           <div className="grid grid-cols-1 gap-6 p-4 sm:gap-8 sm:p-6 lg:grid-cols-2 lg:gap-12">
//             {/* Vault Storage */}
//             <div className="space-y-4 sm:space-y-6">
//               <h3 className="text-gray-900 text-sm font-bold sm:text-base">
//                 Vault Storage
//               </h3>
//               <div className="space-y-2">
//                 <label className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
//                   Annual Storage Fee
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     value={annualStorageFee}
//                     onChange={(e) => setAnnualStorageFee(e.target.value)}
//                     className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
//                   />
//                   <span className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 text-[10px] sm:right-4 sm:text-sm">
//                     % p.a.
//                   </span>
//                 </div>
//                 <p className="text-gray-400 text-[9px] sm:text-[11px]">
//                   Calculated daily based on portfolio value.
//                 </p>
//               </div>
//             </div>
//             {/* Physical Delivery */}
//             <div className="space-y-4 sm:space-y-6">
//               <h3 className="text-gray-900 text-sm font-bold sm:text-base">
//                 Physical Delivery
//               </h3>
//               <div className="grid grid-cols-2 gap-3 sm:gap-4">
//                 <div className="space-y-2">
//                   <label className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
//                     Base Fee
//                   </label>
//                   <div className="relative">
//                     <span className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-[10px] sm:left-4 sm:text-sm">
//                       $
//                     </span>
//                     <input
//                       type="text"
//                       value={baseFee}
//                       onChange={(e) => setBaseFee(e.target.value)}
//                       className="w-full rounded-lg border border-stroke bg-white py-2 pl-6 pr-3 text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:rounded-xl sm:py-3 sm:pl-8 sm:pr-4 sm:text-sm"
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
//                     Variable Fee
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="text"
//                       value={variableFee}
//                       onChange={(e) => setVariableFee(e.target.value)}
//                       className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
//                     />
//                     <span className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 text-[10px] sm:right-4 sm:text-sm">
//                       %
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <p className="text-gray-400 text-[9px] sm:text-[11px]">
//                 Base fee applies per redemption request. Variable fee applies to
//                 total weight value.
//               </p>
//             </div>
//           </div>
//         </section>

//         {/* Minting Charges */}
//         <section className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm">
//           <div className="flex flex-col justify-between gap-3 border-b border-stroke p-4 sm:flex-row sm:items-center sm:p-6">
//             <div>
//               <h2 className="text-base font-semibold sm:text-lg">
//                 Minting Charges
//               </h2>
//               <p className="text-gray-500 mt-1 text-xs sm:text-sm">
//                 Map SKUs to fabrication costs for physical redemption.
//               </p>
//             </div>
//             <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-100 sm:w-auto sm:px-4 sm:text-sm">
//               <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//               Add New SKU
//             </button>
//           </div>

//           {/* Mobile Card View */}
//           <div className="block divide-y divide-stroke sm:hidden">
//             {skus.map((sku) => (
//               <div key={sku.id} className="space-y-3 p-4">
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="bg-gray-100 text-gray-500 flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold uppercase">
//                       {sku.id.includes('BAR') ? 'Au' : '$'}
//                     </div>
//                     <div>
//                       <p className="text-gray-900 text-sm font-medium">
//                         {sku.name}
//                       </p>
//                       <p className="text-gray-400 font-mono text-[10px]">
//                         {sku.id}
//                       </p>
//                     </div>
//                   </div>
//                   <span
//                     className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${
//                       sku.status === 'Active'
//                         ? 'border border-green-100 bg-green-50 text-green-600'
//                         : 'bg-gray-100 text-gray-500 border-gray-200 border'
//                     }`}
//                   >
//                     {sku.status}
//                   </span>
//                 </div>

//                 <div className="grid grid-cols-2 gap-3 text-xs">
//                   <div>
//                     <p className="text-gray-400 mb-1 text-[9px]">Weight</p>
//                     <p className="text-gray-600">{sku.weight}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-400 mb-1 text-[9px]">Fab. Cost</p>
//                     <p className="text-gray-900 font-bold">{sku.fabCost}</p>
//                   </div>
//                 </div>

//                 <div className="flex justify-end">
//                   <button className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-orange-600 hover:text-orange-700">
//                     <Edit2 className="h-3 w-3" />
//                     Edit
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Desktop Table View */}
//           <div className="hidden overflow-x-auto sm:block">
//             <table className="w-full border-collapse text-left">
//               <thead>
//                 <tr className="bg-gray-50/50 border-b border-stroke">
//                   <th className="text-gray-400 px-4 py-4 text-[10px] font-bold uppercase tracking-wider xl:px-6 xl:text-[11px]">
//                     SKU ID
//                   </th>
//                   <th className="text-gray-400 px-4 py-4 text-[10px] font-bold uppercase tracking-wider xl:px-6 xl:text-[11px]">
//                     Product Name
//                   </th>
//                   <th className="text-gray-400 px-4 py-4 text-[10px] font-bold uppercase tracking-wider xl:px-6 xl:text-[11px]">
//                     Weight
//                   </th>
//                   <th className="text-gray-400 px-4 py-4 text-[10px] font-bold uppercase tracking-wider xl:px-6 xl:text-[11px]">
//                     Fab. Cost
//                   </th>
//                   <th className="text-gray-400 px-4 py-4 text-[10px] font-bold uppercase tracking-wider xl:px-6 xl:text-[11px]">
//                     Status
//                   </th>
//                   <th className="text-gray-400 px-4 py-4 text-[10px] font-bold uppercase tracking-wider xl:px-6 xl:text-[11px]"></th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-stroke">
//                 {skus.map((sku) => (
//                   <tr
//                     key={sku.id}
//                     className="hover:bg-gray-50/50 transition-colors"
//                   >
//                     <td className="text-gray-900 px-4 py-4 text-xs font-medium xl:px-6 xl:text-sm">
//                       {sku.id}
//                     </td>
//                     <td className="px-4 py-4 xl:px-6">
//                       <div className="flex items-center gap-3">
//                         <div className="bg-gray-100 text-gray-500 flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold uppercase">
//                           {sku.id.includes('BAR') ? 'Au' : '$'}
//                         </div>
//                         <span className="text-gray-600 text-xs xl:text-sm">
//                           {sku.name}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="text-gray-500 px-4 py-4 text-xs xl:px-6 xl:text-sm">
//                       {sku.weight}
//                     </td>
//                     <td className="text-gray-900 px-4 py-4 text-xs font-bold xl:px-6 xl:text-sm">
//                       {sku.fabCost}
//                     </td>
//                     <td className="px-4 py-4 xl:px-6">
//                       <span
//                         className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider xl:text-[10px] ${
//                           sku.status === 'Active'
//                             ? 'border border-green-100 bg-green-50 text-green-600'
//                             : 'bg-gray-100 text-gray-500 border-gray-200 border'
//                         }`}
//                       >
//                         {sku.status}
//                       </span>
//                     </td>
//                     <td className="px-4 py-4 text-right xl:px-6">
//                       <button className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-orange-600 hover:text-orange-700">
//                         <Edit2 className="h-3 w-3" />
//                         Edit
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           <div className="text-gray-400 flex flex-col items-center justify-between gap-3 border-t border-stroke p-4 text-xs sm:flex-row">
//             <span>Showing 3 of 12 SKUs</span>
//             <div className="flex items-center gap-2">
//               <button
//                 className="hover:bg-gray-100 rounded p-1 transition-colors disabled:opacity-30"
//                 disabled
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </button>
//               <span className="text-gray-600 text-xs font-medium">1 / 4</span>
//               <button className="hover:bg-gray-100 rounded p-1 transition-colors">
//                 <ChevronRight className="h-4 w-4" />
//               </button>
//             </div>
//           </div>
//         </section>

//         {/* Withdrawal Fees */}
//         <section className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm">
//           <div className="flex flex-col gap-3 border-b border-stroke p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
//             <div>
//               <h2 className="text-base font-semibold sm:text-lg">
//                 Withdrawal Fees
//               </h2>
//               <p className="text-gray-500 mt-1 text-xs sm:text-sm">
//                 Configure charges for fiat withdrawals.
//               </p>
//             </div>
//             <div className="bg-gray-50 self-start rounded-lg p-2">
//               <Wallet className="text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
//             </div>
//           </div>
//           <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6 lg:gap-8">
//             <div className="space-y-2">
//               <label className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
//                 Flat Withdrawal Fee
//               </label>
//               <div className="relative">
//                 <span className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-[10px] sm:left-4 sm:text-sm">
//                   $
//                 </span>
//                 <input
//                   type="text"
//                   value={flatWithdrawalFee}
//                   onChange={(e) => setFlatWithdrawalFee(e.target.value)}
//                   className="w-full rounded-lg border border-stroke bg-white py-2 pl-6 pr-3 text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:rounded-xl sm:py-3 sm:pl-8 sm:pr-4 sm:text-sm"
//                 />
//               </div>
//               <p className="text-gray-400 text-[9px] sm:text-[11px]">
//                 This flat fee applies to all outgoing cash transfers.
//               </p>
//             </div>
//             <div className="space-y-2">
//               <label className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
//                 Percentage Withdrawal Fee
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={percentageWithdrawalFee}
//                   onChange={(e) => setPercentageWithdrawalFee(e.target.value)}
//                   className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
//                 />
//                 <span className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 text-[10px] sm:right-4 sm:text-sm">
//                   %
//                 </span>
//               </div>
//               <p className="text-gray-400 text-[9px] sm:text-[11px]">
//                 This percentage fee applies to all outgoing cash transfers.
//               </p>
//             </div>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {useState} from 'react';
import {
  Sliders,
  Truck,
  Database,
  Wallet,
  HelpCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  X,
} from 'lucide-react';
import {useGetComission, useSetComission} from '@/lib/react-query/commission';

interface SKU {
  id: string;
  name: string;
  weight: string;
  fabCost: string;
  status: 'Active' | 'Inactive';
}

export default function ReviewConfig() {
  const [makerFee, setMakerFee] = useState('0.15');
  const [takerFee, setTakerFee] = useState('0.25');
  const [annualStorageFee, setAnnualStorageFee] = useState('0.50');
  const [baseFee, setBaseFee] = useState('25.00');
  const [variableFee, setVariableFee] = useState('0.10');
  const [flatWithdrawalFee, setFlatWithdrawalFee] = useState('10.00');
  const [percentageWithdrawalFee, setPercentageWithdrawalFee] =
    useState('0.50');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const {data: commission} = useGetComission();
  const {mutateAsync: setCommission} = useSetComission();
  console.log('commisssionnn', commission);

  return (
    <div className="font-sans min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 border-b border-stroke bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-lg font-bold text-[#1A1A1A] sm:text-xl lg:text-2xl">
                Profile
              </h1>
            </div>

            {/* Desktop Actions */}
            {/* <div className="hidden items-center gap-3 sm:flex">
              <button className="text-gray-600 hover:bg-gray-50 rounded-lg border border-stroke px-4 py-2 text-sm font-medium transition-colors">
                Discard
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-[#F27D26] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#E06D1F]">
                <Database className="h-4 w-4" />
                Save Changes
              </button>
            </div> */}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="hover:bg-gray-50 self-end rounded-lg border border-stroke p-2 sm:hidden"
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Edit2 className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Actions */}
          {showMobileMenu && (
            <div className="mt-3 flex flex-col gap-2 border-t border-stroke pt-3 sm:hidden">
              <button className="text-gray-600 hover:bg-gray-50 w-full rounded-lg border border-stroke px-4 py-2.5 text-sm font-medium transition-colors">
                Discard Changes
              </button>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F27D26] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#E06D1F]">
                <Database className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Trading Fees */}
        <section className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-stroke p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                Set Commission
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6 lg:gap-8">
            <div className="space-y-2">
              <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                Commission
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={makerFee}
                  onChange={(e) => setMakerFee(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-white px-3 py-1.5 text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
