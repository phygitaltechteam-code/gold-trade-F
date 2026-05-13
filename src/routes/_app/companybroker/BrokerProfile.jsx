import { createFileRoute } from '@tanstack/react-router'
import BrokerProfile from '@/components/company/BrokerProfile'
export const Route = createFileRoute('/_app/companybroker/BrokerProfile')({
  component: () => <BrokerProfile/>
})
