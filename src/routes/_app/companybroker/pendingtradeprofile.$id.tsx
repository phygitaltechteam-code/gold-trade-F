import { PendingTradeProfile } from '@/components/company/PendingTradeProfile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_app/companybroker/pendingtradeprofile/$id',
)({
  component: () => (
    <PendingTradeProfile />
  ),
})
