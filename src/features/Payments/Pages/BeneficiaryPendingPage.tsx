import React from 'react';
import StatusScreen from '../Components/PendingScreen';

const BeneficiaryPendingPage: React.FC = () => {
  return (
    <div className="bg-gray-100 flex min-h-screen w-full justify-center">
      {/* Mobile Container Simulator */}
      <div className="relative flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl">
        {/* Decorative Background Elements */}
        <div className="bg-grid pointer-events-none absolute inset-0 z-0 opacity-60"></div>
        <div className="pointer-events-none absolute -right-20 -top-20 z-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="bg-navy/5 pointer-events-none absolute -left-20 top-1/3 z-0 h-60 w-60 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-1 flex-col">
          <StatusScreen />
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryPendingPage;
