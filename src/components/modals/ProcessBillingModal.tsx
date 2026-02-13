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

interface ProcessBillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: 'pro' | 'teams';
  currentCredits: number;
  onConfirm: () => void;
}

export function ProcessBillingModal({
  open,
  onOpenChange,
  planType,
  currentCredits,
  onConfirm,
}: ProcessBillingModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Process Billing Cycle Early
          </DialogTitle>
          <DialogDescription>
            This will immediately downgrade your account. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Warning: This action cannot be undone</p>
                {planType === 'pro' ? (
                  <ul className="text-sm space-y-1 mt-2">
                    <li>• You will be <strong>immediately downgraded to Free plan</strong></li>
                    <li>• Your credits will be <strong>capped at 150</strong> (you currently have {currentCredits.toLocaleString()})</li>
                    {currentCredits > 150 && (
                      <li className="text-destructive font-medium">
                        • You will <strong>lose {(currentCredits - 150).toLocaleString()} credits</strong>
                      </li>
                    )}
                    <li>• You will lose access to all Pro features</li>
                    <li>• Any extra credits will be <strong>permanently removed</strong></li>
                  </ul>
                ) : (
                  <ul className="text-sm space-y-1 mt-2">
                    <li>• All team credits will be <strong>immediately consumed</strong></li>
                    <li>• Team members will still have access but with 0 shared credits</li>
                    <li>• You can delete the team or reactivate with a new billing cycle</li>
                    <li>• Any extra credits will be <strong>permanently removed</strong></li>
                  </ul>
                )}
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Alternative:</strong> You can wait for your billing cycle to end naturally, or reactivate your plan 
              to continue using {planType === 'pro' ? 'Pro' : 'Teams'} features.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Confirm & Downgrade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
