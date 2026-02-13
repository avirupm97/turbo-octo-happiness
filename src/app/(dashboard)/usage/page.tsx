'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import { QuickStatsCard } from '@/components/dashboard/QuickStatsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsageTab } from '@/components/usage/UsageTab';
import { AllocationTab } from '@/components/usage/AllocationTab';

export default function UsagePage() {
  const user = useAuthStore((state) => state.getCurrentUser());

  if (!user) return null;

  const isTeams = user.plan === 'teams';
  const totalCredits = isTeams && user.teamsPlan ? user.teamsPlan.monthlyCredits : user.credits;
  const usedCredits = isTeams && user.teamsPlan ? user.teamsPlan.sharedCreditsUsed : user.creditsUsed;

  const transactions = user.creditTransactions || [];

  return (
    <div className="space-y-6">
      <QuickStatsCard
        user={user}
        totalCredits={totalCredits}
        usedCredits={usedCredits}
      />

      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
        </TabsList>
        <TabsContent value="usage" className="mt-6">
          <UsageTab />
        </TabsContent>
        <TabsContent value="allocation" className="mt-6">
          <AllocationTab transactions={transactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
