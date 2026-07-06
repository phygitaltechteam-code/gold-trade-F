import MasterBrokerflow from '@/components/company/masterbroker/MasterBrokerflow'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_app/companybroker/display-master-broker',
)({
  component: () => <MasterBrokerflow />,
})
