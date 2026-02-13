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
import { CheckCircle2, Calendar } from 'lucide-react';

interface ReactivatePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: 'pro' | 'teams';
  planName?: string;
  billingCycleEnd?: Date;
  monthlyPrice?: number;
  onConfirm: () => void;
}

export function ReactivatePlanModal({
  open,
  onOpenChange,
  planType,
  planName,
  billingCycleEnd,
  monthlyPrice,
  onConfirm,
}: ReactivatePlanModalProps) {
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
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Reactivate Your {planType === 'pro' ? 'Pro' : 'Teams'} Plan
          </DialogTitle>
          <DialogDescription>
            Your plan will be reactivated and continue until the current billing cycle ends.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-primary/50 bg-primary/5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Reactivation Details</p>
                <ul className="text-sm space-y-1 mt-2">
                  {planName && <li>• Plan: <strong>{planName}</strong></li>}
                  <li>• Your plan will continue until <strong>{expiryDate}</strong></li>
                  <li>• <strong>No payment required now</strong> - just reactivating your existing subscription</li>
                  {monthlyPrice && (
                    <li>• Your next payment of <strong>${monthlyPrice}</strong> will be on <strong>{expiryDate}</strong></li>
                  )}
                  <li>• All {planType === 'pro' ? 'Pro' : 'Teams'} features will be immediately available</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> By reactivating, your billing will resume on the original schedule. 
              You can manage your subscription anytime from the Billing & Invoices section.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Reactivate Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
