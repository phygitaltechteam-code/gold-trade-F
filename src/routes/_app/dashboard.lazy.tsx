import {Calendar} from '@/components/common';
import {Home} from '@/pages';
import Dashboard from '@/components/Dashboard/Dashboard';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/dashboard')({
  component: Dashboard,
});
