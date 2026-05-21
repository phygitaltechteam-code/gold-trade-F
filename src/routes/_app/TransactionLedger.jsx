import {createFileRoute} from '@tanstack/react-router';
import TransactionLedger from '../../pages/TransactionLedger';
import React from 'react';

export const Route = createFileRoute('/_app/TransactionLedger')({
  component: () => <TransactionLedger />,
});
