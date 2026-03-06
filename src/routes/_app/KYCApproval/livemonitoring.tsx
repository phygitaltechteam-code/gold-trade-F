import LiveMonitoring from '@/components/live-monitoring/LiveMonitoring';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/KYCApproval/livemonitoring')({
  component: () => <LiveMonitoring />,
});
