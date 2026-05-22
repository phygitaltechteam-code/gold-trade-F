import { createFileRoute } from '@tanstack/react-router'
import BrokerProfile from '@/components/Broker/Addbroker/BrokerProfile'

export const Route = createFileRoute('/_app/broker/brokerprofile/$id')({
  component: BrokerProfile,
})
