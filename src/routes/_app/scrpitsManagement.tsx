import DisplayScripts from '@/components/company/scripts'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/scrpitsManagement')({
  component: () => <DisplayScripts />,
})
