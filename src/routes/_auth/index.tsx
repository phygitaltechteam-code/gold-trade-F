import MainApp from '@/components/MainApp';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/')({
  component: MainApp,
});
