import { createFileRoute } from '@tanstack/react-router'
import WithdrawlRequest from '@/components/withdrawl-Req/WithdrawlRequest'

export const Route = createFileRoute('/_app/withdrawlreq/withdrawlRequest')({
  component: () => <WithdrawlRequest/>,
})
