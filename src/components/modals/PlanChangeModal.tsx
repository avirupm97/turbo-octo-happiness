'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface PlanChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remainingCredits: number;
  newBillingAmount: number;
  onConfirm: () => void;
}

export function PlanChangeModal({
  open,
  onOpenChange,
  remainingCredits,
  newBillingAmount,
  onConfirm,
}: PlanChangeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Change Team Plan
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-3 pt-2">
              <p>
                This will cancel your current plan immediately. You will be moved to the new plan.
              </p>
              {remainingCredits > 0 && (
                <p className="font-medium">
                  Any remaining credits ({remainingCredits.toLocaleString()} credits) will be added
                  to the new plan.
                </p>
              )}
              <p className="font-semibold text-foreground">
                New billing: ${newBillingAmount}/month starting {new Date().toLocaleDateString()}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm Change</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
