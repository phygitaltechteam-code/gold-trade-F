/*eslint-disable*/

import React, {useEffect, useState} from 'react';
import PaymentSend from './SendPayment';
import {
  useGetWalletByCustomer,
  usePayment,
} from '@/lib/react-query/beneficiary';
import {Route} from '@/routes/_app/payment/send.$id';
import TransferReviewScreen from '../Components/TransactionReview';
import SecurityPinPage from '../Components/SecurityPinPage';
import {TransferStatusScreen} from '../Components/TransactionStatus';
import TransactionSuccess from '../Components/TransactionSucces';
import {useNavigate} from '@tanstack/react-router';

export type PaymentData = {
  amount: string;
  note: string;
  sender: string;
  proof?: File;
  receiver: string;
  pin: string;
  beneficiaryId: string;
};

export type SetPaymentData = React.Dispatch<React.SetStateAction<PaymentData>>;

export type SetSelectedWalletType = React.Dispatch<
  React.SetStateAction<string>
>;
export type walletAmmount = {
  E_TEMPORYACCOUNT: number;
  E_PRIVATEACCOUNT: number;
};

export type StepProps = {
  nextStep: () => void;
  prevStep?: () => void;
};

export type WalletType = 'E_PRIVATEACCOUNT' | 'E_TEMPORYACCOUNT';
const PaymentWrapper: React.FC = () => {
  const {id: beneficiaryId} = Route.useParams();
  console.log('beneficiaryId', beneficiaryId);
  const {data: WalletData} = useGetWalletByCustomer();
  const {mutateAsync: Payment} = usePayment();
  const [selectedWalletType, setSelectedWalletType] = useState<WalletType>('');
  const navigate = useNavigate();

  console.log('walllet data', WalletData);
  const [step, setStep] = useState(1);
  const [walletAmmount, setWalletAmmount] = useState({
    E_TEMPORYACCOUNT: 0,
    E_PRIVATEACCOUNT: 0,
  });
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: '',
    note: '',
    sender: '',
    receiver: '',
    pin: '',
    beneficiaryId: beneficiaryId,
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  useEffect(() => {
    if (WalletData) {
      const amounts = {
        E_PRIVATEACCOUNT: WalletData?.eprivateAccount,
        E_TEMPORYACCOUNT: WalletData?.temporyAccount,
      };

      setWalletAmmount(amounts);
      if (amounts.E_PRIVATEACCOUNT > 0) {
        setSelectedWalletType('E_PRIVATEACCOUNT');
      } else if (amounts.E_TEMPORYACCOUNT > 0) {
        setSelectedWalletType('E_TEMPORYACCOUNT');
      }
    }
  }, [WalletData]);

  // useEffect(() => {
  //   if (step === 4) {
  //     const timer = setTimeout(() => {
  //       navigate({to: '/dashboard'});
  //     }, 1000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [step, navigate]);

  const handlePinSubmit = async (pin: string) => {
    try {
      await Payment({
        accountType: selectedWalletType,
        amount: Number(paymentData?.amount),
        beneficiaryId: beneficiaryId,
        currency: 'USD',
        securityCode: pin,
        ...(paymentData.proof ? {proof: paymentData.proof} : {}),
      });
    } catch (error) {
      // VERY IMPORTANT → rethrow
      throw error;
    }
  };

  return (
    <>
      {step === 1 && (
        <PaymentSend
          paymentData={paymentData}
          setPaymentData={setPaymentData}
          nextStep={nextStep}
          prevStep={prevStep}
          walletAmmount={walletAmmount}
          selectedWalletType={selectedWalletType}
          setSelectedWalletType={setSelectedWalletType}
        />
      )}

      {step === 2 && (
        <TransferReviewScreen
          paymentData={paymentData}
          nextStep={nextStep}
          prevStep={prevStep}
          setPaymentData={setPaymentData}
          walletAmmount={walletAmmount}
          selectedWalletType={selectedWalletType}
          setSelectedWalletType={setSelectedWalletType}
        />
      )}

      {step === 3 && (
        <SecurityPinPage
          paymentData={paymentData}
          setPaymentData={setPaymentData}
          nextStep={nextStep}
          prevStep={prevStep}
          walletAmmount={walletAmmount}
          onPinSubmit={handlePinSubmit}
        />
      )}

      {step === 4 && (
        <TransferStatusScreen
          paymentData={paymentData}
          setPaymentData={setPaymentData}
          nextStep={nextStep}
          walletAmmount={walletAmmount}
        />
      )}

      {/* {step === 5 && (
        <TransactionSuccess
          paymentData={paymentData}
          setPaymentData={setPaymentData}
          nextStep={nextStep}
          walletAmmount={walletAmmount}
        />
      )} */}
    </>
  );
};

export default PaymentWrapper;
