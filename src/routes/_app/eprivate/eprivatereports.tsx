import EPrivateMain from '@/components/E-Private/EPrivateMain';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/eprivate/eprivatereports')({
  component: RouteComponent,
});

function RouteComponent() {
  return <EPrivateMain />;
}
