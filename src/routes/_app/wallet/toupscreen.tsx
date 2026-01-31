import TopUpScreen from '@/components/Wallet/TopUpScreen';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/wallet/toupscreen')({
  component: RouteComponent,
});

function RouteComponent() {
  return <TopUpScreen />;
}
