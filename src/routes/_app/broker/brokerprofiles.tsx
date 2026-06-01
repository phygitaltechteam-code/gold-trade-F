/*eslint-disable*/
import BrokerProfile from '@/components/Broker/setting/BrokerProfile';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/broker/brokerprofiles')({
  component: () => <BrokerProfile />,
});
