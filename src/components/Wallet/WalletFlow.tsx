/*eslint-disable*/
import PinScreen from '@/components/Wallet/PinScreen';
import ProcessingScreen from '@/components/Wallet/ProcessingScreen';
import SuccessScreen from '@/components/Wallet/SuccessScreen';
import TopUpScreen from '@/components/Wallet/TopUpScreen';
import AdminApprovedScreen from '@/components/Wallet/AdminApprovedScreen';
import React, {useState} from 'react';
import {useTopupMutation} from './topupmutate';

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
    // Update transaction data
    setTransactionData((prev) => ({
      ...prev,
      pin,
      status: 'processing',
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
          : 'VIRTUAL_ACCOUNT',
    };

    console.log('Transaction Payload:', payload);

    // Go to processing screen
    setCurrentStep('processing');

    // Submit to API
    submitTransaction(payload);
  };

  // Submit transaction to API
  const submitTransaction = async (payload: any) => {
    try {
      setErrorMessage('');

      saveTransactionData(payload, {
        onSuccess: (response) => {
          console.log('API Response:', response);

          if (response.success) {
            // Check the status from API
            if (response.status === 'approved') {
              // Direct approval - go to success
              setIsAdminApproved(true);
              setTransactionData((prev) => ({
                ...prev,
                status: 'success',
              }));
              setCurrentStep('success');

              if (onComplete) {
                onComplete({
                  ...transactionData,
                  status: 'success',
                });
              }
            } else if (response.status === 'pending') {
              // Needs admin approval
              setTransactionData((prev) => ({
                ...prev,
                status: 'pending',
              }));
              // Simulate admin approval after 5 seconds
              setTimeout(() => {
                setIsAdminApproved(true);
                setTransactionData((prev) => ({
                  ...prev,
                  status: 'success',
                }));
                // Show admin approved screen first
                setCurrentStep('adminApproved');
              }, 5000);
            } else {
              // Rejected
              setErrorMessage(response.message || 'Transaction was rejected');
              setTransactionData((prev) => ({
                ...prev,
                status: 'failed',
              }));
            }
          } else {
            // API returned success: false
            setErrorMessage(response.message || 'Transaction failed');
            setTransactionData((prev) => ({
              ...prev,
              status: 'failed',
            }));
          }
        },
        onError: (error: any) => {
          console.error('Transaction submission failed:', error);

          // Check if it's a PIN error
          const errorMsg =
            error.message || 'Transaction failed. Please try again.';

          if (
            errorMsg.toLowerCase().includes('pin') ||
            errorMsg.toLowerCase().includes('security') ||
            errorMsg.toLowerCase().includes('password') ||
            errorMsg.toLowerCase().includes('invalid')
          ) {
            setErrorMessage('Invalid PIN. Please try again.');
          } else {
            setErrorMessage(errorMsg);
          }

          setTransactionData((prev) => ({
            ...prev,
            status: 'failed',
          }));
        },
      });
    } catch (error) {
      console.error('Transaction submission failed:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');

      setTransactionData((prev) => ({
        ...prev,
        status: 'failed',
      }));
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
        setCurrentStep('topup');
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
          }}
        />
      )}

      {currentStep === 'success' && (
        <SuccessScreen
          transactionData={transactionData}
          onBack={handleBack}
          onComplete={() => {
            setCurrentStep('topup');
            resetTransaction();
          }}
        />
      )}
    </div>
  );
};

export default WalletFlow;
