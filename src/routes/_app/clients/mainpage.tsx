import MainPage from '@/components/Clients/MainPage';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/clients/mainpage')({
  component: () => <MainPage />,
});
