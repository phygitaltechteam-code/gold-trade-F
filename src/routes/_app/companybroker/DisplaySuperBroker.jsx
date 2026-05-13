import { createFileRoute } from '@tanstack/react-router'
import SuperBrokerflow from '@/components/company/superBroker/SuperBrokerflow'

export const Route = createFileRoute('/_app/companybroker/DisplaySuperBroker')({
  component: () => <SuperBrokerflow />, 
})
    