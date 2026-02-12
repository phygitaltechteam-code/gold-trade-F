import UpdateBeneficiary from '@/features/Payments/Pages/UpdateBeneficiary';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/updatebeneficiary/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  return <UpdateBeneficiary />;
}
