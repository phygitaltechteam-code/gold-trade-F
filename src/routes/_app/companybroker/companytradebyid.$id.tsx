import {createFileRoute} from '@tanstack/react-router';
import UpdateTradeById from '@/components/company/UpdateTradeById';

export const Route = createFileRoute('/_app/companybroker/companytradebyid/$id')({
  component: () => <UpdateTradeById />,
});
