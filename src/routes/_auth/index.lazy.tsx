import { AppLayout } from '@/layouts';
import {Home} from '@/pages';
import Dashboard from '@/pages/Dashboard';
import MainApp from '@/website/MainApp';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_auth/')({
  // component: MainApp,
  component:AppLayout,
});
