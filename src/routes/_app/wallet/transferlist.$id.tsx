import TransferDetailPage from '@/features/Dashboard/components/TransferDetailPage';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';
export const Route = createFileRoute('/_app/wallet/transferlist/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  return <TransferDetailPage />;
}
