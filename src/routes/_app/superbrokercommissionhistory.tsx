import { createFileRoute } from '@tanstack/react-router'
import SuperBrokerCommissionHistory from '../../components/Broker/setting/SuperBrokerCommissionHistory'

export const Route = createFileRoute('/_app/superbrokercommissionhistory')({
  component: () => <SuperBrokerCommissionHistory />,
})
