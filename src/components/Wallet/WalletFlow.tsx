/*eslint-disable*/
import PinScreen from '@/components/Wallet/PinScreen';
import ProcessingScreen from '@/components/Wallet/ProcessingScreen';
import SuccessScreen from '@/components/Wallet/SuccessScreen';
import TopUpScreen from '@/components/Wallet/TopUpScreen';
import AdminApprovedScreen from '@/components/Wallet/AdminApprovedScreen';
import React, {useState} from 'react';
import {useTopupMutation} from './topupmutate';
import {useNavigate} from '@tanstack/react-router';

interface WalletFlowProps {
  onComplete?: (transactionData: TransactionData) => void;
}

export interface TransactionData {
  amount: string;
  accountType: 'private' | 'virtual';
  receipt?: File;
  timestamp: string;
  transactionId: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  pin: string;
}

const WalletFlow: React.FC<WalletFlowProps> = ({onComplete}) => {
  const [currentStep, setCurrentStep] = useState<
    'topup' | 'pin' | 'processing' | 'adminApproved' | 'success'
  >('topup');
  const [transactionData, setTransactionData] = useState<TransactionData>({
    amount: '',
    accountType: 'private',
    timestamp: '',
    transactionId: '',
    status: 'pending',
    pin: '',
  });
  const [isAdminApproved, setIsAdminApproved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmittingPin, setIsSubmittingPin] = useState(false); // Add this state

  const navigate = useNavigate();

  const {mutate: saveTransactionData, isPending: isSubmitting} =
    useTopupMutation();

  // Handle topup submission
  const handleTopUpSubmit = (
    amount: string,
    accountType: 'private' | 'virtual',
    receipt?: File,
  ) => {
    const transactionId =
      'TX' + Date.now() + Math.random().toString(36).substr(2, 9);

    setTransactionData((prev) => ({
      ...prev,
      amount,
      accountType,
      receipt,
      timestamp: new Date().toISOString(),
      transactionId,
      status: 'pending',
    }));

    setCurrentStep('pin');
  };

  // Handle PIN submission
  const handlePinSubmit = (pin: string) => {
    // Set submitting state to show loading in PIN screen
    setIsSubmittingPin(true);

    // Update transaction data
    setTransactionData((prev) => ({
      ...prev,
      pin,
      // Don't set status to processing yet
    }));

    // Format payload
    const cleanAmount = parseFloat(transactionData.amount.replace(/,/g, ''));

    const payload = {
      amount: cleanAmount,
      currency: 'INR',
      securityCode: pin,
      accountType:
        transactionData.accountType === 'private'
          ? 'E_PRIVATEACCOUNT'
          : 'E_TEMPORYACCOUNT',
    };

    console.log('Transaction Payload:', payload);

    // Submit to API FIRST, then handle response
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
            // Direct success
            setIsAdminApproved(true);
            setTransactionData((prev) => ({...prev, status: 'success'}));
            setCurrentStep('success');

            setTimeout(() => {
              navigate({to: '/dashboard'});
              onComplete?.({
                ...transactionData,
                status: 'success',
              });
            }, 2000);
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

              setTimeout(() => {
                navigate({to: '/dashboard'});
                onComplete?.({
                  ...transactionData,
                  status: 'success',
                });
              }, 2000);
            }, 5000);
          } else {
            // Rejected
            setErrorMessage(response.message || 'Transaction was rejected');
            setTransactionData((prev) => ({...prev, status: 'failed'}));
            setTimeout(() => navigate({to: '/dashboard'}), 3000);
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

  // Handle back navigation
  const handleBack = () => {
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
      case 'success':
        navigate({to: '/dashboard'});
        resetTransaction();
        break;
    }
  };

  const resetTransaction = () => {
    setTransactionData({
      amount: '',
      accountType: 'private',
      timestamp: '',
      transactionId: '',
      status: 'pending',
      pin: '',
    });
    setIsAdminApproved(false);
    setErrorMessage('');
    setIsSubmittingPin(false);
  };

  return (
    <div className="wallet-flow">
      {currentStep === 'topup' && (
        <TopUpScreen
          onContinue={(amount, accountType, receipt) =>
            handleTopUpSubmit(amount, accountType, receipt)
          }
          onBack={handleBack}
        />
      )}

      {currentStep === 'pin' && (
        <PinScreen
          onPinSubmit={handlePinSubmit}
          onBack={handleBack}
          transactionAmount={transactionData.amount}
          isSubmitting={isSubmittingPin} // Pass loading state to PIN screen
          errorMessage={errorMessage} // Pass error message to PIN screen
        />
      )}

      {currentStep === 'processing' && (
        <ProcessingScreen
          transactionData={transactionData}
          onBack={handleBack}
          isAdminApproved={isAdminApproved}
          errorMessage={errorMessage}
          isSubmitting={isSubmitting}
        />
      )}

      {currentStep === 'adminApproved' && (
        <AdminApprovedScreen
          transactionData={transactionData}
          onBack={handleBack}
          onContinue={() => {
            setCurrentStep('success');
            setTimeout(() => {
              navigate({to: '/dashboard'});
            }, 2000);
          }}
        />
      )}

      {currentStep === 'success' && (
        <SuccessScreen
          transactionData={transactionData}
          onBack={handleBack}
          onComplete={() => {
            navigate({to: '/dashboard'});
            resetTransaction();
          }}
        />
      )}
    </div>
  );
};

export default WalletFlow;
