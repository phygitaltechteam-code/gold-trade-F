import MainCustomerPage from '@/components/Broker/Customer/MainCustomerPage';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/broker/customer/customerdisplay')({
  component: () => <MainCustomerPage />,
});
