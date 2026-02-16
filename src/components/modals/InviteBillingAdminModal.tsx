'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { TeamMember, BillingAdmin } from '@/lib/types';

interface InviteBillingAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string) => void;
  members: TeamMember[];
  billingAdmins: BillingAdmin[];
}

export function InviteBillingAdminModal({ 
  open, 
  onOpenChange, 
  onInvite,
  members,
  billingAdmins,
}: InviteBillingAdminModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleInvite = () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    // Check if email is already a team member
    const isMember = members.some((member) => member.email.toLowerCase() === email.toLowerCase());
    if (isMember) {
      setError('This email is already a team member. Remove them as a member first to add as billing admin.');
      return;
    }

    // Check if email is already a billing admin
    const isAlreadyBillingAdmin = billingAdmins.some((admin) => admin.email.toLowerCase() === email.toLowerCase());
    if (isAlreadyBillingAdmin) {
      setError('This email is already a billing admin');
      return;
    }

    onInvite(email);
    setEmail('');
    setError('');
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmail('');
      setError('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Billing Admin</DialogTitle>
          <DialogDescription>
            Add a billing administrator to your team. Billing admins have full admin permissions but cannot use team credits.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInvite();
                }
              }}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
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
