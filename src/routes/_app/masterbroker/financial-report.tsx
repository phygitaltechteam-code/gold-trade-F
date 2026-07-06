import FinancialReport from '@/components/masterbroker/FinancialReport'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/masterbroker/financial-report')({
  component: () => <FinancialReport />,
})
