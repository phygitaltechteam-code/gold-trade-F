import { createFileRoute } from '@tanstack/react-router'
import SuperBrokerTable from '@/components/company/superBroker/SuperBrokerTable'

export const Route = createFileRoute('/_app/companybroker/SuperBrockerTable')({
  component: () => <SuperBrokerTable />,
})
