import { createFileRoute } from '@tanstack/react-router'
import TransactionLedger from '@/components/masterbroker/TransactionLedger'

export const Route = createFileRoute('/_app/masterbroker/ledger-transaction')({
  component: () => <TransactionLedger />
})
