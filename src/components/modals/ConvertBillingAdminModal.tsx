'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ConvertBillingAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  email: string;
}

export function ConvertBillingAdminModal({ 
  open, 
  onOpenChange, 
  onConfirm,
  email,
}: ConvertBillingAdminModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add as Team Member</DialogTitle>
          <DialogDescription>
            This will convert {email} from a billing admin to a team member.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This user will be removed as a Billing Admin and added to the team. 
              They will now be able to use team credits and will occupy a team seat. 
              They will get access to Your Plan and Usage tabs like other members.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
