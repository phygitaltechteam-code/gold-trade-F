import SuccessScreen from '@/components/Wallet/SuccessScreen';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/wallet/success')({
  component: RouteComponent,
});

function RouteComponent() {
  return <SuccessScreen />;
}
