'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { InviteMemberModal } from '@/components/modals/InviteMemberModal';
import { UserPlus, Settings } from 'lucide-react';

export default function TeamMembersPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.getCurrentUser());
  const addTeamMember = useAuthStore((state) => state.addTeamMember);
  const [showInviteModal, setShowInviteModal] = useState(false);

  if (!user || user.plan !== 'teams' || !user.teamsPlan) {
    return null;
  }

  const handleInviteMember = (email: string, creditLimit?: number) => {
    addTeamMember(email, creditLimit);
  };

  const availableSeats = user.teamsPlan.seats - user.teamsPlan.members.length;

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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user.teamsPlan.seats}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user.teamsPlan.members.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{availableSeats}</p>
          </CardContent>
        </Card>
      </div>

      {availableSeats <= 0 && (
        <Card className="border-primary">
          <CardContent className="pt-6">
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
              <CardDescription>Team members and their roles</CardDescription>
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
                <TableHead>Credit Limit</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.teamsPlan.members.map((member) => (
                <TableRow key={member.email}>
                  <TableCell className="font-medium">{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={member.role === 'owner' ? 'default' : 'outline'}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.creditLimit || 'No limit'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InviteMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onInvite={handleInviteMember}
      />
    </div>
  );
}
