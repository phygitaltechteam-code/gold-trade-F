import MainCustomerPage from '@/components/Broker/Customer/MainCustomerPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/broker/customer/customerdisplay')({
  component: () => <MainCustomerPage />,
});
