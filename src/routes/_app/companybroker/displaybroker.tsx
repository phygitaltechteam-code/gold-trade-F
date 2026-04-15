import Brokerflow from '@/components/company/Brokerflow'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/companybroker/displaybroker')({
  component: () => <Brokerflow />,
})
