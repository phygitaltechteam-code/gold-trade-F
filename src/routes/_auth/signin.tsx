import Signin from '@/features/Registration/pages/Signin';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/signin')({
  component: Signin,
});
