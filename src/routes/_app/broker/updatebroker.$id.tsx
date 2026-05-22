import {createFileRoute} from '@tanstack/react-router';
import UpdateBroker from '@/components/Broker/Addbroker/UpdateBroker';
import React from 'react';

export const Route = createFileRoute('/_app/broker/updatebroker/$id')({
  component: () => <UpdateBroker />,
});
