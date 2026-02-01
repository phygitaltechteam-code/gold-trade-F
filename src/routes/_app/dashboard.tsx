import Dashboard from '@/features/Dashboard/pages/Dashboard';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Dashboard />;
}
