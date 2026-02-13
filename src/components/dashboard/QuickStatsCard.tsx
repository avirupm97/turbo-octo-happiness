import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { User } from '@/lib/types';

interface QuickStatsCardProps {
  user: User;
  totalCredits: number;
  usedCredits: number;
  showProgress?: boolean;
  isTeamsOwner?: boolean;
}

export function QuickStatsCard({ user, totalCredits, usedCredits, showProgress = false, isTeamsOwner = false }: QuickStatsCardProps) {
  // Include extra credits in total calculations
  const totalWithExtra = user.plan === 'teams' && user.teamsPlan
    ? totalCredits + (user.teamsPlan.extraCredits || 0)
    : totalCredits + (user.extraCredits || 0);

  const remainingCredits = totalWithExtra - usedCredits;
  const usagePercent = totalWithExtra > 0 ? ((totalWithExtra - remainingCredits) / totalWithExtra) * 100 : 0;

  const getPlanDisplayName = (plan: string) => {
    if (plan === 'free') return 'Free plan';
    if (plan === 'pro') return 'Pro(Monthly) plan';
    if (plan === 'teams') return 'Teams plan';
    return plan;
  };

  const getNextRefillText = () => {
    if (user.plan === 'free') {
      return `50 credits, due on ${new Date(Date.now() + 86400000).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })}`;
    }
    if (user.plan === 'pro' && user.proPlan && user.billingCycle) {
      const nextRefillDate = new Date(user.billingCycle);
      nextRefillDate.setDate(nextRefillDate.getDate() + 30);
      return `${user.proPlan.monthlyCredits} credits, due on ${nextRefillDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })}`;
    }
    if (user.plan === 'teams' && user.teamsPlan && user.billingCycle) {
      const nextRefillDate = new Date(user.billingCycle);
      nextRefillDate.setDate(nextRefillDate.getDate() + 30);
      return `${user.teamsPlan.monthlyCredits} credits, due on ${nextRefillDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })}`;
    }
    return 'N/A';
  };

  if (showProgress) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">
              You are on {getPlanDisplayName(user.plan)}
            </h3>
            <Progress value={100 - usagePercent} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {remainingCredits} / {totalWithExtra} credits left
            </p>
          </div>
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              Next Refill: {getNextRefillText()}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    {
      label: 'Current Plan',
      value: <span className="text-sm text-muted-foreground capitalize">{user.plan}</span>,
    },
    ...(isTeamsOwner && user.plan === 'teams' && user.teamsPlan ? [{
      label: 'Seats Used',
      value: <span className="text-sm text-muted-foreground">
        {user.teamsPlan.members.length} / {user.teamsPlan.seats}
      </span>,
    }] : []),
    {
      label: user.plan === 'teams' ? 'Credits Used' : 'Credits Remaining',
      value: <span className="text-sm text-muted-foreground">
        {user.plan === 'teams'
          ? `${usedCredits}`
          : `${remainingCredits} / ${totalWithExtra}`}
      </span>,
    },
    {
      label: 'Next Credit Refill',
      value: <span className="text-sm text-muted-foreground">
        {getNextRefillText()}
      </span>,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
        <CardDescription>Your usage and billing information at a glance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${statItems.length}, 1fr)` }}>
          {statItems.map((item, index) => (
            <div key={index} className="flex flex-col gap-1">
              <span className="text-sm font-medium">{item.label}</span>
              {item.value}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
