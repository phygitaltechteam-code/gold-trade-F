import MasterBrokerTable from '@/components/company/masterbroker/MasterBrokerTable'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/companybroker/masterbroker-table')({
  component: () => <MasterBrokerTable />,
})
