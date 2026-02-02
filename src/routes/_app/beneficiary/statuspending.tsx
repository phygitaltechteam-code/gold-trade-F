import BeneficiaryPendingPage from '@/features/Payments/Pages/BeneficiaryPendingPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/beneficiary/statuspending')({
  component: BeneficiaryPendingPage,
});
