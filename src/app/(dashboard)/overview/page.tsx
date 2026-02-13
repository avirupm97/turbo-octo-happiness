'use client';

import { OnboardingCarousel } from '@/components/dashboard/OnboardingCarousel';

export default function OverviewPage() {
  return (
    <div className="flex items-center justify-center min-h-full pt-[100px]">
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold">👋 Welcome to Kombai!</h1>
          <p className="text-muted-foreground text-lg">
            Kombai is a specialized AI agent built for frontend development.
          </p>
        </div>

        <OnboardingCarousel />
      </div>
    </div>
  );
}
