import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserData, ProPlan, TeamsPlan, Invoice, CreditTransaction, TeamMember } from '@/lib/types';
import { INITIAL_FREE_CREDITS, PRICING } from '@/lib/constants';
import { calculateBillingCycleEnd, calculateAnnualBillingCycleEnd } from '@/lib/billing-utils';

interface AuthStore extends UserData {
  impersonatedUser: string | null;
  setCurrentUser: (email: string) => void;
  setImpersonatedUser: (email: string | null) => void;
  getViewingAsUser: () => User | null;
  isViewingAsBillingAdmin: () => boolean;
  login: (email: string) => void;
  logout: () => void;
  clearStorage: () => void;
  upgradeToProPlan: (proPlan: ProPlan) => void;
  upgradeToTeamsPlan: (teamsPlan: TeamsPlan) => void;
  upgradePro: (proPlan: ProPlan) => void;
  buyCredits: (credits: number, price: number) => void;
  buyExtraCredits: (credits: number, price: number) => void;
  addTeamMember: (memberEmail: string, creditLimit?: number) => void;
  updateTeamSeats: (newSeats: number) => void;
  updateTeamPlan: (newPlan: TeamsPlan) => void;
  updateTeamPlanOnly: (planName: string, monthlyCredits: number, price: number) => void;
  updateTeamSeatsOnly: (newSeats: number) => void;
  updateTeamPlanAndSeats: (planName: string, monthlyCredits: number, planPrice: number, newSeats: number) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  addCreditTransaction: (type: CreditTransaction['type'], credits: number, description: string) => void;
  getCurrentUser: () => User | null;
  cancelProPlan: () => void;
  cancelTeamsPlan: () => void;
  reactivateProPlan: () => void;
  reactivateTeamsPlan: () => void;
  deleteTeam: () => void;
  processBillingCycle: (userEmail?: string) => void;
  processBillingCycleTeams: () => void;
  transferTeamOwnership: (newOwnerEmail: string) => void;
  removeTeamMember: (memberEmail: string) => void;
  burnCredits: (amount: number) => void;
  inviteBillingAdmin: (email: string) => void;
  removeBillingAdmin: (email: string) => void;
  acceptBillingAdminInvite: (email: string) => void;
  convertBillingAdminToMember: (email: string, creditLimit?: number) => void;
  convertMemberToBillingAdmin: (email: string) => void;
  makeTeamOwner: (email: string) => void;
  markMemberAsActive: (email: string) => void;
  markBillingAdminAsActive: (email: string) => void;
}

