import { KYCDetail } from '@/components/KycApproval/KYCDetail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/KYCApproval/kycdetailes/$id')({
  component: () => <KYCDetail request={{}} onBack={() => {}} />,
})
