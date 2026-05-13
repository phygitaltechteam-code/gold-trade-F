import { createFileRoute } from '@tanstack/react-router'
import TransactionLedger from '../../pages/TransactionLedger'

export const Route = createFileRoute('/_app/TransactionLedger')({
  component: () => <TransactionLedger />
})
