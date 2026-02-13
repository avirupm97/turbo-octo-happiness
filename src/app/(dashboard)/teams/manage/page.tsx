'use client';

import { useState } from 'react';


import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentModal } from '@/components/modals/PaymentModal';
import { QuickStatsCard } from '@/components/dashboard/QuickStatsCard';
import { UsageSummaryCard } from '@/components/dashboard/UsageSummaryCard';
import { BillingInvoicesCard } from '@/components/billing/BillingInvoicesCard';
import { PRICING, MIN_AVG_CREDITS_PER_SEAT } from '@/lib/constants';
import { getDaysUntilExpiry } from '@/lib/billing-utils';
import { AlertCircle, Calendar, Info, Plus, Minus } from 'lucide-react';

export default function ManageTeamsPage() {


  const user = useAuthStore((state) => state.getCurrentUser());
  const buyExtraCredits = useAuthStore((state) => state.buyExtraCredits);
  const updateTeamPlanAndSeats = useAuthStore((state) => state.updateTeamPlanAndSeats);
  const addInvoice = useAuthStore((state) => state.addInvoice);

  const [showUpgradePayment, setShowUpgradePayment] = useState(false);
  const [showExtraCreditPayment, setShowExtraCreditPayment] = useState(false);
  
  // Upgrade state - initialize with current team values
  const [upgradeSeats, setUpgradeSeats] = useState(0);
  const [upgradeSelectedTier, setUpgradeSelectedTier] = useState<typeof PRICING.TEAMS_TIERS[number]>(() => {
    if (user?.teamsPlan) {
      return PRICING.TEAMS_TIERS.find(t => t.credits === user.teamsPlan!.monthlyCredits) || PRICING.TEAMS_TIERS[0];
    }
    return PRICING.TEAMS_TIERS[0];
  });
  
  // Extra credits state
  const [extraCreditsCount, setExtraCreditsCount] = useState<Record<number, number>>({
    1000: 0,
    10000: 0,
  });

  if (!user || user.plan !== 'teams' || !user.teamsPlan) {
    return null;
  }

  // Calculate total credits and used credits
  const totalCredits = user.teamsPlan.sharedCredits;
  const usedCredits = user.teamsPlan.sharedCreditsUsed;

  const isCancelled = user.planStatus === 'cancelled';
  const isCancellationPending = user.planStatus === 'cancellation-pending';
  const isTeamsOwner = user.teamsPlan.members.find(m => m.email === user.email)?.role === 'owner';
  const daysRemaining = getDaysUntilExpiry(user.billingCycleEnd);
  const expiryDate = user.billingCycleEnd ? new Date(user.billingCycleEnd).toLocaleDateString() : 'N/A';

  const handleIncrementCredits = (credits: number) => {
    setExtraCreditsCount(prev => ({
      ...prev,
      [credits]: prev[credits] + 1,
    }));
  };

  const handleDecrementCredits = (credits: number) => {
    setExtraCreditsCount(prev => ({
      ...prev,
      [credits]: Math.max(0, prev[credits] - 1),
    }));
  };

  const getTotalExtraCredits = () => {
    return Object.entries(extraCreditsCount).reduce((total, [credits, count]) => {
      return total + (parseInt(credits) * count);
    }, 0);
  };

  const getTotalExtraPrice = () => {
    return Object.entries(extraCreditsCount).reduce((total, [credits, count]) => {
      const bundle = PRICING.EXTRA_CREDIT_BUNDLES.find(b => b.credits === parseInt(credits));
      return total + (bundle ? bundle.price * count : 0);
    }, 0);
  };

  const handlePurchaseExtraCredits = () => {
    const totalCredits = getTotalExtraCredits();
    if (totalCredits === 0) return;
    
    setShowExtraCreditPayment(true);
  };

  const handleConfirmExtraCreditPayment = () => {
    const totalCredits = getTotalExtraCredits();
    const totalPrice = getTotalExtraPrice();
    
    buyExtraCredits(totalCredits, totalPrice);
    setExtraCreditsCount({ 1000: 0, 10000: 0 });
    
    addInvoice({
      date: new Date(),
      amount: totalPrice,
      description: `${totalCredits} extra credits purchase`,
      status: 'paid',
    });

    setShowExtraCreditPayment(false);
  };

  const handleUpgradeTeam = () => {
    if (!user.teamsPlan) return;
    
    // Check if anything changed
    const seatsChanged = upgradeSeats !== 0;
    const tierChanged = upgradeSelectedTier.credits !== user.teamsPlan.monthlyCredits;
    
    if (!seatsChanged && !tierChanged) return;
    
    setShowUpgradePayment(true);
  };

  const handleConfirmUpgrade = () => {
    if (!user.teamsPlan) return;

    const newTotalSeats = user.teamsPlan.seats + upgradeSeats;
    const upgradeTotalMonthly = (newTotalSeats * PRICING.SEAT_PRICE) + upgradeSelectedTier.price;

    updateTeamPlanAndSeats(
      upgradeSelectedTier.name,
      upgradeSelectedTier.credits,
      upgradeSelectedTier.price,
      newTotalSeats
    );
    
    addInvoice({
      date: new Date(),
      amount: upgradeTotalMonthly,
      description: `${upgradeSelectedTier.name} - ${newTotalSeats} seats`,
      status: 'paid',
    });

    setShowUpgradePayment(false);
    setUpgradeSeats(0); // Reset to 0 after upgrade
  };

  const upgradeAvgCreditsPerSeat = upgradeSeats > 0 ? Math.floor(upgradeSelectedTier.credits / upgradeSeats) : 0;
  const showWarning = upgradeSeats > 0 && upgradeAvgCreditsPerSeat < MIN_AVG_CREDITS_PER_SEAT;
  const newMonthlyCost = upgradeSelectedTier.price + ((user.teamsPlan.seats + upgradeSeats) * PRICING.SEAT_PRICE);
  const hasChanges = upgradeSeats !== 0 || upgradeSelectedTier.credits !== user.teamsPlan.monthlyCredits;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Team</h1>
        <p className="text-muted-foreground">Configure your team plan and billing</p>
      </div>

      {isCancellationPending && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <Calendar className="h-4 w-4 text-yellow-700 dark:text-yellow-500" />
          <AlertDescription className="text-yellow-900 dark:text-yellow-200">
            <div className="space-y-1">
              <p className="font-medium">Your Teams plan will expire soon</p>
              <p className="text-sm">
                Team access will expire on <strong>{expiryDate}</strong> ({daysRemaining} days remaining).
              </p>
              <p className="text-sm mt-2">
                You can reactivate the plan, add seats, or upgrade to keep the team active{isTeamsOwner && ', or process the billing cycle to finalize cancellation'}.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isCancelled && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Your Teams plan has been cancelled</p>
              <p className="text-sm">
                The billing cycle has been processed. Team expires on <strong>{expiryDate}</strong>.
              </p>
              <p className="text-sm mt-2">
                {isTeamsOwner ? 'You can reactivate the plan to start a new billing cycle or delete the team permanently.' : 'The team owner can reactivate the plan or delete the team.'}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <QuickStatsCard user={user} totalCredits={totalCredits} usedCredits={usedCredits} isTeamsOwner={isTeamsOwner} />

      {/* Only show upgrade/buy sections to team owners */}
      {isTeamsOwner && !isCancelled && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Get more from Teams */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Get more from Teams</CardTitle>
              <CardDescription>Add seats or upgrade to a higher credit tier</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="space-y-2">
                <label htmlFor="upgrade-seats" className="text-sm font-medium">
                  Extra Seats to Add
                </label>
                <Input
                  id="upgrade-seats"
                  type="number"
                  min={0}
                  value={upgradeSeats}
                  onChange={(e) => setUpgradeSeats(Math.max(0, parseInt(e.target.value) || 0))}
                />
                <p className="text-xs text-muted-foreground">
                  {upgradeSeats > 0 ? `${upgradeSeats} × $${PRICING.SEAT_PRICE}/month = $${upgradeSeats * PRICING.SEAT_PRICE}/month` : 'No additional seats'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Credit Tier</label>
                <Select
                  value={upgradeSelectedTier.credits.toString()}
                  onValueChange={(value) => {
                    const tier = PRICING.TEAMS_TIERS.find(t => t.credits.toString() === value);
                    if (tier) setUpgradeSelectedTier(tier);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-[300px]">
                    {PRICING.TEAMS_TIERS.map((tier) => (
                      <SelectItem key={tier.credits} value={tier.credits.toString()}>
                        {tier.name} - {tier.credits.toLocaleString()} credits/month (${tier.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Credit Distribution Info - only show when seats > 0, reserve space when hidden */}
              <div className="min-h-[94px]">
                {upgradeSeats > 0 && (
                  <Alert className="border-muted bg-muted/50">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Credit Distribution</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {upgradeSelectedTier.credits.toLocaleString()} shared credits across {user.teamsPlan.seats + upgradeSeats} total seats
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Avg per seat</p>
                            <p className="text-lg font-semibold">
                              {Math.floor(upgradeSelectedTier.credits / (user.teamsPlan.seats + upgradeSeats)).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {showWarning && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-muted-foreground/20">
                            <AlertCircle className="h-3 w-3 text-destructive" />
                            <p className="text-xs text-destructive">
                              Below recommended {MIN_AVG_CREDITS_PER_SEAT.toLocaleString()} credits/seat
                            </p>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Spacer to push button to bottom */}
              <div className="flex-1" />

              <Button
                className="w-full mt-auto" 
                onClick={handleUpgradeTeam}
                disabled={!hasChanges}
              >
                {hasChanges 
                  ? `Upgrade Plan - $${newMonthlyCost}/month`
                  : 'No Changes to Apply'}
              </Button>
            </CardContent>
          </Card>

          {/* Buy Extra Credits */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Buy extra credits</CardTitle>
              <CardDescription>
                Purchase one-time credits. Extra credits get added to your shared team pool.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              {/* Warning for cancelled plan */}
              {isCancellationPending && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <p className="font-medium">Your plan is expiring soon</p>
                    <p className="text-xs mt-1">
                      These extra credits will expire when your plan ends on {expiryDate}. 
                      Consider reactivating your plan to preserve your credits.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Credit Pack Options */}
              <div className="grid grid-cols-2 gap-3">
                {PRICING.EXTRA_CREDIT_BUNDLES
                  .filter(bundle => bundle.credits !== 5000)
                  .map((bundle) => (
                    <div
                      key={bundle.credits}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex flex-col gap-3">
                        <div>
                          <div className="font-semibold text-base">
                            {bundle.credits.toLocaleString()} credits
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${bundle.price}
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDecrementCredits(bundle.credits)}
                            disabled={extraCreditsCount[bundle.credits] === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="w-12 text-center font-semibold">
                            {extraCreditsCount[bundle.credits]}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleIncrementCredits(bundle.credits)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <Separator />

              {/* Summary Section */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available credits</span>
                  <span className="font-medium">{(totalCredits - usedCredits).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Extra credits</span>
                  <span className="font-medium text-primary">+{getTotalExtraCredits().toLocaleString()}</span>
                </div>
              </div>

              {/* Spacer to push button to bottom */}
              <div className="flex-1" />

              <Button 
                className="w-full mt-auto" 
                onClick={handlePurchaseExtraCredits}
                disabled={getTotalExtraCredits() === 0}
              >
                {getTotalExtraCredits() > 0 
                  ? isCancellationPending 
                    ? `Purchase ${getTotalExtraCredits().toLocaleString()} Credits - $${getTotalExtraPrice()} (Will Expire)`
                    : `Purchase ${getTotalExtraCredits().toLocaleString()} Credits - $${getTotalExtraPrice()}`
                  : 'Select credit packs to purchase'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <UsageSummaryCard 
        usedCredits={usedCredits} 
        totalCredits={totalCredits}
        detailsPath="/teams/usage"
      />

      <BillingInvoicesCard variant="full" />

      {/* Upgrade Payment Modal */}
      <PaymentModal
        open={showUpgradePayment}
        onOpenChange={setShowUpgradePayment}
        title="Authorize Team Plan Upgrade"
        description={`You're upgrading to ${upgradeSelectedTier.name}${upgradeSeats > 0 ? ` and adding ${upgradeSeats} seat(s) for a total of ${user.teamsPlan.seats + upgradeSeats} seats` : ''}.`}
        amount={newMonthlyCost}
        onConfirm={handleConfirmUpgrade}
      />

      {/* Extra Credits Payment Modal */}
      <PaymentModal
        open={showExtraCreditPayment}
        onOpenChange={setShowExtraCreditPayment}
        title="Authorize Extra Credits Payment"
        description={`You're purchasing ${getTotalExtraCredits().toLocaleString()} extra credits. These will be added to your shared team pool.`}
        amount={getTotalExtraPrice()}
        onConfirm={handleConfirmExtraCreditPayment}
      />
    </div>
  );
}
