import React from 'react';
import TopUpScreen from './TopUpScreen';
import {useNavigate} from '@tanstack/react-router';

const WalletProcessPage = () => {
  return (
    <div className="font-inter">
      <TopUpScreen />
    </div>
  );
};

export default WalletProcessPage;
