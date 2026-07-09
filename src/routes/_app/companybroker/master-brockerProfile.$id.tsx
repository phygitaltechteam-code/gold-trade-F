import MasterBrokerProfile from '@/components/company/masterbroker/MasterBrokerProfile'
import { useParams } from '@tanstack/react-router';
import React from 'react';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_app/companybroker/master-brockerProfile/$id',
)({
  component: MasterBrokerProfilePage,
    
  
})
function MasterBrokerProfilePage() {
  const { id } = Route.useParams()

  console.log('id:', id)

  return <MasterBrokerProfile id={id} />
}
