import Dashboard from '@/components/masterbroker/Dashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/masterbroker/dashboard')({
  component: () => <Dashboard />,
})
