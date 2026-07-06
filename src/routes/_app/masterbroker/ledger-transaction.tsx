import TransactionLedger from '@/components/masterbroker/TransactionLedger'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/masterbroker/ledger-transaction')({
  component: () => <TransactionLedger/>
})
