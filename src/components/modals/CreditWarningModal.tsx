import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface CreditWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: 'pro' | 'teams';
  billingCycleEnd?: Date;
  credits: number;
  price: number;
  onConfirm: () => void;
}

export function CreditWarningModal({
  open,
  onOpenChange,
  planType,
  billingCycleEnd,
  credits,
  price,
  onConfirm,
}: CreditWarningModalProps) {
  const expiryDate = billingCycleEnd ? new Date(billingCycleEnd).toLocaleDateString() : 'N/A';

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Plan Cancelled - Credit Purchase Warning
          </DialogTitle>
          <DialogDescription>
            Your {planType === 'pro' ? 'Pro' : 'Teams'} plan is currently cancelled and will expire soon.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Important: Credits May Be Lost</p>
                <p className="text-sm mt-2">
                  You're about to purchase <strong>{credits.toLocaleString()} credits</strong> for <strong>${price}</strong>.
                </p>
                <p className="text-sm">
                  However, your plan is set to expire on <strong>{expiryDate}</strong>.
                </p>
                <p className="text-sm mt-2">
                  {planType === 'pro' ? (
                    <>These credits will be <strong>lost when you downgrade to Free plan</strong> unless you reactivate or upgrade before expiration.</>
                  ) : (
                    <>These credits will be <strong>lost when the billing cycle ends</strong> unless you reactivate or upgrade before expiration.</>
                  )}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium mb-2">To keep your purchased credits:</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Reactivate your current plan (same tier)</li>
              <li>• Upgrade to a higher tier before {expiryDate}</li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3 rounded-lg">
            <p className="text-sm">
              <strong>Recommendation:</strong> Consider reactivating your plan first, then purchase credits to ensure you don't lose your investment.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel Purchase
          </Button>
          <Button variant="default" onClick={handleConfirm}>
            Purchase Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
