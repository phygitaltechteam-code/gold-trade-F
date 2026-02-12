import TopupWithdrawlFlow from '@/components/topupwithdrawl/TopupWithdrawlFlow';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/topupwithdrawl/walletwithdrawl')({
  component: RouteComponent,
});

function RouteComponent() {
  return <TopupWithdrawlFlow />;
}
