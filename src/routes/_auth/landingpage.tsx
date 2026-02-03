import LandingPage from '@/components/Landingpage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/landingpage')({
  component: RouteComponent,
});

function RouteComponent() {
  return <LandingPage />;
}
