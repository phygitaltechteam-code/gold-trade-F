import FinancialReport from '@/components/FinancailReport/FinancialReport';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/Report/financialReport')({
  component: () => <FinancialReport />,
});
