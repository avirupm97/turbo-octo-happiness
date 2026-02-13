'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, creditLimit?: number) => void;
}

export function InviteMemberModal({ open, onOpenChange, onInvite }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [creditLimit, setCreditLimit] = useState('');

  const handleInvite = () => {
    if (email) {
      onInvite(email, creditLimit ? parseInt(creditLimit) : undefined);
      setEmail('');
      setCreditLimit('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>Add a new member to your team</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="creditLimit" className="text-sm font-medium">
              Credit Limit (Optional)
            </label>
            <Input
              id="creditLimit"
              type="number"
              placeholder="No limit"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Set a maximum credit usage limit for this member
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={!email}>
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
