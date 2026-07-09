import React from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';

interface BrokersTabProps {
  brokersList: any[];
  brokerColumns: any[];
}

export const BrokersTab: React.FC<BrokersTabProps> = ({ brokersList, brokerColumns }) => {
  return (
    <div className="overflow-x-auto">
      <GenericTable
        data={brokersList}
        columns={brokerColumns}
        isSearchable={true}
      />
    </div>
  );
};
