import {createFileRoute} from '@tanstack/react-router';
import EditContactInfo from '@/components/Profilehub/EditContactInfo';

export const Route = createFileRoute('/_app/accounthub/contact-info')({
  component: RouteComponent,
});

function RouteComponent() {
  return <EditContactInfo />;
}
