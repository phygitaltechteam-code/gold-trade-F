import StatementsScreen from '@/components/E-Private/StatementsScreen';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/eprivate/statement')({
  component: RouteComponent,
});

function RouteComponent() {
  return <StatementsScreen transactions={[]} />;
}
