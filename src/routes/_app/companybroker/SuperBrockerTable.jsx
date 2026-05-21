import {createFileRoute} from '@tanstack/react-router';
import SuperBrokerTable from '@/components/company/superBroker/SuperBrokerTable';
import React from 'react';

export const Route = createFileRoute('/_app/companybroker/SuperBrockerTable')({
  component: () => <SuperBrokerTable />,
});
