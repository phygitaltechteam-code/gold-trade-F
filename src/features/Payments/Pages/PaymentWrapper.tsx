import React, {useEffect, useState} from 'react';
import PaymentSend from './SendPayment';
import {useGetWalletByCustomer} from '@/lib/react-query/beneficiary';
import {Route} from '@/routes/_app/payment/send.$id';
import TransferReviewScreen from '../Components/TransactionReview';
import SecurityPinPage from '../Components/SecurityPinPage';
import {TransferStatusScreen} from '../Components/TransactionStatus';
import TransactionSuccess from '../Components/TransactionSucces';

export type PaymentData = {
  amount: string;
  note: string;
  sender: string;
  receiver: string;
  pin: string;
  customerId: string;
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

const PaymentWrapper: React.FC = () => {
  const {id: customerId} = Route.useParams();
  const {data: WalletData} = useGetWalletByCustomer();
  const [selectedWalletType, setSelectedWalletType] = useState('');

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
    customerId: customerId,
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

      // set default wallet type
      if (amounts.E_PRIVATEACCOUNT > 0) {
        setSelectedWalletType('E_PRIVATEACCOUNT');
      } else if (amounts.E_TEMPORYACCOUNT > 0) {
        setSelectedWalletType('E_TEMPORYACCOUNT');
      }
    }
  }, [WalletData]);

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
        />
      )}

      {step === 3 && (
        <SecurityPinPage
          paymentData={paymentData}
          setPaymentData={setPaymentData}
          nextStep={nextStep}
          walletAmmount={walletAmmount}
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

      {step === 5 && (
        <TransactionSuccess
          paymentData={paymentData}
          setPaymentData={setPaymentData}
          nextStep={nextStep}
          walletAmmount={walletAmmount}
        />
      )}
    </>
  );
};

export default PaymentWrapper;
