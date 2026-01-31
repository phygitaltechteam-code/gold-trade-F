import ConfirmNewPin from '@/components/Profilehub/Pin/ConfirmNewPin';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/accounthub/confirm-pin')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ConfirmNewPin />;
}
