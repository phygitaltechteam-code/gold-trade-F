import {Profile} from '@/components/Profile';
import ProfileTabs from '@/components/Profile/ProfileTabs';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/profile')({
  component: () => <ProfileTabs />,
});
