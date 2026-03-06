import {createFileRoute} from '@tanstack/react-router';
import KycMainPage from '@/components/KycApproval/KycMainPage';

export const Route = createFileRoute('/_app/KYCApproval/kycmain')({
  component: () => <KycMainPage />,
});
