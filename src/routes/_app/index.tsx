import {createFileRoute} from '@tanstack/react-router';

import WalletProcessPage from '@/components/Wallet/WalletProcessPage';

export const Route = createFileRoute('/_app/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <WalletProcessPage />;
}
