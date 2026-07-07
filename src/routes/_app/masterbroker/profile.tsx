import { Profile } from '@/components/masterbroker/Profile'
import ProfileTabs from '@/components/masterbroker/Profile/ProfileTabs'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/masterbroker/profile')({
  component: () => <ProfileTabs />
})
