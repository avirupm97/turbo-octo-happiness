'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { PaymentModal } from '@/components/modals/PaymentModal';
import { PRICING, MIN_AVG_CREDITS_PER_SEAT } from '@/lib/constants';
import { AlertCircle, Check } from 'lucide-react';

export default function UpgradeTeamsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.getCurrentUser());
  const upgradeToTeamsPlan = useAuthStore((state) => state.upgradeToTeamsPlan);
  const addInvoice = useAuthStore((state) => state.addInvoice);

  const [seats, setSeats] = useState(5);
  const [teamName, setTeamName] = useState('My Team');
  const [selectedPlan, setSelectedPlan] = useState<typeof PRICING.TEAMS_TIERS[number]>(PRICING.TEAMS_TIERS[0]);
  const [showPayment, setShowPayment] = useState(false);

  if (!user) return null;

  const seatsCost = seats * PRICING.SEAT_PRICE;
  const totalMonthly = seatsCost + selectedPlan.price;
  const avgCreditsPerSeat = Math.floor(selectedPlan.credits / seats);
  const showWarning = avgCreditsPerSeat < MIN_AVG_CREDITS_PER_SEAT;

  const handleConfirmPayment = () => {
    const teamsPlan = {
      teamName,
      seats,
      monthlyCredits: selectedPlan.credits,
      sharedCredits: selectedPlan.credits,
      sharedCreditsUsed: 0,
      planName: selectedPlan.name,
      members: [],
    };

    upgradeToTeamsPlan(teamsPlan);

    addInvoice({
      date: new Date(),
      amount: totalMonthly,
      description: `${selectedPlan.name} - ${seats} seats`,
      status: 'paid',
    });

    router.push('/teams/members');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upgrade to Teams</h1>
        <p className="text-muted-foreground">Configure your team plan and seats</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Configuration</CardTitle>
              <CardDescription>Set up your team name and seats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="teamName" className="text-sm font-medium">
                  Team Name
                </label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="seats" className="text-sm font-medium">
                  Number of Seats
                </label>
                <Input
                  id="seats"
                  type="number"
                  min="2"
                  value={seats}
                  onChange={(e) => setSeats(Math.max(2, parseInt(e.target.value) || 2))}
                />
                <p className="text-sm text-muted-foreground">
                  ${PRICING.SEAT_PRICE}/seat/month = ${seatsCost}/month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Plan</CardTitle>
              <CardDescription>Choose your shared credit allocation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {PRICING.TEAMS_TIERS.map((tier) => (
                <div
                  key={tier.credits}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPlan.credits === tier.credits
                      ? 'border-primary bg-accent'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPlan(tier)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{tier.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {tier.credits} shared credits/month
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">${tier.price}</p>
                      <p className="text-sm text-muted-foreground">+seats cost</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Review your team plan details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Team Name</span>
                  <span className="font-medium">{teamName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="font-medium">{seats}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Seats ({seats} × ${PRICING.SEAT_PRICE})</span>
                  <span>${seatsCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span>${selectedPlan.price}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="font-semibold">Total Monthly</span>
                <span className="text-2xl font-bold">${totalMonthly}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credit Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-accent rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Shared Credits</p>
                  <p className="text-3xl font-bold">{selectedPlan.credits}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    across {seats} seats
                  </p>
                </div>
              </div>

              <div className="flex justify-center items-center gap-2 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Avg per seat</p>
                  <p className="text-xl font-semibold">{avgCreditsPerSeat}</p>
                </div>
              </div>

              {showWarning && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Average credits per seat is below recommended minimum of {MIN_AVG_CREDITS_PER_SEAT}.
                    Consider selecting a higher plan or reducing seats.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Button size="lg" className="w-full" onClick={() => setShowPayment(true)}>
            Continue to Payment
          </Button>
        </div>
      </div>

      <PaymentModal
        open={showPayment}
        onOpenChange={setShowPayment}
        title="Confirm Teams Subscription"
        description={`You're subscribing to ${selectedPlan.name} with ${seats} seats. Credits will be shared across your team.`}
        amount={totalMonthly}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}
