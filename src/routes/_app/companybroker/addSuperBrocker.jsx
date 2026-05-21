import {createFileRoute} from '@tanstack/react-router';
import AddSuperBroker from '@/components/company/superBroker/AddSuperBroker';
import React from 'react';

export const Route = createFileRoute('/_app/companybroker/addSuperBrocker')({
  component: () => <AddSuperBroker />,
});
