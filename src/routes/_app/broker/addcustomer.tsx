import AddCustomer from '@/components/Broker/AddCustomer';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/broker/addcustomer')({
  component: RouteComponent,
});

function RouteComponent() {
  return <AddCustomer />;
}
