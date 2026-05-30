import {createFileRoute} from '@tanstack/react-router';
import SuperBrokerDashboard from '@/components/Dashboard/SuperBrokerDashboard';

export const Route = createFileRoute('/_app/superbroker/superbrokerdashbaord')({
  component: SuperBrokerDashboard,
});
