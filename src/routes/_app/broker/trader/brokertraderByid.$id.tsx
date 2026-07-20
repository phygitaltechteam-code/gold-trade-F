import { BrokerTraderById } from '@/components/Broker/Trader/BrokerTraderById'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_app/broker/trader/brokertraderByid/$id',
)({
    component: () => <BrokerTraderById />,
})
