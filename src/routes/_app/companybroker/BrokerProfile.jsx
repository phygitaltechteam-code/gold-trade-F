import {createFileRoute} from '@tanstack/react-router';
import BrokerProfile from '@/components/company/BrokerProfile';
import React from 'react';

export const Route = createFileRoute('/_app/companybroker/BrokerProfile')({
  component: () => <BrokerProfile />,
});
