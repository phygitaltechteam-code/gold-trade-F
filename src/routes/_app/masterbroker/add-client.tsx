import AddClient from '@/components/masterbroker/AddClient'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/masterbroker/add-client')({
  component: () => <AddClient/>
})
