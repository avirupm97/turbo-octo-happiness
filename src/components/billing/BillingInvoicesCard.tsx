import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { CancelPlanModal } from '@/components/modals/CancelPlanModal';
import { DeleteTeamModal } from '@/components/modals/DeleteTeamModal';
import { ReactivatePlanModal } from '@/components/modals/ReactivatePlanModal';
import { ProcessBillingModal } from '@/components/modals/ProcessBillingModal';

interface BillingInvoicesCardProps {
  variant?: 'full' | 'invoices-only';
}

export function BillingInvoicesCard({ variant = 'full' }: BillingInvoicesCardProps) {
  const user = useAuthStore((state) => state.getCurrentUser());
  const cancelProPlan = useAuthStore((state) => state.cancelProPlan);
  const cancelTeamsPlan = useAuthStore((state) => state.cancelTeamsPlan);
  const reactivateProPlan = useAuthStore((state) => state.reactivateProPlan);
  const reactivateTeamsPlan = useAuthStore((state) => state.reactivateTeamsPlan);
  const deleteTeam = useAuthStore((state) => state.deleteTeam);
  const processBillingCycle = useAuthStore((state) => state.processBillingCycle);
  const processBillingCycleTeams = useAuthStore((state) => state.processBillingCycleTeams);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [showProcessBillingModal, setShowProcessBillingModal] = useState(false);

  if (!user) return null;

  const isCancelled = user.planStatus === 'cancelled';
  const isCancellationPending = user.planStatus === 'cancellation-pending';
  const isTeamsOwner = user.plan === 'teams' && user.teamsPlan?.members.find((m) => m.email === user.email)?.role === 'owner';
  const canDeleteTeam = user.plan === 'teams' && isTeamsOwner && (isCancelled || isCancellationPending);
  const isPro = user.plan === 'pro';
  const canManagePlan = isPro || isTeamsOwner;

  const handleCancelPlan = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (user.plan === 'pro') {
      cancelProPlan();
    } else if (user.plan === 'teams') {
      cancelTeamsPlan();
    }
  };

  const handleReactivatePlan = () => {
    setShowReactivateModal(true);
  };

  const handleConfirmReactivate = () => {
    if (user.plan === 'pro') {
      reactivateProPlan();
    } else if (user.plan === 'teams') {
      reactivateTeamsPlan();
    }
  };

  const handleProcessBillingCycle = () => {
    setShowProcessBillingModal(true);
  };

  const handleConfirmProcessBilling = () => {
    if (user.plan === 'pro') {
      processBillingCycle();
    } else if (user.plan === 'teams') {
      processBillingCycleTeams();
    }
  };

  const handleDeleteTeam = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deleteTeam();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Billing & Invoices</CardTitle>
            {isCancelled && (
              <Badge variant="destructive">Plan Cancelled</Badge>
            )}
            {isCancellationPending && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-500">Plan Expiring Soon</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {variant === 'full' && (
              <>
                <Button variant="outline" size="sm">
                  Change Payment Method
                </Button>
                <Button variant="outline" size="sm">
                  View Past Invoices
                </Button>
                {canManagePlan && isCancelled && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleReactivatePlan}>
                      Reactivate Plan
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleProcessBillingCycle}>
                      Process Billing Cycle
                    </Button>
                  </>
                )}
                {isTeamsOwner && isCancellationPending && (
                  <Button variant="outline" size="sm" onClick={handleProcessBillingCycle}>
                    Process Billing Cycle
                  </Button>
                )}
                {isTeamsOwner && isCancellationPending && (
                  <Button variant="outline" size="sm" onClick={handleReactivatePlan}>
                    Reactivate Plan
                  </Button>
                )}
                {canManagePlan && !isCancelled && !isCancellationPending && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={handleCancelPlan}
                  >
                    Cancel Plan
                  </Button>
                )}
                {canDeleteTeam && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteTeam}
                  >
                    Delete Team
                  </Button>
                )}
              </>
            )}
            {variant === 'invoices-only' && (
              <Button variant="outline" size="sm">
                View Past Invoices
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <CancelPlanModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        planType={user.plan === 'pro' ? 'pro' : 'teams'}
        billingCycleEnd={user.billingCycleEnd}
        onConfirm={handleConfirmCancel}
      />

      <ReactivatePlanModal
        open={showReactivateModal}
        onOpenChange={setShowReactivateModal}
        planType={user.plan === 'pro' ? 'pro' : 'teams'}
        planName={user.plan === 'pro' ? user.proPlan?.name : user.teamsPlan?.planName}
        billingCycleEnd={user.billingCycleEnd}
        monthlyPrice={user.plan === 'pro' ? user.proPlan?.price : undefined}
        onConfirm={handleConfirmReactivate}
      />

      <ProcessBillingModal
        open={showProcessBillingModal}
        onOpenChange={setShowProcessBillingModal}
        planType={user.plan === 'pro' ? 'pro' : 'teams'}
        currentCredits={user.plan === 'pro' ? (user.credits - user.creditsUsed) : (user.teamsPlan ? user.teamsPlan.sharedCredits - user.teamsPlan.sharedCreditsUsed : 0)}
        onConfirm={handleConfirmProcessBilling}
      />

      {user.plan === 'teams' && user.teamsPlan && (
        <DeleteTeamModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          teamName={user.teamsPlan.teamName}
          memberCount={user.teamsPlan.members.length}
          billingCycleEnd={user.billingCycleEnd}
          planStatus={user.planStatus}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}
