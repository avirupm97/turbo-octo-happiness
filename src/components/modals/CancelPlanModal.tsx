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
import { AlertCircle, Calendar } from 'lucide-react';
import { getDaysUntilExpiry } from '@/lib/billing-utils';

interface CancelPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: 'pro' | 'teams';
  billingCycleEnd?: Date;
  onConfirm: () => void;
}

export function CancelPlanModal({
  open,
  onOpenChange,
  planType,
  billingCycleEnd,
  onConfirm,
}: CancelPlanModalProps) {
  const daysRemaining = getDaysUntilExpiry(billingCycleEnd);
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
            <AlertCircle className="h-5 w-5 text-destructive" />
            Cancel {planType === 'pro' ? 'Pro' : 'Teams'} Plan
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your plan? This action will start the cancellation process.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Grace Period Details</p>
                <ul className="text-sm space-y-1 mt-2">
                  <li>• Your plan will remain active until <strong>{expiryDate}</strong></li>
                  <li>• You have <strong>{daysRemaining} days</strong> of access remaining</li>
                  <li>• You can reactivate anytime before expiration</li>
                  <li>• All features remain available during this period</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">What happens after processing billing cycle:</p>
                {planType === 'pro' ? (
                  <ul className="text-sm space-y-1 mt-2">
                    <li>• Your account will downgrade to Free plan</li>
                    <li>• Credits will be capped at 150 (if you have more)</li>
                    <li>• Pro features will no longer be available</li>
                  </ul>
                ) : (
                  <ul className="text-sm space-y-1 mt-2">
                    <li>• All team credits will be marked as consumed</li>
                    <li>• Team members will still have access until expiration</li>
                    <li>• You can delete the team or reactivate with a new billing cycle</li>
                    <li>• Quick actions (add seats, upgrade) will be disabled</li>
                  </ul>
                )}
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> {planType === 'teams' 
                ? 'You can still add seats or upgrade your plan during this period to reactivate. Credits purchased during this period will be available until the billing cycle is processed.'
                : 'Any credits purchased during the grace period will be lost upon downgrade unless you reactivate or upgrade your plan.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Plan
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
