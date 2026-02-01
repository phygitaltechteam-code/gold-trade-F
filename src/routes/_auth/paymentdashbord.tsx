import PaymentDashboard from '@/features/Payments/Pages/PaymentDashboard';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/paymentdashbord')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PaymentDashboard />;
}
