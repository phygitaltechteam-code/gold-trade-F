/*eslint-disable*/
import BrokerDashboard from '@/components/Dashboard/BrokerDashboard';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/broker/brokerdashboard')({
  component: () => <BrokerDashboard />,
});
