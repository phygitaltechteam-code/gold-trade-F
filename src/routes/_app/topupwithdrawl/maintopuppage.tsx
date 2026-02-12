import TopupListPage from '@/components/topupwithdrawl/TopupListPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/topupwithdrawl/maintopuppage')({
  component: RouteComponent,
});

function RouteComponent() {
  return <TopupListPage />;
}
