import { createFileRoute } from '@tanstack/react-router'
import SuperBrokerProfile from '@/components/company/superBroker/SuperBrokerProfile'

export const Route = createFileRoute('/_app/companybroker/superBrokerProfile')({
  component: () => <SuperBrokerProfile />,
})
