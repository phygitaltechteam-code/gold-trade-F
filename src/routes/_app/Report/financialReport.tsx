import FinancialReport from '@/components/FinancailReport/FinancialReport';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/Report/financialReport')({
  component: () => <FinancialReport />,
});
