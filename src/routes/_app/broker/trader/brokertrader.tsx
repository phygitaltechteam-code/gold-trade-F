import { BrokerTrader } from '@/components/Broker/Trader/BrokerTrader'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/broker/trader/brokertrader')({
  component: () => <BrokerTrader />,
})
