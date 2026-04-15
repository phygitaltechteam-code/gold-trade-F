import AddBroker from '@/components/company/AddBorker';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/companybroker/addbroker')({
  component: () => <AddBroker />,
});
