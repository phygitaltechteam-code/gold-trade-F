import {createFileRoute} from '@tanstack/react-router';
import {ClientDetail} from '@/components/Clients/ClientDetail';
import React from 'react';

export const Route = createFileRoute('/_app/companybroker/clientdetail/$id')({
  component: () => <ClientDetail />,
});
