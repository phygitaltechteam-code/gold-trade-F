import { createFileRoute } from '@tanstack/react-router'
import Review from '@/components/Broker/Addbroker/Review'

export const Route = createFileRoute('/_app/broker/reviewconfig')({
  component: Review,
})
