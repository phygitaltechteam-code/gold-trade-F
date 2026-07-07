import { ClientDetail } from '@/components/masterbroker/ClientDetail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/masterbroker/client-details/$id')({
    
  component: () => <ClientDetail/>
})
