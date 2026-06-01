/*eslint-disable*/
import SuperBrokerTransactionLedger from '@/pages/SuperBrokerTransaction';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/superbrokertransaction')({
  component: () => <SuperBrokerTransactionLedger />,
});
