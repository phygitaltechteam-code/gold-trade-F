import EnterCurrentPin from '@/components/Profilehub/Pin/EnterCurrentPin';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/accounthub/enter-currentpin')({
  component: RouteComponent,
});

function RouteComponent() {
  return <EnterCurrentPin />;
}
