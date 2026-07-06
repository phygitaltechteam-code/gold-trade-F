import PendingApprovals from '@/components/masterbroker/PendingApprovals'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/masterbroker/pending-approvel')({
  component: () => <PendingApprovals />,
})
