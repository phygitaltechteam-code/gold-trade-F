import ReviewConfig from '@/components/Review/ReviewConfig'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/Report/ReviewConfig')({
  component: () => <ReviewConfig />,
})
