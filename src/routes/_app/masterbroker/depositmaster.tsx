import Depositemaster from '@/components/masterbroker/Depositmaster'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/masterbroker/depositmaster')({
    component: () => <Depositemaster />,
})
