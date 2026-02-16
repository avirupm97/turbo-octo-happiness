'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { InviteMemberModal } from '@/components/modals/InviteMemberModal';
import { RemoveMemberModal } from '@/components/modals/RemoveMemberModal';
import { ConvertMemberToBillingAdminModal } from '@/components/modals/ConvertMemberToBillingAdminModal';
import { MakeTeamOwnerModal } from '@/components/modals/MakeTeamOwnerModal';
import { BillingAdminsSection } from '@/components/teams/BillingAdminsSection';
import { UserPlus, Settings, MoreVertical, UserMinus, Shield, Crown, UserCheck } from 'lucide-react';

export default function TeamMembersPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.getCurrentUser());
  const isViewingAsBillingAdmin = useAuthStore((state) => state.isViewingAsBillingAdmin());
  const addTeamMember = useAuthStore((state) => state.addTeamMember);
  const inviteBillingAdmin = useAuthStore((state) => state.inviteBillingAdmin);
  const removeBillingAdmin = useAuthStore((state) => state.removeBillingAdmin);
  const convertBillingAdminToMember = useAuthStore((state) => state.convertBillingAdminToMember);
  const removeTeamMember = useAuthStore((state) => state.removeTeamMember);
  const convertMemberToBillingAdmin = useAuthStore((state) => state.convertMemberToBillingAdmin);
  const makeTeamOwner = useAuthStore((state) => state.makeTeamOwner);
  const markMemberAsActive = useAuthStore((state) => state.markMemberAsActive);
  const markBillingAdminAsActive = useAuthStore((state) => state.markBillingAdminAsActive);
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [showConvertToBillingAdminModal, setShowConvertToBillingAdminModal] = useState(false);
  const [showMakeOwnerModal, setShowMakeOwnerModal] = useState(false);
  const [selectedMemberEmail, setSelectedMemberEmail] = useState('');

  // Allow access if user has teams plan OR is viewing as billing admin
  if (!user || (user.plan !== 'teams' && !isViewingAsBillingAdmin) || !user.teamsPlan) {
    return null;
  }

  const handleInviteMember = (email: string, creditLimit?: number) => {
    addTeamMember(email, creditLimit);
  };

  const availableSeats = user.teamsPlan.seats - user.teamsPlan.members.length;

  // Check if current user is Team Admin or Billing Admin
  const currentMember = user.teamsPlan.members.find((m) => m.email === user.email);
  const isTeamOwner = currentMember?.role === 'owner';
  const billingAdmins = user.teamsPlan.billingAdmins || [];
  const isBillingAdmin = billingAdmins.some((admin) => admin.email === user.email && admin.status === 'active');
  const canManageBillingAdmins = isTeamOwner || isBillingAdmin;

  const handleInviteBillingAdmin = (email: string) => {
    inviteBillingAdmin(email);
  };

  const handleRemoveBillingAdmin = (email: string) => {
    removeBillingAdmin(email);
  };

  const handleConvertBillingAdminToMember = (email: string) => {
    convertBillingAdminToMember(email);
  };

  const handleRemoveMember = (email: string) => {
    setSelectedMemberEmail(email);
    setShowRemoveMemberModal(true);
  };

  const handleConvertToBillingAdmin = (email: string) => {
    setSelectedMemberEmail(email);
    setShowConvertToBillingAdminModal(true);
  };

  const handleMakeOwner = (email: string) => {
    setSelectedMemberEmail(email);
    setShowMakeOwnerModal(true);
  };

  const handleMarkAsActive = (email: string) => {
    markMemberAsActive(email);
  };

  const handleMarkBillingAdminAsActive = (email: string) => {
    markBillingAdminAsActive(email);
  };

  const confirmRemoveMember = () => {
    if (selectedMemberEmail) {
      removeTeamMember(selectedMemberEmail);
      setSelectedMemberEmail('');
    }
  };

  const confirmConvertToBillingAdmin = () => {
    if (selectedMemberEmail) {
      convertMemberToBillingAdmin(selectedMemberEmail);
      setSelectedMemberEmail('');
    }
  };

  const confirmMakeOwner = () => {
    if (selectedMemberEmail) {
      makeTeamOwner(selectedMemberEmail);
      setSelectedMemberEmail('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage your team and invite new members</p>
        </div>
        <Button onClick={() => router.push('/teams/manage')}>
          <Settings className="mr-2 h-4 w-4" />
          Manage Team
        </Button>
      </div>

      {availableSeats <= 0 && (
        <Card className="border-primary py-2">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">All seats are occupied</p>
                <p className="text-sm text-muted-foreground">
                  Buy more seats to invite additional members
                </p>
              </div>
              <Button onClick={() => router.push('/teams/manage')}>Buy Seats</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>{user.teamsPlan.members.length}/{user.teamsPlan.seats} seats used</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowInviteModal(true)} disabled={availableSeats <= 0}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Credit Limit</TableHead>
                <TableHead>Invited</TableHead>
                {canManageBillingAdmins && <TableHead className="w-[70px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.teamsPlan.members.map((member) => {
                const canManageThisMember = canManageBillingAdmins && member.email !== user.email;
                return (
                  <TableRow key={member.email}>
                    <TableCell className="font-medium">{member.email}</TableCell>
                    <TableCell>
                      {member.role === 'owner' ? 'Team Admin' : 'Team Member'}
                    </TableCell>
                    <TableCell>
                      {member.status === 'pending' ? 'Invited' : 'Active'}
                    </TableCell>
                    <TableCell>{member.creditLimit || 'No limit'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    {canManageBillingAdmins && (
                      <TableCell>
                        {canManageThisMember && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {member.status === 'pending' && (
                                <DropdownMenuItem onClick={() => handleMarkAsActive(member.email)}>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Mark as Active
                                </DropdownMenuItem>
                              )}
                              {member.role === 'member' && (
                                <DropdownMenuItem onClick={() => handleMakeOwner(member.email)}>
                                  <Crown className="mr-2 h-4 w-4" />
                                  Make Team Admin
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleConvertToBillingAdmin(member.email)}>
                                <Shield className="mr-2 h-4 w-4" />
                                Add as Billing Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRemoveMember(member.email)}
                                variant="destructive"
                              >
                                <UserMinus className="mr-2 h-4 w-4" />
                                Remove from Team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BillingAdminsSection
        billingAdmins={billingAdmins}
        members={user.teamsPlan.members}
        currentUserEmail={user.email}
        canManageBillingAdmins={canManageBillingAdmins}
        availableSeats={availableSeats}
        onInvite={handleInviteBillingAdmin}
        onRemove={handleRemoveBillingAdmin}
        onConvertToMember={handleConvertBillingAdminToMember}
        onMarkAsActive={handleMarkBillingAdminAsActive}
      />

      <InviteMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onInvite={handleInviteMember}
      />

      <RemoveMemberModal
        open={showRemoveMemberModal}
        onOpenChange={setShowRemoveMemberModal}
        onConfirm={confirmRemoveMember}
        email={selectedMemberEmail}
      />

      <ConvertMemberToBillingAdminModal
        open={showConvertToBillingAdminModal}
        onOpenChange={setShowConvertToBillingAdminModal}
        onConfirm={confirmConvertToBillingAdmin}
        email={selectedMemberEmail}
      />

      <MakeTeamOwnerModal
        open={showMakeOwnerModal}
        onOpenChange={setShowMakeOwnerModal}
        onConfirm={confirmMakeOwner}
        email={selectedMemberEmail}
      />
    </div>
  );
}
