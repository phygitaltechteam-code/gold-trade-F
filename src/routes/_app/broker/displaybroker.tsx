import {createFileRoute} from '@tanstack/react-router';
import DisplayBroker from '@/components/Broker/Addbroker/DisplayBroker';

export const Route = createFileRoute('/_app/broker/displaybroker')({
  component: DisplayBroker,
});
