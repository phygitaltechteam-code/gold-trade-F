import { createFileRoute } from '@tanstack/react-router'
import TransactionLedgerBroker from '@/components/Broker/Addbroker/transaction/TransactionLedgerBroker'

export const Route = createFileRoute(
  '/_app/broker/trasaction/transactionledger',
)({
  component: TransactionLedgerBroker,
})
