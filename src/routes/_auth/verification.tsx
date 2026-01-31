import {Verification} from '@/features/Registration/pages/Verification';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/verification')({
  component: Verification,
});
