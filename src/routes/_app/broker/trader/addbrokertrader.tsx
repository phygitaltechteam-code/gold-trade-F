import AddBrokerTrader from '@/components/Broker/Trader/AddBrokerTrader'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/broker/trader/addbrokertrader')({
  component: () => <AddBrokerTrader />,
})
