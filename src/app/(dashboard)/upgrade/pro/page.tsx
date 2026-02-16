'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PaymentModal } from '@/components/modals/PaymentModal';
import { PRICING } from '@/lib/constants';
import type { BillingInterval } from '@/lib/types';
import { Check } from 'lucide-react';

export default function UpgradeProPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.getCurrentUser());
  const upgradeToProPlan = useAuthStore((state) => state.upgradeToProPlan);
  const upgradePro = useAuthStore((state) => state.upgradePro);
  const addInvoice = useAuthStore((state) => state.addInvoice);
  
  const [selectedTier, setSelectedTier] = useState<typeof PRICING.PRO_TIERS[number] | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);

  if (!user) return null;

  const currentCredits = user.proPlan?.monthlyCredits || 0;
  const availableTiers = user.plan === 'pro' 
    ? PRICING.PRO_TIERS.filter(tier => tier.credits > currentCredits)
    : PRICING.PRO_TIERS;

  const handleSelectTier = (tier: typeof PRICING.PRO_TIERS[number]) => {
    setSelectedTier(tier);
    setShowPayment(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedTier) return;

    const billingInterval: BillingInterval = isAnnualBilling ? 'annual' : 'monthly';
    const price = isAnnualBilling ? selectedTier.annualPrice : selectedTier.price;
    const proPlan = {
      monthlyCredits: selectedTier.credits,
      price,
      name: selectedTier.name,
      billingInterval,
    };

    if (user.plan === 'free') {
      upgradeToProPlan(proPlan);
    } else {
      upgradePro(proPlan);
    }

    addInvoice({
      date: new Date(),
      amount: price,
      description: `${selectedTier.name} subscription (${billingInterval})`,
      status: 'paid',
    });

    router.push('/your-plan');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {user.plan === 'pro' ? 'Upgrade Pro Plan' : 'Upgrade to Pro'}
          </h1>
          <p className="text-muted-foreground">
            {user.plan === 'pro' 
              ? 'Select a higher tier for more credits' 
              : 'Choose a Pro plan that fits your needs'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Label htmlFor="annual-toggle-upgrade" className="text-sm cursor-pointer whitespace-nowrap">
            Annual <span className="text-primary font-medium">(20% off)</span>
          </Label>
          <Switch
            id="annual-toggle-upgrade"
            checked={isAnnualBilling}
            onCheckedChange={setIsAnnualBilling}
          />
        </div>
      </div>

      {user.plan === 'pro' && (
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>{user.proPlan?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{user.proPlan?.monthlyCredits} credits/mo</p>
                <p className="text-sm text-muted-foreground">
                  ${user.proPlan?.price}{user.proPlan?.billingInterval === 'annual' ? '/year' : '/month'}
                </p>
              </div>
              <Badge>Current</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {availableTiers.map((tier) => (
          <Card
            key={tier.credits}
            className="hover:border-primary transition-all cursor-pointer relative"
          >
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>{tier.credits} credits/month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                {isAnnualBilling ? (
                  <>
                    <div className="text-4xl font-bold">${tier.annualPrice}</div>
                    <p className="text-sm text-muted-foreground">per year (${Math.round(tier.annualPrice / 12)}/month)</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-bold">${tier.price}</div>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </>
                )}
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  {tier.credits} monthly credits
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  Buy additional credits
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  Invoice history
                </li>
              </ul>
              <Button className="w-full" onClick={() => handleSelectTier(tier)}>
                Select Plan {isAnnualBilling ? `- $${tier.annualPrice}/yr` : `- $${tier.price}/mo`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {availableTiers.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              You&apos;re already on the highest Pro tier!
            </p>
          </CardContent>
        </Card>
      )}

      {selectedTier && (
        <PaymentModal
          open={showPayment}
          onOpenChange={setShowPayment}
          title="Confirm Pro Subscription"
          description={`You're subscribing to ${selectedTier.name} with ${selectedTier.credits.toLocaleString()} monthly credits (${isAnnualBilling ? 'annual' : 'monthly'} billing).`}
          amount={isAnnualBilling ? selectedTier.annualPrice : selectedTier.price}
          onConfirm={handleConfirmPayment}
        />
      )}
    </div>
  );
}
