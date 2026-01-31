import {createFileRoute} from '@tanstack/react-router';
import {Rejection} from '@/features/Registration/pages/Rejection';

export const Route = createFileRoute('/_auth/rejected')({
  component: Rejection,
});
