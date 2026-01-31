import PinScreen from '@/components/Wallet/PinScreen';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/wallet/pin')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PinScreen />;
}
