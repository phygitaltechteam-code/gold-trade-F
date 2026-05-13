import { createFileRoute } from '@tanstack/react-router'
import AddSuperBroker from '@/components/company/superBroker/AddSuperBroker'

export const Route = createFileRoute('/_app/companybroker/addSuperBrocker')({
  component: () => <AddSuperBroker />,
})
