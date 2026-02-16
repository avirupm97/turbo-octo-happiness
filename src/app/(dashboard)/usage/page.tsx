'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { QuickStatsCard } from '@/components/dashboard/QuickStatsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsageTab } from '@/components/usage/UsageTab';
import { AllocationTab } from '@/components/usage/AllocationTab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function UsagePage() {
  const user = useAuthStore((state) => state.getCurrentUser());
  const isViewingAsBillingAdmin = useAuthStore((state) => state.isViewingAsBillingAdmin());

  if (!user) return null;

  // Show billing admin notice if viewing as billing admin
  if (isViewingAsBillingAdmin) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Billing Admin Access</CardTitle>
            <CardDescription>You have administrative access to this team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You are added as a billing Admin to this team and have no credits. Go to Manage Team or Team Usage to see team plan and view usage.
              </AlertDescription>
            </Alert>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/teams/usage">Go to Team Usage</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/teams/manage">Go to Manage Team</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
