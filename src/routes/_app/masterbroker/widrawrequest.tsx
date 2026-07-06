import WithdrawalRequest from '@/components/masterbroker/WithdrawlRequest'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/masterbroker/widrawrequest')({
  component: () => <WithdrawalRequest />,
})
