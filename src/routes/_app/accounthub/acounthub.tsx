import AccountHub from '@/components/Profilehub/AccountHub';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/accounthub/acounthub')({
  component: RouteComponent,
});

function RouteComponent() {
  return <AccountHub />;
}
