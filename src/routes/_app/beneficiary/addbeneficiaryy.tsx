import AddBeneficiary from '@/features/Payments/Pages/AddBeneficiary';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/beneficiary/addbeneficiaryy')({
  component: RouteComponent,
});

function RouteComponent() {
  return <AddBeneficiary />;
}
