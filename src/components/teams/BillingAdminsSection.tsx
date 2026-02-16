'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { InviteBillingAdminModal } from '@/components/modals/InviteBillingAdminModal';
import { ConvertBillingAdminModal } from '@/components/modals/ConvertBillingAdminModal';
import { UserPlus, MoreVertical, UserMinus, Users, UserCheck } from 'lucide-react';
import type { BillingAdmin, TeamMember } from '@/lib/types';

interface BillingAdminsSectionProps {
  billingAdmins: BillingAdmin[];
  members: TeamMember[];
  currentUserEmail: string;
  canManageBillingAdmins: boolean;
  availableSeats: number;
  onInvite: (email: string) => void;
  onRemove: (email: string) => void;
  onConvertToMember: (email: string) => void;
  onMarkAsActive: (email: string) => void;
}

export function BillingAdminsSection({
  billingAdmins,
  members,
  currentUserEmail,
  canManageBillingAdmins,
  availableSeats,
  onInvite,
  onRemove,
  onConvertToMember,
  onMarkAsActive,
}: BillingAdminsSectionProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<string>('');

  const handleRemove = (email: string) => {
    if (confirm(`Are you sure you want to remove ${email} as a billing admin?`)) {
      onRemove(email);
    }
  };

  const handleConvertToMember = (email: string) => {
    setSelectedAdmin(email);
    setShowConvertModal(true);
  };

  const confirmConvert = () => {
    if (selectedAdmin) {
      onConvertToMember(selectedAdmin);
      setSelectedAdmin('');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Billing Admins</CardTitle>
              <CardDescription>
                {billingAdmins.length === 0
                  ? 'No billing admins yet'
                  : `${billingAdmins.length} billing admin${billingAdmins.length === 1 ? '' : 's'}`}
              </CardDescription>
            </div>
            {canManageBillingAdmins && (
              <Button variant="outline" size="sm" onClick={() => setShowInviteModal(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Billing Admin
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {billingAdmins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
              <p className="mb-2">No billing admins in your team</p>
              {canManageBillingAdmins && (
                <p className="text-sm max-w-[500px]">
                  Billing admins have full admin permissions but cannot use team credits. Billing admin seats are not charged.
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invited</TableHead>
                  {canManageBillingAdmins && <TableHead className="w-[70px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingAdmins.map((admin) => (
                  <TableRow key={admin.email}>
                    <TableCell className="font-medium">{admin.email}</TableCell>
                    <TableCell>
                      {admin.status === 'pending' ? 'Invited' : 'Active'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(admin.invitedAt).toLocaleDateString()}
                    </TableCell>
                    {canManageBillingAdmins && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {admin.status === 'pending' && (
                              <DropdownMenuItem onClick={() => onMarkAsActive(admin.email)}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Mark as Active
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleConvertToMember(admin.email)}
                              disabled={availableSeats <= 0}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              Add as Team Member
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRemove(admin.email)}
                              variant="destructive"
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove from Team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InviteBillingAdminModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onInvite={onInvite}
        members={members}
        billingAdmins={billingAdmins}
      />

      <ConvertBillingAdminModal
        open={showConvertModal}
        onOpenChange={setShowConvertModal}
        onConfirm={confirmConvert}
        email={selectedAdmin}
      />
    </>
  );
}
