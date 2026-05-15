import PendingApprovals from '@/pages/PendingApprovals';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/Approval/pendingapprovals')({
  component: () => <PendingApprovals />,
});
