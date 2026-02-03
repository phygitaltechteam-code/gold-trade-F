import {createFileRoute} from '@tanstack/react-router';
import AppLayout from './../layouts/AppLayout';
import MainApp from '@/components/MainApp';

export const Route = createFileRoute('/_app')({
  component: MainApp,
});
