import DepositeCompany from '@/components/withdrawl-Req/DepositeCompany'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/companybroker/depositeall')({
  component: () => <DepositeCompany />,
})
