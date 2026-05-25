import DisplayScripts from '@/components/company/scripts';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/scrpitsManagement')({
  component: () => <DisplayScripts />,
});
