import {createFileRoute} from '@tanstack/react-router';
import PendingBrokerByid from '@/pages/PendingBrokerByid';
import React from 'react';

export const Route = createFileRoute('/_app/companybroker/pendingbrokerby/$id')(
  {
    component: () => <PendingBrokerByid />,
  },
);
