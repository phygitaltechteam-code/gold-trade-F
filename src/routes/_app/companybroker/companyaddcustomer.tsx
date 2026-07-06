import AddCustomer from '@/components/Broker/AddCustomer'
import CompanyAddCustomer from '@/components/company/CompanyAddCustomer'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/companybroker/companyaddcustomer')({
  component: () => <CompanyAddCustomer/>,
})
