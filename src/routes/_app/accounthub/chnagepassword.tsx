import ChangePassword from '@/components/Profilehub/ChangePassword';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/accounthub/chnagepassword')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ChangePassword />;
}
