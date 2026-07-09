import MasterBrokerflow from '@/components/company/masterbroker/MasterBrokerflow'
import { createFileRoute } from '@tanstack/react-router'
import React from 'react'

export const Route = createFileRoute(
  '/_app/companybroker/display-master-broker',
)({
  component: () => <MasterBrokerflow />,
})
