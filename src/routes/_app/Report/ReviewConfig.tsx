import ReviewConfig from '@/components/Review/ReviewConfig';
import {createFileRoute} from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/_app/Report/ReviewConfig')({
  component: () => <ReviewConfig />,
});
