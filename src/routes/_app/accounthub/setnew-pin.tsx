import SetNewPin from '@/components/Profilehub/Pin/SetNewPin';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/accounthub/setnew-pin')({
  component: RouteComponent,
});

function RouteComponent() {
  return <SetNewPin />;
}
