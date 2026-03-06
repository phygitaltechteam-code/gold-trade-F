import {createFileRoute} from '@tanstack/react-router';
import WithdrawlRequest from '@/components/withdrawl-Req/WithdrawlRequest';
import React from 'react';

export const Route = createFileRoute('/_app/withdrawlreq/withdrawlRequest')({
  component: () => <WithdrawlRequest />,
});
