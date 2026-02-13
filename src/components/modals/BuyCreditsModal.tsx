'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditWarningModal } from '@/components/modals/CreditWarningModal';
import { useAuthStore } from '@/stores/useAuthStore';
import { PRICING } from '@/lib/constants';
import { Check } from 'lucide-react';

interface BuyCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase: (credits: number, price: number) => void;
  mode?: 'regular' | 'extra';
}

export function BuyCreditsModal({ open, onOpenChange, onPurchase, mode = 'regular' }: BuyCreditsModalProps) {
  const user = useAuthStore((state) => state.getCurrentUser());
  const [selected, setSelected] = useState<{ credits: number; price: number } | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const isCancelled = user?.planStatus === 'cancelled';
  const bundles = mode === 'extra' ? PRICING.EXTRA_CREDIT_BUNDLES : PRICING.CREDIT_BUNDLES;
  const isExtraCredits = mode === 'extra';

  const handlePurchase = () => {
    if (!selected) return;

    // Show warning if plan is cancelled
    if (isCancelled) {
      setShowWarning(true);
    } else {
      completePurchase();
    }
  };

  const completePurchase = () => {
    if (selected) {
      onPurchase(selected.credits, selected.price);
      onOpenChange(false);
      setSelected(null);
      setShowWarning(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isExtraCredits ? 'Buy Extra Credits' : 'Buy Additional Credits'}</DialogTitle>
            <DialogDescription>
              {isExtraCredits 
                ? 'One-time purchase of extra credits at $10 per 1,000 credits'
                : 'Select a credit bundle to add to your account'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-3 py-4">
            {bundles.map((bundle) => (
              <Card
                key={bundle.credits}
                className={`cursor-pointer transition-all ${
                  selected?.credits === bundle.credits
                    ? 'border-primary ring-2 ring-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelected(bundle)}
              >
                <CardHeader>
                  <CardTitle className="text-2xl">${bundle.price}</CardTitle>
                  <CardDescription>{bundle.credits} credits</CardDescription>
                </CardHeader>
                <CardContent>
                  {selected?.credits === bundle.credits && (
                    <div className="flex items-center text-sm text-primary">
                      <Check className="h-4 w-4 mr-2" />
                      Selected
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={!selected}>
              {isExtraCredits ? 'Purchase Extra Credits' : 'Purchase Credits'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selected && (
        <CreditWarningModal
          open={showWarning}
          onOpenChange={setShowWarning}
          planType={user?.plan === 'pro' ? 'pro' : 'teams'}
          billingCycleEnd={user?.billingCycleEnd}
          credits={selected.credits}
          price={selected.price}
          onConfirm={completePurchase}
        />
      )}
    </>
  );
}
