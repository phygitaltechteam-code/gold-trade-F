/*eslint-disable*/

import {useNavigate} from '@tanstack/react-router';
import React, {useState} from 'react';
import {
  MdArrowBack,
  MdAccountBalance,
  MdExpandMore,
  MdLock,
  MdSend,
  MdFace,
} from 'react-icons/md';
import {
  PaymentData,
  SetPaymentData,
  SetSelectedWalletType,
  StepProps,
  walletAmmount,
} from '../Pages/PaymentWrapper';
import {
  useGetBeneficiary,
  useGetBeneficiaryById,
} from '@/lib/react-query/beneficiary';
import {Route} from '@/routes/_app/payment/send.$id';
import toast from 'react-hot-toast';

export type WalletType = 'E_PRIVATEACCOUNT' | 'E_TEMPORYACCOUNT';

type props = StepProps & {
  paymentData: PaymentData;
  setPaymentData: SetPaymentData;
  walletAmmount: walletAmmount;
  setSelectedWalletType: SetSelectedWalletType;
  selectedWalletType: WalletType;
};
const TransferReviewScreen: React.FC<props> = ({
  nextStep,
  paymentData,
  setPaymentData,
  walletAmmount,
  prevStep,
  selectedWalletType,
  setSelectedWalletType,
}) => {
  const {data: benefiaciaryDetails} = useGetBeneficiaryById(
    paymentData?.beneficiaryId,
  );
  const {data: allBeneficiary} = useGetBeneficiary();
  const [openModal, setOpenModal] = useState(false);
  console.log('benefeciary det', benefiaciaryDetails);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const selectedWalletBalance = walletAmmount?.[selectedWalletType] ?? 0;
  const enteredAmount = Number(paymentData.amount || 0);
  const isInsufficientBalance = enteredAmount > selectedWalletBalance;
  const walletLabelMap: Record<WalletType, string> = {
    E_PRIVATEACCOUNT: 'E Private Account',
    E_TEMPORYACCOUNT: 'E Temporary Account',
  };
  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="bg-background-light font-sans flex min-h-screen justify-center text-slate-900">
      <div className="bg-background-light relative min-h-screen w-full max-w-md shadow-2xl">
        <div className="relative flex min-h-screen flex-col">
          <header className="bg-background-light/80 sticky top-0 z-50 border-b border-slate-200/50 backdrop-blur-md">
            <div className="flex h-14 items-center justify-between px-4">
              <button
                type="button"
                className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-100"
                aria-label="Go back"
                onClick={prevStep}
              >
                <MdArrowBack size={24} />
              </button>
              <h1 className="flex-1 pr-8 text-center text-base font-bold tracking-tight">
                Review Transfer
              </h1>
            </div>
          </header>

          <main className="relative z-10 flex w-full flex-1 flex-col p-4">
            <div className="flex flex-col items-center justify-center pb-8 pt-6">
              <span className="mb-1 text-sm font-medium text-slate-500">
                Total Amount
              </span>
              <div className="relative">
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
                  {paymentData?.amount}
                </h2>
              </div>
            </div>

            {/* Details Card */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
              {/* TO Section */}
              <div className="group cursor-pointer border-b border-slate-100 p-4 transition-colors hover:bg-slate-50">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    To
                  </span>
                  <button
                    className="rounded px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                    onClick={() => setOpenModal(true)}
                  >
                    Edit
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  {benefiaciaryDetails?.photo ? (
                    <div
                      className="h-12 w-12 flex-shrink-0 rounded-full border border-slate-200 bg-slate-100 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${benefiaciaryDetails?.photo})`,
                      }}
                      aria-label={`Profile picture of ${benefiaciaryDetails?.fullName}`}
                    />
                  ) : (
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                        {getInitials(benefiaciaryDetails?.fullName)}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col">
                    <p className="text-base font-semibold text-slate-900">
                      {benefiaciaryDetails?.fullName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {benefiaciaryDetails?.accountNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative cursor-pointer border-b border-slate-100 p-4 transition-colors hover:bg-slate-50">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    From
                  </span>
                  <button
                    className="rounded px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                    onClick={() => setShowWalletDropdown((prev) => !prev)}
                  >
                    Change
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600">
                    <MdAccountBalance size={24} />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-0.5">
                      <p className="text-base font-semibold text-slate-900">
                        {walletLabelMap[selectedWalletType]}
                      </p>
                    </div>

                    <p className="text-sm text-slate-500">
                      Balance: ${walletAmmount[selectedWalletType]}
                    </p>
                  </div>
                </div>

                {/* Dropdown (design-safe overlay) */}
                {showWalletDropdown && (
                  <div className="absolute left-4 right-4 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    {(Object.keys(walletAmmount) as WalletType[]).map(
                      (wallet) => (
                        <div
                          key={wallet}
                          className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm hover:bg-slate-50"
                          onClick={() => {
                            setSelectedWalletType(wallet);
                            setShowWalletDropdown(false);
                          }}
                        >
                          <span className="font-medium text-slate-900">
                            {walletLabelMap[wallet]}
                          </span>
                          <span className="text-slate-500">
                            ${walletAmmount[wallet]}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* Transaction Details */}
              <div className="space-y-3 bg-slate-50/50 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium text-slate-900">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Reference Note</span>
                  <span className="font-medium text-slate-900">
                    {paymentData?.note}
                  </span>
                </div>

                <div className="my-2 h-px w-full bg-slate-200"></div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-slate-900">Total Debit</span>
                  <span className="text-lg font-bold text-slate-900">
                    {paymentData?.amount}
                  </span>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-background-light/90 z-40 border-t border-slate-200 p-4 backdrop-blur-xl">
            <div className="mx-auto flex max-w-md flex-col gap-4">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <MdLock size={14} className="text-slate-500" />
                <span>Protected by 256-bit bank-grade encryption</span>
              </div>

              <button
                className="group relative flex h-14 w-full transform items-center justify-center rounded-xl bg-primary font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/50 active:scale-[0.98] active:bg-primary/75"
                onClick={() => {
                  if (isInsufficientBalance || enteredAmount <= 0) {
                    toast.error('Insufficient wallet balance');
                    return;
                  }

                  nextStep();
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">Confirm & Send</span>
                  <MdSend
                    size={20}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </div>
                <div className="absolute right-4 opacity-70">
                  <MdFace size={24} />
                </div>
              </button>
            </div>
          </footer>
        </div>
      </div>

      {openModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-[80vh] max-w-md rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stroke bg-primary/10 p-4">
              <h2 className="text-lg font-semibold">Select Beneficiary</h2>
              <button
                className="text-sm text-primary"
                onClick={() => setOpenModal(false)}
              >
                Close
              </button>
            </div>

            {/* Beneficiary List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {allBeneficiary?.map((b: any) => (
                <div
                  key={b.id}
                  className="flex cursor-pointer items-center gap-4 border-b border-stroke p-4 hover:bg-slate-50"
                  onClick={() => {
                    if (b?.isVerified === true) {
                      setPaymentData((prev) => ({
                        ...prev,
                        beneficiaryId: b?.id,
                      }));
                      setOpenModal(false);
                    } else {
                      toast.error('Beneficiary Under Review');
                    }
                  }}
                >
                  <div
                    className="h-10 w-10 rounded-full bg-slate-200 bg-cover bg-center"
                    style={{backgroundImage: b?.photo}}
                  />
                  <div>
                    <p className="font-medium text-slate-900">{b?.fullName}</p>
                    <p className="text-sm text-slate-500">{b?.accountNumber}</p>
                  </div>
                </div>
              ))}

              {!allBeneficiary?.length && (
                <p className="p-4 text-center text-sm text-slate-500">
                  No beneficiaries found
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferReviewScreen;
