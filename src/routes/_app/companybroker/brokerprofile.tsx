import { createFileRoute } from '@tanstack/react-router'
import BrokerProfile from '@/components/Broker/setting/BrokerProfile'

export const Route = createFileRoute('/_app/companybroker/brokerprofile')({
  component: BrokerProfile,
})
