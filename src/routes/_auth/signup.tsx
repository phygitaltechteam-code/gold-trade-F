import {createFileRoute} from '@tanstack/react-router';

import SignUp from '@/features/Registration/pages/SignUp';

export const Route = createFileRoute('/_auth/signup')({
  component: SignUp,
});
