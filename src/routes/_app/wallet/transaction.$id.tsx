// routes/_app/wallet/transaction.$id.tsx
import TransactionDetailPage from '@/features/Dashboard/components/TransactionDetailPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/wallet/transaction/$id')({
  component: () => <TransactionDetailPage />,
});
