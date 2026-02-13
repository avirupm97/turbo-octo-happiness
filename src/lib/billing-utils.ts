import { BILLING_CYCLE_DAYS, MAX_FREE_CREDITS_ON_DOWNGRADE } from './constants';

export function calculateBillingCycleEnd(startDate: Date): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + BILLING_CYCLE_DAYS);
  return endDate;
}

export function calculateProDowngradeCredits(remainingCredits: number): number {
  return Math.min(remainingCredits, MAX_FREE_CREDITS_ON_DOWNGRADE);
}

export function isBillingCyclePassed(cycleEndDate: Date | undefined): boolean {
  if (!cycleEndDate) return false;
  return new Date() > new Date(cycleEndDate);
}

export function getDaysUntilExpiry(cycleEndDate: Date | undefined): number {
  if (!cycleEndDate) return 0;
  const now = new Date();
  const end = new Date(cycleEndDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
