'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface MakeTeamOwnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  email: string;
}

export function MakeTeamOwnerModal({ 
  open, 
  onOpenChange, 
  onConfirm,
  email,
}: MakeTeamOwnerModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make Team Admin</DialogTitle>
          <DialogDescription>
            Promote {email} to Team Admin role.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This member will be promoted to Team Admin with full admin privileges. Multiple team admins are allowed.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Make Admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
