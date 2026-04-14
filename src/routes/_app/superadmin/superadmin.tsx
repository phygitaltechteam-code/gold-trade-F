import SuperAdmin from '@/components/SuperAdmin';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/superadmin/superadmin')({
  component: () => <SuperAdmin />,
});
