/* eslint-disable */
import PinScreen from '@/components/Wallet/PinScreen';
import ProcessingScreen from './ProcessingScreen';
import SuccessScreen from '@/components/Wallet/SuccessScreen';
import AdminApprovedScreen from '@/components/Wallet/AdminApprovedScreen';
import WithdrawScreen from './WithdrawScreen';
import React, {useState, useCallback, useEffect} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {useWithdrawMutation} from '../Wallet/topupmutate';
import toast from 'react-hot-toast';
import {useGetWalletByCustomer} from '@/lib/react-query/beneficiary';

// ---------- Types ----------
export interface PaymentData {
  amount: string;
  note?: string;
  receipt?: File;
}

export interface WalletAmount {
  E_PRIVATEACCOUNT: number;
  E_TEMPORYACCOUNT: number;
}

export interface TransactionData {
  amount: number; // clean number
  accountType: 'E_PRIVATEACCOUNT'; // always private
  receipt?: File;
  timestamp: string;
  transactionId: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  pin: string;
}

interface WalletFlowProps {
  onComplete?: (transactionData: TransactionData) => void;
}

const TopupWithdrawlFlow: React.FC<WalletFlowProps> = ({onComplete}) => {
  const navigate = useNavigate();

  // ---------- Step Management ----------
  const [currentStep, setCurrentStep] = useState<
    'topup' | 'pin' | 'processing' | 'adminApproved' | 'success'
  >('topup');

  const [accountType, setAccountType] = useState<
    'E_PRIVATEACCOUNT' | 'E_TEMPORYACCOUNT'
  >('E_PRIVATEACCOUNT');

  // ---------- Form State (TopUpScreen) ----------
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: '',
    note: '',
  });

  // ---------- Wallet Balances from API ----------
  const {data: WalletData} = useGetWalletByCustomer();
  const [walletAmmount, setWalletAmmount] = useState<WalletAmount>({
    E_PRIVATEACCOUNT: 0,
    E_TEMPORYACCOUNT: 0,
  });

  useEffect(() => {
    if (WalletData) {
      setWalletAmmount({
        E_PRIVATEACCOUNT: WalletData?.eprivateAccount ?? 0,
        E_TEMPORYACCOUNT: WalletData?.temporyAccount ?? 0,
      });
    }
  }, [WalletData]);

  // ---------- Transaction State (API) ----------
  const [transactionData, setTransactionData] = useState<TransactionData>({
    amount: 0,
    accountType: 'E_PRIVATEACCOUNT',
    timestamp: '',
    transactionId: '',
    status: 'pending',
    pin: '',
  });

  const [isAdminApproved, setIsAdminApproved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {mutate: saveTransactionData, isPending: isSubmitting} =
    useWithdrawMutation();

  // ---------- Step Navigation ----------
  const nextStep = useCallback(() => {
    if (currentStep === 'topup') {
      const rawAmount = paymentData.amount.replace(/,/g, '');
      const numericAmount = parseFloat(rawAmount);
      const privateBalance = walletAmmount.E_PRIVATEACCOUNT;

      if (!paymentData.amount || numericAmount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      if (numericAmount > privateBalance) {
        toast.error('Insufficient balance');
        return;
      }

      setCurrentStep('pin');
    }
  }, [currentStep, paymentData, walletAmmount]);

  const prevStep = useCallback(() => {
    switch (currentStep) {
      case 'pin':
        setCurrentStep('topup');
        break;
      case 'processing':
        setCurrentStep('pin');
        break;
      case 'adminApproved':
        setCurrentStep('processing');
        break;
      default:
        setCurrentStep('topup');
    }
  }, [currentStep]);

  // ---------- Handle PIN Submission ----------
  const handlePinSubmit = (pin: string) => {
    const cleanAmount = parseFloat(paymentData.amount.replace(/,/g, ''));
    const transactionId =
      'TX' + Date.now() + Math.random().toString(36).substr(2, 9);

    setTransactionData({
      amount: cleanAmount,
      accountType: 'E_PRIVATEACCOUNT',
      receipt: paymentData.receipt,
      timestamp: new Date().toISOString(),
      transactionId,
      status: 'processing',
      pin,
    });

    // Payload for API – always private account
    const payload = {
      amount: cleanAmount,
      currency: 'INR',
      securityCode: pin,
      accountType: accountType,
    };

    setCurrentStep('processing');
    submitTransaction(payload);
  };

  // ---------- API Submission ----------
  const submitTransaction = async (payload: any) => {
    try {
      setErrorMessage('');

      saveTransactionData(payload, {
        onSuccess: (response) => {
          console.log('API Response:', response);

          if (response.statusCode === 200 || response.status === true) {
            setIsAdminApproved(true);
            setTransactionData((prev) => ({...prev, status: 'success'}));
            setCurrentStep('success');
          } else if (
            response.status === 'pending' ||
            response.data?.isPending
          ) {
            // Needs admin approval
            setTransactionData((prev) => ({...prev, status: 'pending'}));
            setCurrentStep('adminApproved');

            // Simulate admin approval after 5 seconds (replace with real logic)
            setTimeout(() => {
              setIsAdminApproved(true);
              setTransactionData((prev) => ({...prev, status: 'success'}));
              setCurrentStep('success');
            });
          } else {
            // Rejected
            setErrorMessage(response.message || 'Transaction was rejected');
            setTransactionData((prev) => ({...prev, status: 'failed'}));
            // setTimeout(() => navigate({to: '/dashboard'}), 3000);
          }
        },
        onError: (error: any) => {
          console.error('Submission error:', error);
          const errorMsg =
            error?.response?.data?.message ||
            error?.message ||
            'Transaction failed';

          if (/pin|security|password|invalid/i.test(errorMsg)) {
            setErrorMessage('Invalid PIN. Please try again.');
            setCurrentStep('pin');
          } else {
            setErrorMessage(errorMsg);
            setTimeout(() => navigate({to: '/dashboard'}), 3000);
          }
          setTransactionData((prev) => ({...prev, status: 'failed'}));
        },
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      setErrorMessage('An unexpected error occurred');
      setTimeout(() => navigate({to: '/dashboard'}), 3000);
      setTransactionData((prev) => ({...prev, status: 'failed'}));
    }
  };

  // ---------- Reset flow ----------
  const resetTransaction = () => {
    setTransactionData({
      amount: 0,
      accountType: 'E_PRIVATEACCOUNT',
      timestamp: '',
      transactionId: '',
      status: 'pending',
      pin: '',
    });
    setPaymentData({amount: '', note: ''});
    setIsAdminApproved(false);
    setErrorMessage('');
    setCurrentStep('topup');
  };

  // ---------- Render Steps ----------
  return (
    <div className="wallet-flow">
      {currentStep === 'topup' && (
        <WithdrawScreen
          paymentData={paymentData}
          setPaymentData={setPaymentData}
          nextStep={nextStep}
          prevStep={() => navigate({to: '/dashboard'})}
          walletAmmount={walletAmmount}
          accountType={accountType}
          setAccountType={setAccountType}
        />
      )}
      {currentStep === 'pin' && (
        <PinScreen
          onPinSubmit={handlePinSubmit}
          onBack={prevStep}
          transactionAmount={paymentData.amount}
        />
      )}
      {currentStep === 'processing' && (
        <ProcessingScreen
          transactionData={transactionData}
          onBack={prevStep}
          isAdminApproved={isAdminApproved}
          errorMessage={errorMessage}
          isSubmitting={isSubmitting}
        />
      )}
      {currentStep === 'adminApproved' && (
        <AdminApprovedScreen
          transactionData={transactionData}
          onBack={prevStep}
          onContinue={() => {
            setCurrentStep('success');
            setTimeout(() => navigate({to: '/dashboard'}), 2000);
          }}
        />
      )}
      {currentStep === 'success' && (
        <SuccessScreen
          transactionData={transactionData}
          onBack={() => navigate({to: '/dashboard'})}
        />
      )}
    </div>
  );
};

export default TopupWithdrawlFlow;
