import EditPersonalInfo from '@/components/Profilehub/EditPersonalInfo';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/accounthub/personal-info')({
  component: RouteComponent,
});

function RouteComponent() {
  return <EditPersonalInfo />;
}
