export const PRICING = {
  SEAT_PRICE: 10, // $/seat/month
  PRO_TIERS: [
    { credits: 1000, price: 20, name: 'Pro Starter' },
    { credits: 2500, price: 45, name: 'Pro Growth' },
    { credits: 5000, price: 80, name: 'Pro Enterprise' },
  ],
  TEAMS_TIERS: [
    { credits: 5000, price: 100, name: 'Teams Starter' },
    { credits: 10000, price: 180, name: 'Teams Growth' },
    { credits: 25000, price: 400, name: 'Teams Enterprise' },
  ],
  CREDIT_BUNDLES: [
    { credits: 500, price: 15 },
    { credits: 1000, price: 25 },
    { credits: 2500, price: 55 },
  ],
  EXTRA_CREDIT_BUNDLES: [
    { credits: 1000, price: 10 },
    { credits: 5000, price: 50 },
    { credits: 10000, price: 100 },
  ],
} as const;

export const INITIAL_FREE_CREDITS = 150;
export const MIN_AVG_CREDITS_PER_SEAT = 1000;
export const MAX_FREE_CREDITS_ON_DOWNGRADE = 150;
export const BILLING_CYCLE_DAYS = 30;
