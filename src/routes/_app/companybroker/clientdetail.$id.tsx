import { createFileRoute } from '@tanstack/react-router'
import { ClientDetail } from '@/components/Clients/ClientDetail'

export const Route = createFileRoute('/_app/companybroker/clientdetail/$id')({
  component: () => <ClientDetail />,
})