const createDefaultUser = (email: string): User => ({
  email,
  plan: 'free',
  credits: INITIAL_FREE_CREDITS,
  creditsUsed: 0,
  invoices: [],
  extraCredits: 0,
  creditTransactions: [],
});

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: '',
      users: {},
      impersonatedUser: null,

      setCurrentUser: (email: string) => {
        const { users } = get();
        if (!users[email]) {
          const newUser = createDefaultUser(email);
          set((state) => ({
            users: {
              ...state.users,
              [email]: newUser,
            },
            currentUser: email,
          }));
          // Add signup transaction for new users
          get().addCreditTransaction('signup', INITIAL_FREE_CREDITS, `+${INITIAL_FREE_CREDITS} (Signup)`);
        } else {
          // Initialize missing fields for existing users
          const user = users[email];
          const needsUpdate = !user.creditTransactions || 
            (user.teamsPlan && !user.teamsPlan.billingAdmins) ||
            (user.teamsPlan && user.teamsPlan.members.some((m: TeamMember) => !m.status));
          
          if (needsUpdate) {
            set((state) => ({
              users: {
                ...state.users,
                [email]: {
                  ...user,
                  creditTransactions: user.creditTransactions || [],
                  teamsPlan: user.teamsPlan ? {
                    ...user.teamsPlan,
                    billingAdmins: user.teamsPlan.billingAdmins || [],
                    members: user.teamsPlan.members.map((member: TeamMember) => ({
                      ...member,
                      status: member.status || 'active',
                    })),
                  } : undefined,
                },
              },
              currentUser: email,
            }));
          } else {
            set({ currentUser: email });
          }
        }
      },

      login: (email: string) => {
        get().setCurrentUser(email);
      },

      logout: () => {
        set({ currentUser: '' });
      },

      clearStorage: () => {
        set({ currentUser: '', users: {} });
        localStorage.removeItem('kombai-user-data');
      },

      getCurrentUser: () => {
        const { currentUser, users } = get();
        return users[currentUser] || null;
      },

      setImpersonatedUser: (email: string | null) => {
        set({ impersonatedUser: email });
      },

      getViewingAsUser: () => {
        const { currentUser, impersonatedUser, users } = get();
        const viewingEmail = impersonatedUser || currentUser;
        return users[viewingEmail] || null;
      },

      isViewingAsBillingAdmin: () => {
        const { currentUser, impersonatedUser, users } = get();
        if (!impersonatedUser || !currentUser) return false;
        
        const loggedInUser = users[currentUser];
        if (!loggedInUser || loggedInUser.plan !== 'teams' || !loggedInUser.teamsPlan) return false;
        
        const billingAdmins = loggedInUser.teamsPlan.billingAdmins || [];
        return billingAdmins.some(admin => admin.email === impersonatedUser && admin.status === 'active');
      },

      upgradeToProPlan: (proPlan: ProPlan) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        const billingCycle = new Date();
        const billingCycleEnd = proPlan.billingInterval === 'annual'
          ? calculateAnnualBillingCycleEnd(billingCycle)
          : calculateBillingCycleEnd(billingCycle);
        
        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              plan: 'pro',
              proPlan,
              credits: proPlan.monthlyCredits,
              creditsUsed: 0,
              billingCycle,
              billingCycleEnd,
              planStatus: 'active',
              cancelledAt: undefined,
              extraCredits: 0,
            },
          },
        });

        // Log transaction
        get().addCreditTransaction('plan_change', proPlan.monthlyCredits, `+${proPlan.monthlyCredits} (Purchased)`);
      },

      upgradeToTeamsPlan: (teamsPlan: TeamsPlan) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        
        // If plan is cancelled, don't transfer credits (they expire)
        const remainingProCredits = user.planStatus === 'cancelled' ? 0 : (user.proPlan ? (user.credits - user.creditsUsed) : 0);
        const proExtraCredits = user.planStatus === 'cancelled' ? 0 : (user.extraCredits || 0);
        
        // Always reset billing cycle to 30 days when upgrading to Teams
        const billingCycle = new Date();
        const billingCycleEnd = calculateBillingCycleEnd(billingCycle);

        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              plan: 'teams',
              teamsPlan: {
                ...teamsPlan,
                sharedCredits: teamsPlan.sharedCredits + remainingProCredits + proExtraCredits,
                members: [{ email: currentUser, role: 'owner', status: 'active', joinedAt: new Date() }],
                billingAdmins: teamsPlan.billingAdmins || [],
                extraCredits: proExtraCredits,
              },
              credits: 0,
              creditsUsed: 0,
              proPlan: undefined,
              billingCycle,
              billingCycleEnd,
              planStatus: 'active',
              cancelledAt: undefined,
              extraCredits: 0,
            },
          },
        });

        // Log transactions
        get().addCreditTransaction('plan_change', teamsPlan.sharedCredits, `+${teamsPlan.sharedCredits} (Purchased)`);
        if (remainingProCredits + proExtraCredits > 0) {
          get().addCreditTransaction('transferred', remainingProCredits + proExtraCredits, `+${remainingProCredits + proExtraCredits} (Transferred)`);
        }
      },

      upgradePro: (proPlan: ProPlan) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        
        // Reset billing cycle based on billing interval
        const billingCycle = new Date();
        const billingCycleEnd = proPlan.billingInterval === 'annual'
          ? calculateAnnualBillingCycleEnd(billingCycle)
          : calculateBillingCycleEnd(billingCycle);
        
        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              proPlan,
              credits: proPlan.monthlyCredits,
              creditsUsed: 0,
              billingCycle,
              billingCycleEnd,
              planStatus: 'active',
              cancelledAt: undefined,
              extraCredits: 0,
            },
          },
        });
      },

      buyCredits: (credits: number, price: number) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (user.plan === 'teams' && user.teamsPlan) {
          set({
            users: {
              ...users,
              [currentUser]: {
                ...user,
                teamsPlan: {
                  ...user.teamsPlan,
                  sharedCredits: user.teamsPlan.sharedCredits + credits,
                },
              },
            },
          });
        } else {
          set({
            users: {
              ...users,
              [currentUser]: {
                ...user,
                credits: user.credits + credits,
              },
            },
          });
        }

        // Add invoice
        get().addInvoice({
          date: new Date(),
          amount: price,
          description: `${credits} credits purchase`,
          status: 'paid',
        });

        // Log transaction
        get().addCreditTransaction('purchased', credits, `+${credits} (Purchased)`);
      },

      buyExtraCredits: (credits: number, price: number) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        
        // Only allow Pro and Teams users to buy extra credits
        if (user.plan !== 'pro' && user.plan !== 'teams') return;

        if (user.plan === 'teams' && user.teamsPlan) {
          set({
            users: {
              ...users,
              [currentUser]: {
                ...user,
                teamsPlan: {
                  ...user.teamsPlan,
                  sharedCredits: user.teamsPlan.sharedCredits + credits,
                  extraCredits: user.teamsPlan.extraCredits + credits,
                },
              },
            },
          });
        } else {
          set({
            users: {
              ...users,
              [currentUser]: {
                ...user,
                credits: user.credits + credits,
                extraCredits: user.extraCredits + credits,
              },
            },
          });
        }

        // Add invoice
        get().addInvoice({
          date: new Date(),
          amount: price,
          description: `${credits} extra credits purchase`,
          status: 'paid',
        });

        // Log transaction
        get().addCreditTransaction('extra_credits', credits, `+${credits} (Extra)`);
      },

      addTeamMember: (memberEmail: string, creditLimit?: number) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user.teamsPlan) return;

        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              teamsPlan: {
                ...user.teamsPlan,
                members: [
                  ...user.teamsPlan.members,
                  {
                    email: memberEmail,
                    creditLimit,
                    role: 'member',
                    status: 'pending',
                    joinedAt: new Date(),
                  },
                ],
              },
            },
          },
        });
      },

      updateTeamSeats: (newSeats: number) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user.teamsPlan) return;

        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              teamsPlan: {
                ...user.teamsPlan,
                seats: newSeats,
              },
            },
          },
        });
      },

      updateTeamPlan: (newPlan: TeamsPlan) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              teamsPlan: newPlan,
            },
          },
        });
      },

      updateTeamPlanOnly: (planName: string, monthlyCredits: number, _price: number) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user.teamsPlan) return;

        const remainingCredits = user.teamsPlan.sharedCredits - user.teamsPlan.sharedCreditsUsed;
        const billingCycle = new Date();
        const billingCycleEnd = calculateBillingCycleEnd(billingCycle);

        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              teamsPlan: {
                ...user.teamsPlan,
                planName,
                monthlyCredits,
                sharedCredits: monthlyCredits + remainingCredits,
                sharedCreditsUsed: 0,
              },
              billingCycle,
              billingCycleEnd,
              planStatus: 'active',
              cancelledAt: undefined,
            },
          },
        });
      },

      updateTeamSeatsOnly: (newSeats: number) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user.teamsPlan) return;

        // If in cancellation-pending state, reactivate the plan
        if (user.planStatus === 'cancellation-pending') {
          set({
            users: {
              ...users,
              [currentUser]: {
                ...user,
                teamsPlan: {
                  ...user.teamsPlan,
                  seats: newSeats,
                },
                planStatus: 'active',
                cancelledAt: undefined,
              },
            },
          });
        } else {
          set({
            users: {
              ...users,
              [currentUser]: {
                ...user,
                teamsPlan: {
                  ...user.teamsPlan,
                  seats: newSeats,
                },
              },
            },
          });
        }
      },

      updateTeamPlanAndSeats: (planName: string, monthlyCredits: number, planPrice: number, newSeats: number) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user.teamsPlan) return;

        const remainingCredits = user.teamsPlan.sharedCredits - user.teamsPlan.sharedCreditsUsed;
        const billingCycle = new Date();
        const billingCycleEnd = calculateBillingCycleEnd(billingCycle);

        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              teamsPlan: {
                ...user.teamsPlan,
                planName,
                monthlyCredits,
                sharedCredits: monthlyCredits + remainingCredits,
                sharedCreditsUsed: 0,
                seats: newSeats,
              },
              billingCycle,
              billingCycleEnd,
              planStatus: 'active',
              cancelledAt: undefined,
            },
          },
        });
      },

      addInvoice: (invoice: Omit<Invoice, 'id'>) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              invoices: [
                ...user.invoices,
                {
                  ...invoice,
                  id: `INV-${Date.now()}`,
                },
              ],
            },
          },
        });
      },

      addCreditTransaction: (type: CreditTransaction['type'], credits: number, description: string) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        const transactions = user.creditTransactions || [];
        
        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              creditTransactions: [
                ...transactions,
                {
                  id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  date: new Date(),
                  credits,
                  type,
                  description,
                },
              ],
            },
          },
        });
      },

      cancelProPlan: () => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (user.plan !== 'pro') return;

        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              planStatus: 'cancelled',
              cancelledAt: new Date(),
            },
          },
        });
      },

      cancelTeamsPlan: () => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (user.plan !== 'teams' || !user.teamsPlan) return;

        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              planStatus: 'cancellation-pending',
              cancelledAt: new Date(),
            },
          },
        });
      },

      reactivateProPlan: () => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (user.plan !== 'pro' || user.planStatus !== 'cancelled') return;

        // Simple reactivation - no payment, keep existing billing cycle
        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              planStatus: 'active',
              cancelledAt: undefined,
            },
          },
        });
      },

      reactivateTeamsPlan: () => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (user.plan !== 'teams' || !user.teamsPlan || (user.planStatus !== 'cancelled' && user.planStatus !== 'cancellation-pending')) return;

        // If cancellation-pending, just revert status
        if (user.planStatus === 'cancellation-pending') {
          set({
            users: {
              ...users,
              [currentUser]: {
                ...user,
                planStatus: 'active',
                cancelledAt: undefined,
              },
            },
          });
        } else {
          // If cancelled, create new billing cycle with fresh credits (extra credits don't carry over)
          const billingCycle = new Date();
          const billingCycleEnd = calculateBillingCycleEnd(billingCycle);
          
          set({
            users: {
              ...users,
              [currentUser]: {
                ...user,
                planStatus: 'active',
                cancelledAt: undefined,
                billingCycle,
                billingCycleEnd,
                teamsPlan: {
                  ...user.teamsPlan,
                  sharedCredits: user.teamsPlan.monthlyCredits,
                  sharedCreditsUsed: 0,
                  extraCredits: 0,
                },
              },
            },
          });

          // Add invoice for new billing cycle (plan + seats)
          const planTier = PRICING.TEAMS_TIERS.find(t => t.credits === user.teamsPlan!.monthlyCredits);
          const planPrice = planTier?.price || 0;
          const seatCost = user.teamsPlan.seats * PRICING.SEAT_PRICE;
          const totalCost = planPrice + seatCost;

          get().addInvoice({
            date: new Date(),
            amount: totalCost,
            description: `${user.teamsPlan.planName} with ${user.teamsPlan.seats} seats - New billing cycle`,
            status: 'paid',
          });
        }
      },

      deleteTeam: () => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (user.plan !== 'teams' || !user.teamsPlan) return;

        // Get team invoices to distribute
        const teamInvoices = user.invoices;

        // Move all team members to free plan with 0 credits
        const updatedUsers = { ...users };
        user.teamsPlan.members.forEach((member) => {
          const memberUser = updatedUsers[member.email];
          if (memberUser) {
            updatedUsers[member.email] = {
              ...memberUser,
              plan: 'free',
              credits: 0,
              creditsUsed: 0,
              teamsPlan: undefined,
              planStatus: undefined,
              cancelledAt: undefined,
              billingCycle: undefined,
              billingCycleEnd: undefined,
              invoices: [...memberUser.invoices, ...teamInvoices],
              extraCredits: 0,
            };
          }
        });

        set({ users: updatedUsers });
      },

      processBillingCycle: (userEmail?: string) => {
        const { currentUser, users } = get();
        const targetEmail = userEmail || currentUser;
        if (!targetEmail) return;

        const user = users[targetEmail];
        if (!user) return;

        // Only process if plan is cancelled
        if (user.planStatus !== 'cancelled') return;

        const updatedUsers = { ...users };

        if (user.plan === 'pro') {
          // Downgrade Pro to Free - hard cap at 150 credits immediately
          const availableCredits = user.credits - user.creditsUsed;
          const newCredits = Math.min(availableCredits, 150);
          const expiredCredits = availableCredits - newCredits;

          updatedUsers[targetEmail] = {
            ...user,
            plan: 'free',
            credits: newCredits,
            creditsUsed: 0,
            proPlan: undefined,
            planStatus: undefined,
            cancelledAt: undefined,
            billingCycle: undefined,
            billingCycleEnd: undefined,
            extraCredits: 0,
          };

          set({ users: updatedUsers, currentUser: targetEmail });

          // Log transactions
          if (newCredits > 0) {
            get().addCreditTransaction('rollover', newCredits, `+${newCredits} (Rollover)`);
          }
          if (expiredCredits > 0) {
            get().addCreditTransaction('expired', -expiredCredits, `-${expiredCredits} (Expired)`);
          }
        } else if (user.plan === 'teams' && user.teamsPlan) {
          // Reset team credits to 0 (extra credits expire)
          const expiredCredits = user.teamsPlan.sharedCredits - user.teamsPlan.sharedCreditsUsed;

          updatedUsers[targetEmail] = {
            ...user,
            teamsPlan: {
              ...user.teamsPlan,
              sharedCredits: 0,
              sharedCreditsUsed: 0,
              extraCredits: 0,
            },
            planStatus: undefined,
            cancelledAt: undefined,
          };

          set({ users: updatedUsers, currentUser: targetEmail });

          // Log transaction
          if (expiredCredits > 0) {
            get().addCreditTransaction('expired', -expiredCredits, `-${expiredCredits} (Expired)`);
          }
        }
      },

      processBillingCycleTeams: () => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user || user.plan !== 'teams' || !user.teamsPlan) return;

        // Only process if plan is in cancellation-pending state
        if (user.planStatus !== 'cancellation-pending') return;

        // When processing billing cycle, extra credits expire
        const totalCreditsIncludingExtra = user.teamsPlan.monthlyCredits + user.teamsPlan.extraCredits;

        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              planStatus: 'cancelled',
              teamsPlan: {
                ...user.teamsPlan,
                sharedCredits: user.teamsPlan.monthlyCredits,
                sharedCreditsUsed: user.teamsPlan.monthlyCredits,
                extraCredits: 0,
              },
            },
          },
        });
      },

      transferTeamOwnership: (newOwnerEmail: string) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user.teamsPlan) return;

        const updatedMembers = user.teamsPlan.members.map((member) => {
          if (member.email === currentUser) {
            return { ...member, role: 'member' as const };
          }
          if (member.email === newOwnerEmail) {
            return { ...member, role: 'owner' as const };
          }
          return member;
        });

        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              teamsPlan: {
                ...user.teamsPlan,
                members: updatedMembers,
              },
            },
          },
        });
      },

      removeTeamMember: (memberEmail: string) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user.teamsPlan) return;

        const memberToRemove = user.teamsPlan.members.find((m) => m.email === memberEmail);
        const isOwner = memberToRemove?.role === 'owner';

        // If removing owner, transfer ownership to next member by join date
        let updatedMembers = user.teamsPlan.members.filter((m) => m.email !== memberEmail);
        
        if (isOwner && updatedMembers.length > 0) {
          const sortedByJoinDate = [...updatedMembers].sort(
            (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
          );
          updatedMembers = sortedByJoinDate.map((member, index) =>
            index === 0 ? { ...member, role: 'owner' as const } : member
          );
        }

        // Update current user's team
        const updatedUsers = { ...users };
        updatedUsers[currentUser] = {
          ...user,
          teamsPlan: {
            ...user.teamsPlan,
            members: updatedMembers,
          },
        };

        // If member exists in users, move them to free plan with 150 credits
        if (users[memberEmail]) {
          updatedUsers[memberEmail] = {
            ...users[memberEmail],
            plan: 'free',
            credits: INITIAL_FREE_CREDITS,
            creditsUsed: 0,
            teamsPlan: undefined,
            planStatus: undefined,
            cancelledAt: undefined,
            extraCredits: 0,
          };
        }

        set({ users: updatedUsers });
      },

      burnCredits: (amount: number) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user) return;

        const updatedUsers = { ...users };

        if (user.plan === 'teams' && user.teamsPlan) {
          // Burn team credits
          updatedUsers[currentUser] = {
            ...user,
            teamsPlan: {
              ...user.teamsPlan,
              sharedCreditsUsed: Math.min(
                user.teamsPlan.sharedCreditsUsed + amount,
                user.teamsPlan.sharedCredits
              ),
            },
          };
        } else {
          // Burn individual credits
          updatedUsers[currentUser] = {
            ...user,
            creditsUsed: Math.min(user.creditsUsed + amount, user.credits),
          };
        }

        set({ users: updatedUsers });
      },

      inviteBillingAdmin: (email: string) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user.teamsPlan) return;

        // Initialize billingAdmins array if it doesn't exist
        const billingAdmins = user.teamsPlan.billingAdmins || [];

        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              teamsPlan: {
                ...user.teamsPlan,
                billingAdmins: [
                  ...billingAdmins,
                  {
                    email,
                    status: 'pending',
                    invitedAt: new Date(),
                  },
                ],
              },
            },
          },
        });
      },

      removeBillingAdmin: (email: string) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user.teamsPlan) return;

        const billingAdmins = user.teamsPlan.billingAdmins || [];

        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              teamsPlan: {
                ...user.teamsPlan,
                billingAdmins: billingAdmins.filter((admin) => admin.email !== email),
              },
            },
          },
        });
      },

      acceptBillingAdminInvite: (email: string) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user.teamsPlan) return;

        const billingAdmins = user.teamsPlan.billingAdmins || [];

        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              teamsPlan: {
                ...user.teamsPlan,
                billingAdmins: billingAdmins.map((admin) =>
                  admin.email === email
                    ? { ...admin, status: 'active' as const, acceptedAt: new Date() }
                    : admin
                ),
              },
            },
          },
        });
      },

      convertBillingAdminToMember: (email: string, creditLimit?: number) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user.teamsPlan) return;

        const billingAdmins = user.teamsPlan.billingAdmins || [];

        // Remove from billing admins and add to members
        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              teamsPlan: {
                ...user.teamsPlan,
                billingAdmins: billingAdmins.filter((admin) => admin.email !== email),
                members: [
                  ...user.teamsPlan.members,
                  {
                    email,
                    creditLimit,
                    role: 'member',
                    status: 'active',
                    joinedAt: new Date(),
                  },
                ],
              },
            },
          },
        });
      },

      convertMemberToBillingAdmin: (email: string) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user.teamsPlan) return;

        const billingAdmins = user.teamsPlan.billingAdmins || [];

        // Remove from members and add to billing admins
        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              teamsPlan: {
                ...user.teamsPlan,
                members: user.teamsPlan.members.filter((member) => member.email !== email),
                billingAdmins: [
                  ...billingAdmins,
                  {
                    email,
                    status: 'active',
                    invitedAt: new Date(),
                  },
                ],
              },
            },
          },
        });
      },

      makeTeamOwner: (email: string) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user.teamsPlan) return;

        // Update member role to owner
        const updatedMembers = user.teamsPlan.members.map((member) =>
          member.email === email ? { ...member, role: 'owner' as const } : member
        );

        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              teamsPlan: {
                ...user.teamsPlan,
                members: updatedMembers,
              },
            },
          },
        });
      },

      markMemberAsActive: (email: string) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user.teamsPlan) return;

        // Update member status to active
        const updatedMembers = user.teamsPlan.members.map((member) =>
          member.email === email ? { ...member, status: 'active' as const } : member
        );

        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              teamsPlan: {
                ...user.teamsPlan,
                members: updatedMembers,
              },
            },
          },
        });
      },

      markBillingAdminAsActive: (email: string) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const user = users[currentUser];
        if (!user.teamsPlan) return;

        // Update billing admin status to active
        const updatedBillingAdmins = (user.teamsPlan.billingAdmins || []).map((admin) =>
          admin.email === email ? { ...admin, status: 'active' as const } : admin
        );

        set({
          users: {
            ...users,
            [currentUser]: {
              ...user,
              teamsPlan: {
                ...user.teamsPlan,
                billingAdmins: updatedBillingAdmins,
              },
            },
          },
        });
      },
    }),
    {
      name: 'kombai-user-data',
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
      }),
    }
  )
);
