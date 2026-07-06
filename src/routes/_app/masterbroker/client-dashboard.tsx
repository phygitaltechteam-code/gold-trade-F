import { ClientDashboard } from '@/components/masterbroker/ClientDashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/masterbroker/client-dashboard')({
  component: () => <ClientDashboard/>
})
