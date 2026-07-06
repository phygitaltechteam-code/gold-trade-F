import AddMasterBroker from '@/components/company/masterbroker/AddMasterBroker'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/companybroker/add-masterbroker')({
  component: () => <AddMasterBroker />,
})
