import AddBroker from '@/components/company/AddBorker';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/superbroker/addbroker')({
  component: RouteComponent,
});

function RouteComponent() {
  return <AddBroker />;
}
