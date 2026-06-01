import Dashboard from '@/components/Dashboard/Dashboard';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/')({
  component: Dashboard,
});
