import PaymentSend from '@/features/Payments/Pages/SendPayment';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/beneficiary/sendmoney')({
  component: PaymentSend,
});
