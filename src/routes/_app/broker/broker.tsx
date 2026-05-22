import Broker from '@/components/Broker/Addbroker/Broker'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/broker/broker')({
  component: Broker,
})
