import EnterCurrentPin from '@/components/Profilehub/Pin/EnterCurrentPin';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/accounthub/enter-currentpin')({
  component: RouteComponent,
});

function RouteComponent() {
  return <EnterCurrentPin />;
}
