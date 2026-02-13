export type PlanTier = 'free' | 'pro' | 'teams';

export interface ProPlan {
  monthlyCredits: number;
  price: number;
  name: string;
}

export interface TeamMember {
  email: string;
  creditLimit?: number;
  role: 'owner' | 'member';
  joinedAt: Date;
}

export interface TeamsPlan {
  teamName: string;
  seats: number;
  monthlyCredits: number;
  sharedCredits: number;
  sharedCreditsUsed: number;
  planName: string;
  members: TeamMember[];
  extraCredits: number;
}

export interface Invoice {
  id: string;
  date: Date;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'failed';
}

export interface CreditTransaction {
  id: string;
  date: Date;
  credits: number; // positive = added, negative = deducted
  type: 'signup' | 'daily' | 'purchased' | 'rollover' | 
        'plan_change' | 'expired' | 'transferred' | 'extra_credits';
  description: string;
}

export interface User {
  email: string;
  plan: PlanTier;
  credits: number;
  creditsUsed: number;
  billingCycle?: Date;
  billingCycleEnd?: Date;
  planStatus?: 'active' | 'cancellation-pending' | 'cancelled';
  cancelledAt?: Date;
  proPlan?: ProPlan;
  teamsPlan?: TeamsPlan;
  paymentMethod?: string;
  invoices: Invoice[];
  extraCredits: number;
  creditTransactions?: CreditTransaction[];
}

export interface UserData {
  currentUser: string;
  users: Record<string, User>;
}
