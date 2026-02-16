export const PRICING = {
  SEAT_PRICE: 10, // $/seat/month
  PRO_TIERS: [
    { credits: 2000, price: 20, annualPrice: 192, name: 'Pro 2K' },
    { credits: 4200, price: 40, annualPrice: 384, name: 'Pro 4.2K' },
    { credits: 6400, price: 60, annualPrice: 576, name: 'Pro 6.4K' },
    { credits: 8700, price: 80, annualPrice: 768, name: 'Pro 8.7K' },
    { credits: 11000, price: 100, annualPrice: 960, name: 'Pro 11K' },
    { credits: 22000, price: 200, annualPrice: 1920, name: 'Pro 22K' },
    { credits: 33000, price: 300, annualPrice: 2880, name: 'Pro 33K' },
    { credits: 44000, price: 400, annualPrice: 3840, name: 'Pro 44K' },
    { credits: 55000, price: 500, annualPrice: 4800, name: 'Pro 55K' },
    { credits: 110000, price: 1000, annualPrice: 9600, name: 'Pro 110K' },
  ],
  TEAMS_TIERS: [
    { credits: 2000, price: 20, name: 'Teams 2K' },
    { credits: 4200, price: 40, name: 'Teams 4.2K' },
    { credits: 6400, price: 60, name: 'Teams 6.4K' },
    { credits: 8700, price: 80, name: 'Teams 8.7K' },
    { credits: 11000, price: 100, name: 'Teams 11K' },
    { credits: 22000, price: 200, name: 'Teams 22K' },
    { credits: 33000, price: 300, name: 'Teams 33K' },
    { credits: 44000, price: 400, name: 'Teams 44K' },
    { credits: 55000, price: 500, name: 'Teams 55K' },
    { credits: 110000, price: 1000, name: 'Teams 110K' },
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
export const ANNUAL_BILLING_CYCLE_DAYS = 365;
