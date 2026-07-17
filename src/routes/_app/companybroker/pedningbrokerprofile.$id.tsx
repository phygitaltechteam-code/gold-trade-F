import PendingBrokerProfile from '@/components/company/PendingBrokerProfile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_app/companybroker/pedningbrokerprofile/$id',
)({
  component: () => (
    <PendingBrokerProfile />
  ),
})
