import StatementsScreen from '@/components/E-Private/StatementsScreen';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/eprivate/statement')({
  component: RouteComponent,
});

function RouteComponent() {
  return <StatementsScreen />;
}
