import { createFileRoute } from '@tanstack/react-router'
import SuperBrokerProfile from '@/components/Broker/setting/SuperBrokerProfile'

export const Route = createFileRoute('/_app/broker/superbrokerprofile')({
  component: () => <SuperBrokerProfile />,
})
