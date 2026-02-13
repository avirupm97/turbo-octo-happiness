import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Trash2 } from 'lucide-react';
import { getDaysUntilExpiry } from '@/lib/billing-utils';

interface DeleteTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
  memberCount: number;
  billingCycleEnd?: Date;
  planStatus?: 'active' | 'cancellation-pending' | 'cancelled';
  onConfirm: () => void;
}

export function DeleteTeamModal({
  open,
  onOpenChange,
  teamName,
  memberCount,
  billingCycleEnd,
  planStatus,
  onConfirm,
}: DeleteTeamModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const daysRemaining = getDaysUntilExpiry(billingCycleEnd);
  const isConfirmed = confirmText === teamName;
  const isInGracePeriod = (planStatus === 'cancelled' || planStatus === 'cancellation-pending') && daysRemaining > 0;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      onOpenChange(false);
      setConfirmText('');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setConfirmText('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Team Permanently
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the team and affect all members.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Warning: Immediate Consequences</p>
                <ul className="text-sm space-y-1 mt-2">
                  <li>• All <strong>{memberCount} team members</strong> will be moved to Free plan</li>
                  <li>• All members will have <strong>0 credits</strong></li>
                  <li>• Team invoices will be distributed to all members</li>
                  <li>• Team pages will no longer be accessible</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {isInGracePeriod && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Grace Period Loss</p>
                <p className="text-sm mt-1">
                  You still have <strong>{daysRemaining} days</strong> of team access remaining. By deleting now, all members will immediately lose access to team features.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="confirm-team-name" className="text-sm font-medium">
              Type <span className="font-mono font-bold">{teamName}</span> to confirm:
            </label>
            <Input
              id="confirm-team-name"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={teamName}
              className="font-mono"
            />
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>What happens next:</strong> All team members will receive a copy of the team&apos;s invoice history in their individual accounts for their records.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed}
          >
            Delete Team Forever
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
