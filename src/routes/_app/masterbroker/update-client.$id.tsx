import MasterUpdateCustomer from '@/components/masterbroker/Profile/UpdateClient';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/masterbroker/update-client/$id')({
    component: () => <MasterUpdateCustomer />,
})
