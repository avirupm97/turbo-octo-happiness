'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BuyCreditsModal } from '@/components/modals/BuyCreditsModal';
import { PaymentModal } from '@/components/modals/PaymentModal';
import { QuickStatsCard } from '@/components/dashboard/QuickStatsCard';
import { UsageSummaryCard } from '@/components/dashboard/UsageSummaryCard';
import { BillingInvoicesCard } from '@/components/billing/BillingInvoicesCard';
import { PRICING, MIN_AVG_CREDITS_PER_SEAT } from '@/lib/constants';
import { getDaysUntilExpiry } from '@/lib/billing-utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { BillingInterval } from '@/lib/types';
import { AlertCircle, Calendar, Sparkles, Info, Plus, Minus } from 'lucide-react';

export default function YourPlanPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.getCurrentUser());
  const isViewingAsBillingAdmin = useAuthStore((state) => state.isViewingAsBillingAdmin());
  const _buyCredits = useAuthStore((state) => state.buyCredits);
  const buyExtraCredits = useAuthStore((state) => state.buyExtraCredits);
  const upgradeToProPlan = useAuthStore((state) => state.upgradeToProPlan);
  const upgradeToTeamsPlan = useAuthStore((state) => state.upgradeToTeamsPlan);
  const upgradePro = useAuthStore((state) => state.upgradePro);
  const addInvoice = useAuthStore((state) => state.addInvoice);
  
  const [showPayment, setShowPayment] = useState(false);
  const [showTeamsPayment, setShowTeamsPayment] = useState(false);
  const [showUpgradeConfig, setShowUpgradeConfig] = useState(false);
  const [showBuyExtraCredits, setShowBuyExtraCredits] = useState(false);
  const [showProUpgradePayment, setShowProUpgradePayment] = useState(false);
  const [showExtraCreditPayment, setShowExtraCreditPayment] = useState(false);
  const [upgradeSeats, setUpgradeSeats] = useState(2);
  const [upgradeSelectedTier, setUpgradeSelectedTier] = useState<typeof PRICING.TEAMS_TIERS[number]>(PRICING.TEAMS_TIERS[0]);
  const [selectedTier, setSelectedTier] = useState<typeof PRICING.PRO_TIERS[number]>(PRICING.PRO_TIERS[0]);
  const [selectedProUpgradeTier, setSelectedProUpgradeTier] = useState<typeof PRICING.PRO_TIERS[number] | null>(null);
  const [_selectedExtraCreditBundle, _setSelectedExtraCreditBundle] = useState<typeof PRICING.EXTRA_CREDIT_BUNDLES[number] | null>(null);
  const [selectedTeamsTier, setSelectedTeamsTier] = useState<typeof PRICING.TEAMS_TIERS[number]>(PRICING.TEAMS_TIERS[0]);
  const [teamSeats, setTeamSeats] = useState(0);
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);
  const [isAnnualBillingUpgrade, setIsAnnualBillingUpgrade] = useState(false);
  const [extraCreditsCount, setExtraCreditsCount] = useState<Record<number, number>>({
    1000: 0,
    10000: 0,
  });

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

  // Calculate total credits and used credits for all plans
  const totalCredits =
    user.plan === 'teams' && user.teamsPlan
      ? user.teamsPlan.sharedCredits
      : user.credits;
  const usedCredits =
    user.plan === 'teams' && user.teamsPlan
      ? user.teamsPlan.sharedCreditsUsed
      : user.creditsUsed;

  // Teams calculations
  const seatsCost = teamSeats * PRICING.SEAT_PRICE;
  const totalTeamsMonthly = seatsCost + selectedTeamsTier.price;
  const avgCreditsPerSeat = Math.floor(selectedTeamsTier.credits / teamSeats);
  const showWarning = avgCreditsPerSeat < MIN_AVG_CREDITS_PER_SEAT;

  const handleUpgradeToPro = () => {
    setShowPayment(true);
  };

  const getDisplayPrice = (tier: typeof PRICING.PRO_TIERS[number], annual: boolean) => {
    return annual ? tier.annualPrice : tier.price;
  };

  const getMonthlyEquivalent = (tier: typeof PRICING.PRO_TIERS[number]) => {
    return Math.round(tier.annualPrice / 12);
  };

  const handleConfirmPayment = () => {
    const billingInterval: BillingInterval = isAnnualBilling ? 'annual' : 'monthly';
    const price = isAnnualBilling ? selectedTier.annualPrice : selectedTier.price;
    const proPlan = {
      monthlyCredits: selectedTier.credits,
      price,
      name: selectedTier.name,
      billingInterval,
    };

    upgradeToProPlan(proPlan);
    
    addInvoice({
      date: new Date(),
      amount: price,
      description: `${selectedTier.name} subscription (${billingInterval})`,
      status: 'paid',
    });

    setShowPayment(false);
  };

  const handleUpgradeToTeams = () => {
    setShowTeamsPayment(true);
  };

  const handleConfirmTeamsPayment = () => {
    const teamsPlan = {
      teamName: 'My Team',
      seats: teamSeats,
      monthlyCredits: selectedTeamsTier.credits,
      sharedCredits: selectedTeamsTier.credits,
      sharedCreditsUsed: 0,
      planName: selectedTeamsTier.name,
      members: [],
      billingAdmins: [],
      extraCredits: 0,
    };

    upgradeToTeamsPlan(teamsPlan);
    
    addInvoice({
      date: new Date(),
      amount: totalTeamsMonthly,
      description: `${selectedTeamsTier.name} - ${teamSeats} seats`,
      status: 'paid',
    });

    setShowTeamsPayment(false);
  };

  const handleConfirmUpgrade = () => {
    setShowTeamsPayment(true);
  };

  const handleProToTeamsUpgrade = () => {
    const upgradeSeatsCost = upgradeSeats * PRICING.SEAT_PRICE;
    const upgradeTotalMonthly = upgradeSeatsCost + upgradeSelectedTier.price;

    const teamsPlan = {
      teamName: 'My Team',
      seats: upgradeSeats,
      monthlyCredits: upgradeSelectedTier.credits,
      sharedCredits: upgradeSelectedTier.credits,
      sharedCreditsUsed: 0,
      planName: upgradeSelectedTier.name,
      members: [],
      billingAdmins: [],
      extraCredits: 0,
    };

    upgradeToTeamsPlan(teamsPlan);
    
    addInvoice({
      date: new Date(),
      amount: upgradeTotalMonthly,
      description: `${upgradeSelectedTier.name} - ${upgradeSeats} seats`,
      status: 'paid',
    });

    setShowTeamsPayment(false);
    setShowUpgradeConfig(false);
  };

  const handleBuyExtraCredits = (credits: number, price: number) => {
    buyExtraCredits(credits, price);
  };

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
    
    // Show payment modal for authorization
    setShowExtraCreditPayment(true);
  };

  const handleConfirmExtraCreditPayment = () => {
    const totalCredits = getTotalExtraCredits();
    const totalPrice = getTotalExtraPrice();
    
    buyExtraCredits(totalCredits, totalPrice);
    setExtraCreditsCount({ 1000: 0, 10000: 0 });
    
    // Add invoice
    addInvoice({
      date: new Date(),
      amount: totalPrice,
      description: `${totalCredits} extra credits purchase`,
      status: 'paid',
    });

    setShowExtraCreditPayment(false);
  };

  const handleUpgradeProTier = () => {
    if (!selectedProUpgradeTier) return;
    setShowProUpgradePayment(true);
  };

  const handleConfirmProUpgrade = () => {
    if (!selectedProUpgradeTier) return;
    
    const billingInterval: BillingInterval = isAnnualBillingUpgrade ? 'annual' : 'monthly';
    const price = isAnnualBillingUpgrade ? selectedProUpgradeTier.annualPrice : selectedProUpgradeTier.price;
    const proPlan = {
      monthlyCredits: selectedProUpgradeTier.credits,
      price,
      name: selectedProUpgradeTier.name,
      billingInterval,
    };

    upgradePro(proPlan);
    
    addInvoice({
      date: new Date(),
      amount: price,
      description: `Upgraded to ${selectedProUpgradeTier.name} (${billingInterval})`,
      status: 'paid',
    });

    setShowProUpgradePayment(false);
  };

  // Free User View
  if (user.plan === 'free') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Your Plan</h1>
        </div>

        <QuickStatsCard user={user} totalCredits={totalCredits} usedCredits={usedCredits} />

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-primary/50 flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upgrade to Pro</CardTitle>
                <div className="flex items-center gap-2 shrink-0">
                  <Label htmlFor="annual-toggle-free" className="text-sm cursor-pointer whitespace-nowrap">
                    Annual <span className="text-primary font-medium">(20% off)</span>
                  </Label>
                  <Switch
                    id="annual-toggle-free"
                    checked={isAnnualBilling}
                    onCheckedChange={setIsAnnualBilling}
                  />
                </div>
              </div>
              <CardDescription>Get more credits and premium features</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1 flex flex-col">
                <div>
                  {isAnnualBilling ? (
                    <>
                      <div className="text-3xl font-bold">${selectedTier.annualPrice}/yr</div>
                      <p className="text-sm text-muted-foreground">
                        ${getMonthlyEquivalent(selectedTier)}/month · {selectedTier.credits.toLocaleString()} credits per month
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold">${selectedTier.price}/mo</div>
                      <p className="text-sm text-muted-foreground">
                        {selectedTier.credits.toLocaleString()} credits per month
                      </p>
                    </>
                  )}
                </div>

                <Select
                  value={selectedTier.credits.toString()}
                  onValueChange={(value) => {
                    const tier = PRICING.PRO_TIERS.find(t => t.credits.toString() === value);
                    if (tier) setSelectedTier(tier);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING.PRO_TIERS.map((tier) => (
                      <SelectItem key={tier.credits} value={tier.credits.toString()}>
                        {tier.credits.toLocaleString()} credits / month ({isAnnualBilling ? `$${tier.annualPrice}/yr` : `$${tier.price}/mo`})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <ul className="space-y-2 text-sm pt-2">
                  <li className="flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                    Multiple tier options
                  </li>
                  <li className="flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                    Buy additional credits
                  </li>
                  <li className="flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                    Priority support
                  </li>
                </ul>

                <div className="mt-auto pt-4">
                  <Button className="w-full" onClick={handleUpgradeToPro}>
                    Upgrade to Pro {isAnnualBilling ? `- $${selectedTier.annualPrice}/yr` : `- $${selectedTier.price}/mo`}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>Upgrade to Teams</CardTitle>
              <CardDescription>Collaborate with your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">${totalTeamsMonthly}/mo</div>
                  <p className="text-sm text-muted-foreground">
                    {selectedTeamsTier.credits.toLocaleString()} shared credits
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="seats" className="text-sm font-medium">
                    Add seats to team plan
                  </label>
                  <Input
                    id="seats"
                    type="number"
                    min="0"
                    value={teamSeats}
                    onChange={(e) => setTeamSeats(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <p className="text-xs text-muted-foreground">
                    ${PRICING.SEAT_PRICE}/seat/month = ${seatsCost}/month
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Add credits to team plan</label>
                  <Select
                    value={selectedTeamsTier.credits.toString()}
                    onValueChange={(value) => {
                      const tier = PRICING.TEAMS_TIERS.find(t => t.credits.toString() === value);
                      if (tier) setSelectedTeamsTier(tier);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICING.TEAMS_TIERS.map((tier) => (
                        <SelectItem key={tier.credits} value={tier.credits.toString()}>
                          {tier.credits.toLocaleString()} credits / month (${tier.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {teamSeats > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Plan cost</span>
                      <span>${selectedTeamsTier.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Seats ({teamSeats} × ${PRICING.SEAT_PRICE})</span>
                      <span>${seatsCost}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-sm font-medium">
                      <span>Avg credits/seat</span>
                      <span>{avgCreditsPerSeat}</span>
                    </div>
                  </div>
                )}

                {showWarning && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Below recommended {MIN_AVG_CREDITS_PER_SEAT} credits/seat. Consider a higher plan.
                    </AlertDescription>
                  </Alert>
                )}

                <ul className="space-y-2 text-sm pt-2">
                  <li className="flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                    Manage team members
                  </li>
                  <li className="flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                    Shared credit pool
                  </li>
                  <li className="flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                    Set credit limits per user
                  </li>
                </ul>

                <Button className="w-full" onClick={handleUpgradeToTeams}>
                  {teamSeats > 0 ? `Upgrade to Teams - $${totalTeamsMonthly} / month` : 'Upgrade to Teams'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {user.invoices.length > 0 && (
          <BillingInvoicesCard variant="invoices-only" />
        )}

        <PaymentModal
          open={showPayment}
          onOpenChange={setShowPayment}
          title="Confirm Pro Subscription"
          description={`You're subscribing to ${selectedTier.name} with ${selectedTier.credits.toLocaleString()} monthly credits (${isAnnualBilling ? 'annual' : 'monthly'} billing).`}
          amount={isAnnualBilling ? selectedTier.annualPrice : selectedTier.price}
          onConfirm={handleConfirmPayment}
        />

        <PaymentModal
          open={showTeamsPayment}
          onOpenChange={setShowTeamsPayment}
          title="Paying on Stripe for Teams Subscription"
          description="This is a dummy Stripe Payment modal"
          amount={totalTeamsMonthly}
          onConfirm={handleConfirmTeamsPayment}
        />
      </div>
    );
  }

  // Pro User View
  if (user.plan === 'pro') {
    const isCancelled = user.planStatus === 'cancelled';
    const daysRemaining = getDaysUntilExpiry(user.billingCycleEnd);
    const expiryDate = user.billingCycleEnd ? new Date(user.billingCycleEnd).toLocaleDateString() : 'N/A';
    const remainingProCredits = user.credits - user.creditsUsed;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Your Plan</h1>
          <p className="text-muted-foreground">Manage your Pro subscription</p>
        </div>

        {isCancelled && (
          <Alert variant="destructive">
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Your Pro plan has been cancelled</p>
                <p className="text-sm">
                  Your plan will expire on <strong>{expiryDate}</strong> ({daysRemaining} days remaining).
                  After expiration, you will be downgraded to Free plan with a maximum of 150 credits.
                </p>
                <p className="text-sm mt-2">
                  You can <strong>reactivate your plan</strong> (no payment required) or <strong>process the billing cycle early</strong> to downgrade immediately in the Billing & Invoices section below.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Upgrade to Teams Section */}
        <Card className="border-primary/50 bg-primary/5 py-0">
          <CardContent className="pt-6">
            {/* Header with Buttons */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Unlock team collaboration - Upgrade to Teams</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add team members, share credits, and collaborate seamlessly
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {showUpgradeConfig && (
                  <Button variant="outline" onClick={() => setShowUpgradeConfig(false)}>
                    Cancel
                  </Button>
                )}
                <Button onClick={() => showUpgradeConfig ? handleConfirmUpgrade() : setShowUpgradeConfig(true)}>
                  Upgrade to Teams
                </Button>
              </div>
            </div>

            {/* Two Column Configuration */}
            {showUpgradeConfig && (
              <>
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column - Configuration */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="upgrade-seats" className="text-sm font-medium">
                        Number of Seats
                      </label>
                      <Input
                        id="upgrade-seats"
                        type="number"
                        min="2"
                        value={upgradeSeats}
                        onChange={(e) => setUpgradeSeats(Math.max(2, parseInt(e.target.value) || 2))}
                      />
                      <p className="text-xs text-muted-foreground">
                        ${PRICING.SEAT_PRICE}/seat/month = ${upgradeSeats * PRICING.SEAT_PRICE}/month
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Credit Plan</label>
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

                    {/* Credit Distribution Info */}
                    <Alert className="border-muted bg-muted/50">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">Credit Distribution</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {upgradeSelectedTier.credits.toLocaleString()} shared credits across {upgradeSeats} seats
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Avg per seat</p>
                              <p className="text-lg font-semibold">
                                {Math.floor(upgradeSelectedTier.credits / upgradeSeats).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {Math.floor(upgradeSelectedTier.credits / upgradeSeats) < MIN_AVG_CREDITS_PER_SEAT && (
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
                  </div>

                  {/* Right Column - Summary */}
                  <div className="space-y-4">
                    {/* Summary Section */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Plan</span>
                            <span className="font-medium">{upgradeSelectedTier.name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Seats</span>
                            <span className="font-medium">{upgradeSeats}</span>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Seats ({upgradeSeats} × ${PRICING.SEAT_PRICE})
                            </span>
                            <span>${upgradeSeats * PRICING.SEAT_PRICE}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Credits</span>
                            <span>${upgradeSelectedTier.price}</span>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex justify-between font-semibold">
                          <span>Monthly Billing</span>
                          <span className="text-xl">
                            ${upgradeSeats * PRICING.SEAT_PRICE + upgradeSelectedTier.price}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* No Proration Info for Annual Pro Users */}
                {user.proPlan?.billingInterval === 'annual' && (
                  <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                    <Info className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm">
                      Teams is billed monthly. You will be charged the full monthly amount — no proration for remaining time on your annual Pro plan.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Credit Transfer Info - Full Width */}
                {remainingProCredits > 0 && (
                  <Alert className="border-primary/50 bg-primary/5">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm">
                      <p>Your remaining {remainingProCredits.toLocaleString()} Pro credits will be added to your Teams shared credit pool.</p>
                      <div className="mt-2 pt-2 border-t border-primary/20">
                        <div className="flex justify-between text-xs">
                          <span>Teams credits:</span>
                          <span className="font-medium">{upgradeSelectedTier.credits.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Pro credits transferred:</span>
                          <span className="font-medium">+{remainingProCredits.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold mt-1 pt-1 border-t border-primary/20">
                          <span>Total credits:</span>
                          <span>{(upgradeSelectedTier.credits + remainingProCredits).toLocaleString()}</span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <QuickStatsCard user={user} totalCredits={totalCredits} usedCredits={usedCredits} />

        {/* 2-Column Layout for Pro Plan Options */}
        {!isCancelled && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Column 1: Get More from Pro */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Get More from Pro</CardTitle>
                    <CardDescription>Upgrade to a higher plan tier for more monthly credits</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Label htmlFor="annual-toggle-pro" className="text-sm cursor-pointer whitespace-nowrap">
                      Annual <span className="text-primary font-medium">(20% off)</span>
                    </Label>
                    <Switch
                      id="annual-toggle-pro"
                      checked={isAnnualBillingUpgrade}
                      onCheckedChange={setIsAnnualBillingUpgrade}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Higher Tier</label>
                  <Select
                    value={selectedProUpgradeTier?.credits.toString() || user.proPlan?.monthlyCredits.toString() || ''}
                    onValueChange={(value) => {
                      const tier = PRICING.PRO_TIERS.find(t => t.credits.toString() === value);
                      if (tier) setSelectedProUpgradeTier(tier);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Current Plan Option */}
                      {user.proPlan && (
                        <SelectItem value={user.proPlan.monthlyCredits.toString()}>
                          {user.proPlan.name} - {user.proPlan.monthlyCredits.toLocaleString()} credits/month (${user.proPlan.price}{user.proPlan.billingInterval === 'annual' ? '/yr' : '/mo'}) - Current Plan
                        </SelectItem>
                      )}
                      {/* Higher Tier Options */}
                      {PRICING.PRO_TIERS
                        .filter(tier => user.proPlan && tier.credits > user.proPlan.monthlyCredits)
                        .map((tier) => (
                          <SelectItem key={tier.credits} value={tier.credits.toString()}>
                            {tier.name} - {tier.credits.toLocaleString()} credits/month ({isAnnualBillingUpgrade ? `$${tier.annualPrice}/yr` : `$${tier.price}/mo`})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Benefits List */}
                <ul className="space-y-2 text-sm pt-2">
                  <li className="flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                    Higher monthly credit allocation
                  </li>
                  <li className="flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                    Better value per credit
                  </li>
                  <li className="flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                    Priority customer support
                  </li>
                  <li className="flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                    Advanced analytics & insights
                  </li>
                </ul>

                <Button 
                  className="w-full" 
                  onClick={handleUpgradeProTier}
                  disabled={!selectedProUpgradeTier || (selectedProUpgradeTier && user.proPlan && selectedProUpgradeTier.credits === user.proPlan.monthlyCredits)}
                >
                  {selectedProUpgradeTier && user.proPlan && selectedProUpgradeTier.credits === user.proPlan.monthlyCredits
                    ? 'Current Plan'
                    : selectedProUpgradeTier 
                    ? `Upgrade Plan - ${isAnnualBillingUpgrade ? `$${selectedProUpgradeTier.annualPrice}/yr` : `$${selectedProUpgradeTier.price}/mo`}`
                    : 'Upgrade Plan'}
                </Button>
              </CardContent>
            </Card>

            {/* Column 2: Buy Extra Credits */}
            <Card>
              <CardHeader>
                <CardTitle>Buy extra credits</CardTitle>
                <CardDescription>
                  Purchase one-time credits. Extra credits get added to your available credits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Warning for cancelled plan */}
                {isCancelled && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <p className="font-medium">Your plan is cancelled</p>
                      <p className="text-xs mt-1">
                        These extra credits will expire when your plan ends on {expiryDate}. 
                        Consider reactivating your plan or upgrading to preserve your credits.
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

                <Button 
                  className="w-full" 
                  onClick={handlePurchaseExtraCredits}
                  disabled={getTotalExtraCredits() === 0}
                >
                  {getTotalExtraCredits() > 0 
                    ? isCancelled 
                      ? `Purchase ${getTotalExtraCredits().toLocaleString()} Credits - $${getTotalExtraPrice()} (Will Expire)`
                      : `Purchase ${getTotalExtraCredits().toLocaleString()} Credits - $${getTotalExtraPrice()}`
                    : 'Select credit packs to purchase'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <UsageSummaryCard usedCredits={usedCredits} totalCredits={totalCredits} />

        <BillingInvoicesCard variant="full" />

        {/* Payment Modal for Pro to Teams Upgrade */}
        <PaymentModal
          open={showTeamsPayment}
          onOpenChange={setShowTeamsPayment}
          title="Authorize Teams Subscription Payment"
          description={`You're upgrading to ${upgradeSelectedTier.name} with ${upgradeSeats} seats.${user.proPlan?.billingInterval === 'annual' ? ' Teams is billed monthly — no proration for remaining annual Pro time.' : ''} Your remaining Pro credits will be transferred.`}
          amount={upgradeSeats * PRICING.SEAT_PRICE + upgradeSelectedTier.price}
          onConfirm={handleProToTeamsUpgrade}
        />

        {/* Buy Extra Credits Modal */}
        <BuyCreditsModal
          open={showBuyExtraCredits}
          onOpenChange={setShowBuyExtraCredits}
          onPurchase={handleBuyExtraCredits}
          mode="extra"
        />

        {/* Pro Upgrade Payment Modal */}
        <PaymentModal
          open={showProUpgradePayment}
          onOpenChange={setShowProUpgradePayment}
          title="Confirm Plan Upgrade"
          description={selectedProUpgradeTier ? `You're upgrading to ${selectedProUpgradeTier.name} with ${selectedProUpgradeTier.credits.toLocaleString()} monthly credits (${isAnnualBillingUpgrade ? 'annual' : 'monthly'} billing).` : ''}
          amount={selectedProUpgradeTier ? (isAnnualBillingUpgrade ? selectedProUpgradeTier.annualPrice : selectedProUpgradeTier.price) : 0}
          onConfirm={handleConfirmProUpgrade}
        />

        {/* Extra Credits Payment Modal */}
        <PaymentModal
          open={showExtraCreditPayment}
          onOpenChange={setShowExtraCreditPayment}
          title="Authorize Extra Credits Payment"
          description={`You're purchasing ${getTotalExtraCredits().toLocaleString()} extra credits. These will be added to your available credits.`}
          amount={getTotalExtraPrice()}
          onConfirm={handleConfirmExtraCreditPayment}
        />

      </div>
    );
  }

  // Teams User View
  if (user.plan === 'teams') {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Plan</h1>
            <p className="text-muted-foreground">Team subscription overview</p>
          </div>
          <Button onClick={() => router.push('/teams/manage')}>
            Manage Plan
          </Button>
        </div>

        <QuickStatsCard user={user} totalCredits={totalCredits} usedCredits={usedCredits} />

        <UsageSummaryCard usedCredits={usedCredits} totalCredits={totalCredits} />
      </div>
    );
  }

  return null;
}
