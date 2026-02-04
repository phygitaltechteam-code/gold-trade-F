import PaymentWrapper from '@/features/Payments/Pages/PaymentWrapper';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/payment/send/$id')({
  component: PaymentWrapper,
});
