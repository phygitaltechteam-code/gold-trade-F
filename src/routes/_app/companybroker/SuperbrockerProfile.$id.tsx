import SuperBrokerProfile from '@/components/company/superBroker/SuperBrokerProfile';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute(
  '/_app/companybroker/SuperbrockerProfile/$id',
)({
  component: () => <SuperBrokerProfile />,
});
