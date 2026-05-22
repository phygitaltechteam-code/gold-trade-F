/*eslint-disable*/
import {KYCDetail} from '@/components/KycApproval/KYCDetail';
import {createFileRoute} from '@tanstack/react-router';
import react from 'react';

export const Route = createFileRoute('/_app/KYCApproval/kycdetailes/$id')({
  component: () => <KYCDetail request={{}} onBack={() => {}} />,
});
