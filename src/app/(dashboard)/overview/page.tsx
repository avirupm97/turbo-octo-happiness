'use client';

import { GetStartedPage } from '@/components/dashboard/GetStartedPage';

export default function OverviewPage() {
  return (
    <div className="space-y-8 max-w-3xl px-4 sm:px-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">👋 Welcome to Kombai!</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Kombai is a specialized AI agent built for frontend development.
        </p>
      </div>

      <GetStartedPage />
    </div>
  );
}
