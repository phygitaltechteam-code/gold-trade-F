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

  // Submit transaction to API
  const submitTransaction = async (payload: any) => {
    try {
      setErrorMessage('');

      saveTransactionData(payload, {
        onSuccess: (response) => {
          console.log('API Response:', response);
          
          // Reset submitting state
          setIsSubmittingPin(false);

          // Check API response structure
          if (response.statusCode === 200 || response.status === true) {
            // Direct approval - go to processing then success
            setTransactionData((prev) => ({
              ...prev,
              status: 'processing',
            }));
            
            // Now show processing screen
            setCurrentStep('processing');
            
            setIsAdminApproved(true);
            
            // Simulate processing time then show success
            setTimeout(() => {
              setTransactionData((prev) => ({
                ...prev,
                status: 'success',
              }));
              setCurrentStep('success');
              
              // Redirect to dashboard after success screen
              setTimeout(() => {
                navigate({to: '/dashboard'});
                
                if (onComplete) {
                  onComplete({
                    ...transactionData,
                    status: 'success',
                  });
                }
              }, 2000);
            }, 2000);
            
          } else if (
            response.status === 'pending' ||
            response.data?.isPending
          ) {
            // Needs admin approval
            setTransactionData((prev) => ({
              ...prev,
              status: 'pending',
            }));
            
            // Go to processing screen first
            setCurrentStep('processing');
            
            // Then after a short delay, show admin approval screen
            setTimeout(() => {
              setCurrentStep('adminApproved');
              
              // After admin approval, show success and redirect
              setTimeout(() => {
                setIsAdminApproved(true);
                setTransactionData((prev) => ({
                  ...prev,
                  status: 'success',
                }));
                setCurrentStep('success');
                
                // Redirect to dashboard after success screen
                setTimeout(() => {
                  navigate({to: '/dashboard'});
                  
                  if (onComplete) {
                    onComplete({
                      ...transactionData,
                      status: 'success',
                    });
                  }
                }, 2000);
              }, 5000);
            }, 1000);
            
          } else {
            // Rejected or failed
            setIsSubmittingPin(false);
            setErrorMessage(response.message || 'Transaction was rejected');
            setTransactionData((prev) => ({
              ...prev,
              status: 'failed',
            }));

            // Show error on PIN screen and stay there
            // The error will be passed back to PinScreen component
            
            // Optionally, show error message and stay on PIN screen
            // You might want to add a prop to PinScreen to display this error
          }
        },
        onError: (error: any) => {
          console.error('Transaction submission failed:', error);
          
          // Reset submitting state
          setIsSubmittingPin(false);

          // Check if it's a PIN error
          const errorMsg =
            error?.response?.data?.message ||
            error?.message ||
            'Transaction failed. Please try again.';

          if (
            errorMsg.toLowerCase().includes('pin') ||
            errorMsg.toLowerCase().includes('security') ||
            errorMsg.toLowerCase().includes('password') ||
            errorMsg.toLowerCase().includes('invalid')
          ) {
            setErrorMessage('Invalid PIN. Please try again.');
            // Stay on PIN screen - don't change currentStep
            // The error message will be displayed on the PIN screen
          } else {
            setErrorMessage(errorMsg);
            // For other errors, maybe show error and redirect
            setTimeout(() => {
              navigate({to: '/dashboard'});
            }, 3000);
          }

          setTransactionData((prev) => ({
            ...prev,
            status: 'failed',
          }));
        },
      });
    } catch (error) {
      console.error('Transaction submission failed:', error);
      setIsSubmittingPin(false);
      setErrorMessage('An unexpected error occurred. Please try again.');

      setTransactionData((prev) => ({
        ...prev,
        status: 'failed',
      }));

      // Stay on PIN screen
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