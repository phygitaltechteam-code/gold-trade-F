/*eslint-disable*/
import BrokerLedger from '@/pages/BrokerLedger';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/brokerledger')({
  component: () => <BrokerLedger />,
});
