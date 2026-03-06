import Dashboard from '@/components/Dashboard/Dashboard';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Dashboard />;
}
