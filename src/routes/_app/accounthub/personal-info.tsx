import EditPersonalInfo from '@/components/Profilehub/EditPersonalInfo';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/accounthub/personal-info')({
  component: RouteComponent,
});

function RouteComponent() {
  return <EditPersonalInfo />;
}
