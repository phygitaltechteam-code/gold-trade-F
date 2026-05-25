import { createFileRoute } from '@tanstack/react-router'
import PendingBrokerByid from '@/pages/PendingBrokerByid'

export const Route = createFileRoute('/_app/companybroker/pendingbrokerby/$id')(
  {
    component: () => <PendingBrokerByid />,
  },
)
