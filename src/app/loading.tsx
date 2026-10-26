import React from 'react';
import LoadingScreen from '@/components/brand/LoadingScreen';

/**
 * Root Loading Page
 * Automatically invoked by Next.js App Router during page transitions,
 * route navigations, and React Suspense boundaries.
 */
export default function Loading() {
  return <LoadingScreen message="LOADING TORQUE CARE..." submessage="Your Car. Always Cared For." />;
}
