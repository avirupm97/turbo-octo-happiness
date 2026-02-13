# Kombai Teams - Complete Project Migration Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Design System](#design-system)
4. [Project Structure](#project-structure)
5. [State Management](#state-management)
6. [Data Models](#data-models)
7. [Routes & Pages](#routes--pages)
8. [Components](#components)
9. [Business Logic](#business-logic)
10. [User Flows](#user-flows)
11. [Configuration](#configuration)
12. [Setup Instructions](#setup-instructions)

---

## Project Overview

A subscription management application for Kombai that handles three plan tiers: Free, Pro, and Teams. Users can sign up, upgrade plans, manage team members, track credit usage, and handle billing.

**Key Features:**

- Multi-tier subscription system (Free → Pro → Teams)
- Credit-based usage tracking
- Team management with seat allocation
- Payment and invoice management
- User impersonation for testing
- Dark mode minimalistic UI

---

## Tech Stack

```json
{
  "Framework": "Next.js 15.5.12",
  "React": "19.1.0",
  "TypeScript": "5.x",
  "State Management": "Zustand 5.0.11 (with persist middleware)",
  "UI Components": "shadcn (v3.8.4) with Radix UI",
  "Styling": "Tailwind CSS v4 (@tailwindcss/postcss)",
  "Icons": "Lucide React 0.563.0",
  "Animations": "tw-animate-css 1.4.0",
  "Build Tool": "Turbopack",
  "Type Safety": "TypeScript strict mode"
}
```

---

## Design System

### Color Scheme (Dark Mode)

The app uses a minimalistic dark theme with the following color system:

```css
/* Dark Mode Colors (Primary Theme) */
--background: oklch(0.145 0 0); /* Very dark gray, almost black */
--foreground: oklch(0.985 0 0); /* Almost white text */
--card: oklch(0.205 0 0); /* Slightly lighter than background */
--primary: oklch(0.922 0 0); /* Light gray for primary elements */
--secondary: oklch(0.269 0 0); /* Medium dark gray */
--muted: oklch(0.269 0 0); /* Same as secondary */
--muted-foreground: oklch(0.708 0 0); /* Medium gray text */
--accent: oklch(0.269 0 0); /* Accent color */
--destructive: oklch(0.704 0.191 22.216); /* Red for destructive actions */
--border: oklch(1 0 0 / 10%); /* Very subtle white border */
--input: oklch(1 0 0 / 15%); /* Slightly more visible input border */
--sidebar: oklch(0.205 0 0); /* Sidebar background */
--sidebar-primary: oklch(
  0.488 0.243 264.376
); /* Purple/blue for sidebar active */

/* Radius System */
--radius: 0.625rem; /* Base: 10px */
--radius-sm: calc(var(--radius) - 4px); /* 6px */
--radius-md: calc(var(--radius) - 2px); /* 8px */
--radius-lg: var(--radius); /* 10px */
--radius-xl: calc(var(--radius) + 4px); /* 14px */
```

### Typography

- **Font Family**: Geist Sans (primary), Geist Mono (code)
- **Heading Sizes**:
  - h1: `text-3xl font-bold` (30px)
  - h2: `text-2xl font-bold` (24px)
  - Card Title: `text-sm font-medium` or `font-semibold`
- **Body Text**: Default sans-serif with `antialiased`
- **Muted Text**: `text-muted-foreground`

### Component Styling Patterns

1. **Cards**: Rounded corners (`rounded-lg`), subtle borders, dark background
2. **Buttons**: Primary (light bg), Outline (transparent with border), size variants (sm, default, lg)
3. **Inputs**: Dark background with subtle borders, focus ring
4. **Badges**: Rounded, minimal, uses outline or default variants
5. **Progress Bars**: Linear, uses primary color for fill
6. **Hover States**: Border color changes to primary on hover for interactive cards

### Spacing System

- Page padding: `p-6`
- Card spacing: `space-y-4` or `space-y-6` between sections
- Grid gaps: `gap-4` or `gap-6`
- Component internal spacing: `pb-2`, `pb-3`, `pt-2`, `pt-4`

---

## Project Structure

```
kombai-for-teams/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx              # Login page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                # Dashboard layout with sidebar
│   │   │   ├── overview/
│   │   │   │   └── page.tsx              # Dashboard overview
│   │   │   ├── your-plan/
│   │   │   │   └── page.tsx              # Plan management (Free/Pro/Teams views)
│   │   │   ├── usage/
│   │   │   │   └── page.tsx              # Individual usage tracking
│   │   │   ├── upgrade/
│   │   │   │   ├── pro/
│   │   │   │   │   └── page.tsx          # Pro upgrade/selection page
│   │   │   │   └── teams/
│   │   │   │       └── page.tsx          # Teams upgrade/configuration page
│   │   │   └── teams/
│   │   │       ├── members/
│   │   │       │   └── page.tsx          # Team member management
│   │   │       ├── manage/
│   │   │       │   └── page.tsx          # Team plan management
│   │   │       └── usage/
│   │   │           └── page.tsx          # Team-wide usage statistics
│   │   ├── layout.tsx                    # Root layout (dark mode, fonts)
│   │   ├── page.tsx                      # Root redirect to /login
│   │   └── globals.css                   # Tailwind v4 imports + theme
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx               # App sidebar with navigation
│   │   ├── modals/
│   │   │   ├── BuyCreditsModal.tsx       # Credit bundle purchase modal
│   │   │   ├── InviteMemberModal.tsx     # Team member invitation modal
│   │   │   └── PaymentModal.tsx          # Generic payment confirmation modal
│   │   └── ui/                           # shadcn components (14 components)
│   ├── stores/
│   │   └── useAuthStore.ts               # Zustand store for user state
│   ├── lib/
│   │   ├── constants.ts                  # Pricing, credit bundles, limits
│   │   ├── types.ts                      # TypeScript interfaces
│   │   └── utils.ts                      # Utility functions (cn helper)
│   └── hooks/
│       └── use-mobile.ts                 # Mobile detection hook
├── public/                               # Static assets (SVGs)
├── components.json                       # shadcn configuration
├── next.config.ts                        # Next.js config
├── postcss.config.mjs                    # Tailwind v4 PostCSS config
├── tsconfig.json                         # TypeScript config
└── package.json                          # Dependencies
```

---

## State Management

### Zustand Store (`useAuthStore`)

**Storage**: Persisted to `localStorage` under key `kombai-user-data`

**State Shape:**

```typescript
{
  currentUser: string; // Email of currently logged-in user
  users: Record<string, User>; // All registered users by email
}
```

**Actions:**

1. **`setCurrentUser(email)`** - Set active user, creates default free user if new
2. **`login(email)`** - Login user (calls setCurrentUser)
3. **`logout()`** - Clear current user
4. **`clearStorage()`** - Wipe all data from store and localStorage
5. **`getCurrentUser()`** - Get current user object
6. **`upgradeToProPlan(proPlan)`** - Upgrade from Free → Pro
7. **`upgradeToTeamsPlan(teamsPlan)`** - Upgrade to Teams (carries over Pro credits)
8. **`upgradePro(proPlan)`** - Upgrade Pro tier (higher credit tier)
9. **`buyCredits(credits, price)`** - Purchase one-time credit bundle
10. **`addTeamMember(email, creditLimit?)`** - Add member to team
11. **`updateTeamSeats(newSeats)`** - Increase team seat count
12. **`updateTeamPlan(newPlan)`** - Change team plan tier
13. **`addInvoice(invoice)`** - Add invoice record

**Default User Creation:**

```typescript
{
  email: string;
  plan: "free";
  credits: 150; // INITIAL_FREE_CREDITS
  creditsUsed: 0;
  invoices: [];
}
```

---

## Data Models

### Types (`src/lib/types.ts`)

```typescript
export type PlanTier = "free" | "pro" | "teams";

export interface ProPlan {
  monthlyCredits: number;
  price: number;
  name: string; // e.g., "Pro Starter"
}

export interface TeamMember {
  email: string;
  creditLimit?: number; // Optional usage limit
  role: "owner" | "member";
  joinedAt: Date;
}

export interface TeamsPlan {
  teamName: string;
  seats: number; // Total seats purchased
  monthlyCredits: number; // Credits allocated per month
  sharedCredits: number; // Total available credits
  sharedCreditsUsed: number; // Credits consumed by team
  planName: string; // e.g., "Teams Starter"
  members: TeamMember[];
}

export interface Invoice {
  id: string; // Auto-generated "INV-{timestamp}"
  date: Date;
  amount: number;
  description: string;
  status: "paid" | "pending" | "failed";
}

export interface User {
  email: string;
  plan: PlanTier;
  credits: number; // Individual credits (Pro) or 0 (Teams)
  creditsUsed: number; // Individual usage
  billingCycle?: Date; // Next billing date
  proPlan?: ProPlan; // Only if plan === 'pro'
  teamsPlan?: TeamsPlan; // Only if plan === 'teams'
  paymentMethod?: string; // Not implemented yet
  invoices: Invoice[];
}
```

### Constants (`src/lib/constants.ts`)

```typescript
export const PRICING = {
  SEAT_PRICE: 10, // $/seat/month
  PRO_TIERS: [
    { credits: 1000, price: 20, name: "Pro Starter" },
    { credits: 2500, price: 45, name: "Pro Growth" },
    { credits: 5000, price: 80, name: "Pro Enterprise" },
  ],
  TEAMS_TIERS: [
    { credits: 5000, price: 100, name: "Teams Starter" },
    { credits: 10000, price: 180, name: "Teams Growth" },
    { credits: 25000, price: 400, name: "Teams Enterprise" },
  ],
  CREDIT_BUNDLES: [
    { credits: 500, price: 15 },
    { credits: 1000, price: 25 },
    { credits: 2500, price: 55 },
  ],
};

export const INITIAL_FREE_CREDITS = 150;
export const MIN_AVG_CREDITS_PER_SEAT = 1000;
```

---

## Routes & Pages

### Authentication Routes

#### `/login` (`src/app/(auth)/login/page.tsx`)

**Purpose**: User authentication entry point

**UI Elements:**

- Centered card with "Welcome to Kombai" title
- Email input field
- "Sign In" button

**Behavior:**

- On submit: calls `login(email)` → redirects to `/overview`
- Creates new free user if email doesn't exist
- No password validation (simplified for demo)

**Layout**: No sidebar, centered on full screen with dark background

---

### Dashboard Routes (Protected)

All dashboard routes use `(dashboard)/layout.tsx` which:

- Checks authentication on mount (redirects to `/login` if not authenticated)
- Renders `<AppSidebar>` + main content area
- Uses `SidebarProvider` from shadcn

---

#### `/overview` (`src/app/(dashboard)/overview/page.tsx`)

**Purpose**: Dashboard home with high-level stats

**UI Layout:**

```
┌─────────────────────────────────────┐
│ Overview                            │
│ Welcome to your Kombai dashboard    │
├─────────────────────────────────────┤
│ ┌──────────┬──────────┬──────────┐ │
│ │ Current  │ Credits  │ Team/    │ │
│ │ Plan     │ Avail.   │ Usage    │ │
│ └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Quick Stats                     │ │
│ │ - Plan Status: [Badge]          │ │
│ │ - Billing Cycle: MM/DD/YYYY     │ │
│ │ - Credits Remaining: ###        │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Cards Displayed:**

1. **Current Plan** (all users)
   - Icon: `CreditCard`
   - Shows: Plan tier (capitalized)
   - Subtitle: Plan name or "Free tier with 150 credits"

2. **Credits Available** (all users)
   - Icon: `TrendingUp`
   - Shows: Remaining credits (total - used)
   - Subtitle: Total credits (+ "shared across team" for Teams)
   - Progress bar: Shows percentage remaining

3. **Team Members** (Teams only) OR **Usage** (Free/Pro)
   - Teams: Shows member count / total seats
   - Free/Pro: Shows credits used

**Quick Stats Card:**

- Plan status badge
- Billing cycle renewal date (if exists)
- Credits remaining count

**Data Sources:**

- Free/Pro: `user.credits`, `user.creditsUsed`
- Teams: `user.teamsPlan.sharedCredits`, `user.teamsPlan.sharedCreditsUsed`

---

#### `/your-plan` (`src/app/(dashboard)/your-plan/page.tsx`)

**Purpose**: Plan management - varies by user tier

**Three Different Views:**

##### **FREE USER VIEW**

Layout: Two upgrade cards side-by-side

**Card 1: Upgrade to Pro**

- Shows selected tier price (default: Pro Starter $20/mo)
- Dropdown to select Pro tier (1000/2500/5000 credits)
- "Upgrade to Pro" button
- Features list:
  - Multiple tier options
  - Buy additional credits
  - Priority support

**Card 2: Upgrade to Teams**

- Shows total monthly cost (seats + plan)
- Input: Number of seats (min: 1)
  - Shows seat cost calculation: `$10 × seats`
- Dropdown: Select team plan tier
- Summary section:
  - Plan cost
  - Seats cost
  - Average credits/seat (calculated)
  - Warning alert if avg < 1000 credits/seat
- "Upgrade to Teams - ${total}/month" button
- Features list:
  - Manage team members
  - Shared credit pool
  - Set credit limits per user

**Interactions:**

1. Click "Upgrade to Pro" → Opens PaymentModal
2. Click "Upgrade to Teams" → Opens PaymentModal
3. On payment confirm:
   - Calls `upgradeToProPlan()` or `upgradeToTeamsPlan()`
   - Adds invoice
   - Redirects to `/your-plan` (Pro) or `/teams/members` (Teams)

---

##### **PRO USER VIEW**

**Main Card: Plan Details**

- Header: Plan name + "Active" badge
- Credits progress bar
- Grid showing:
  - Monthly Credits
  - Monthly Cost
- Next billing date

**Action Cards (2-column grid):**

1. **Upgrade Pro Plan** (links to `/upgrade/pro`)
   - Icon: `TrendingUp`
   - "Move to a higher tier"

2. **Buy Additional Credits**
   - Icon: `ShoppingCart`
   - Opens `BuyCreditsModal`

**Upgrade to Teams Card:**

- Full width card
- Icon: `ArrowRight`
- Links to `/upgrade/teams`
- Description: "Enable team collaboration and shared credits"

**Action Buttons (bottom):**

- "Change Payment Method" (outline)
- "View Invoices" (outline)
- "Cancel Plan" (outline, destructive text)

**Modals:**

- `BuyCreditsModal`: Shows 3 credit bundles (500, 1000, 2500)
  - On purchase: calls `buyCredits()`, adds invoice

---

##### **TEAMS USER VIEW**

**Card 1: Usage Summary**

- Title: "Usage Summary"
- Description: "Your personal usage from shared credits"
- Grid:
  - Personal Usage: `user.creditsUsed`
  - Remaining (Shared): `sharedCredits - sharedCreditsUsed`

**Card 2: Plan Summary**

- Title: "Plan Summary"
- Grid row 1:
  - Plan Name: e.g., "Teams Starter"
  - Team Name: e.g., "My Team"
- Shared credits progress bar
- Grid row 2:
  - Total Seats
  - Team Members count

**Bottom Action:**

- Large "Manage Plan" button → links to `/teams/manage`
- Icon: `CreditCard`

---

#### `/usage` (`src/app/(dashboard)/usage/page.tsx`)

**Purpose**: Individual credit usage tracking

**UI Elements:**

**Card 1: Credit Usage**

- Progress bar showing usage percentage
- Text: "Credits used: {used} / {total}"
- Grid:
  - Used credits (large number)
  - Remaining credits (large number)
- Billing cycle date (if exists)

**Card 2 (Teams only): Team Credits (Shared)**

- Shows team-wide usage
- Progress bar for shared credits
- Text: "Team credits used: {used} / {total}"

**Data Display:**

- For Free/Pro: Uses `user.credits` and `user.creditsUsed`
- For Teams:
  - Personal: `user.creditsUsed` (from monthly allocation)
  - Shared: `teamsPlan.sharedCredits` and `teamsPlan.sharedCreditsUsed`

---

#### `/upgrade/pro` (`src/app/(dashboard)/upgrade/pro/page.tsx`)

**Purpose**: Tier selection for Pro upgrades

**Accessible by:** Free users (all tiers), Pro users (higher tiers only)

**Current Plan Card (Pro users only):**

- Shows existing plan name
- Credits/mo and price
- "Current" badge

**Tier Selection Grid (3 columns):**
Each tier card shows:

- Tier name (e.g., "Pro Starter")
- Credits/month
- Price (large text: `$20`)
- Feature list with checkmarks:
  - X monthly credits
  - Buy additional credits
  - Priority support
  - Invoice history
- "Select Plan" button

**Behavior:**

- Free users: See all 3 tiers
- Pro users: See only tiers with more credits than current
- If on highest tier: Show message "You're already on the highest Pro tier!"
- On select: Opens `PaymentModal`
- On confirm:
  - Calls `upgradeToProPlan()` or `upgradePro()`
  - Adds invoice
  - Redirects to `/your-plan`

---

#### `/upgrade/teams` (`src/app/(dashboard)/upgrade/teams/page.tsx`)

**Purpose**: Teams plan configuration before purchase

**Layout:** 2-column grid (left: config, right: summary)

**Left Column:**

**Card 1: Team Configuration**

- Input: Team Name (default: "My Team")
- Input: Number of Seats (type: number, min: 2)
  - Shows: `$10/seat/month = ${total}/month`

**Card 2: Select Plan**

- Three plan options displayed as selectable cards:
  - Teams Starter: 5,000 credits, $100
  - Teams Growth: 10,000 credits, $180
  - Teams Enterprise: 25,000 credits, $400
- Selected card: `border-primary bg-accent`
- Each shows: name, credits, price + "seats cost"

**Right Column:**

**Card 1: Summary**

- Team Name
- Plan name
- Seats count
- Separator
- Cost breakdown:
  - Seats (X × $10)
  - Plan
- Separator
- Total Monthly (large bold text)

**Card 2: Credit Distribution**

- Large centered number: Total shared credits
- Text: "across X seats"
- Average credits per seat (calculated)
- Warning alert if avg < 1000

**Bottom Button:**

- "Continue to Payment" → Opens `PaymentModal`
- On confirm:
  - Calls `upgradeToTeamsPlan()`
  - Adds invoice
  - Redirects to `/teams/members`

**Business Logic:**

- Carries over remaining Pro credits to team shared pool
- Resets billing cycle
- Sets user as team owner in members array

---

#### `/teams/members` (`src/app/(dashboard)/teams/members/page.tsx`)

**Purpose**: Manage team members and invitations

**Access:** Teams plan users only

**Header:**

- Title: "Team Members"
- "Invite Member" button (disabled if no available seats)

**Stats Cards (3-column grid):**

1. Total Seats
2. Active Members
3. Available Seats

**Alert Card (shown when availableSeats === 0):**

- Message: "All seats are occupied"
- "Buy Seats" button → links to `/teams/manage`

**Members Table Card:**

- Header with "Manage Team" button → links to `/teams/manage`
- Table columns:
  - Email
  - Role (badge: owner/member)
  - Credit Limit (number or "No limit")
  - Joined (date)

**Invite Member Modal:**

- Email input (required)
- Credit Limit input (optional, type: number)
- "Send Invitation" button
- On submit: calls `addTeamMember(email, creditLimit)`

---

#### `/teams/manage` (`src/app/(dashboard)/teams/manage/page.tsx`)

**Purpose**: Team plan administration and billing

**Access:** Teams plan users only

**Current Plan Card:**

- Team name + plan name
- "Active" badge
- Stats grid:
  - Total Seats
  - Shared Credits
  - Avg Credits/Seat (calculated)
- Separator
- Info rows:
  - Credits Used: {used} / {total}
  - Active Members: count

**Action Cards (2×2 grid):**

1. **Add Seats** (clickable)
   - Icon: `Plus`
   - Opens `PaymentModal` for seat purchase
   - Shows: `$10/seat/month`

2. **Upgrade Plan** (not implemented - placeholder)
   - Icon: `TrendingUp`
   - Would allow changing to higher credit tier

3. **Buy Additional Credits** (clickable)
   - Icon: `CreditCard`
   - Opens `BuyCreditsModal`
   - Credits are added to shared pool

4. **Team Settings** (placeholder)
   - Icon: `Settings`

**Billing & Invoices Card:**

- Action buttons:
  - "Change Payment Method" (outline)
  - "View Invoices" (outline)
  - "Cancel Team Plan" (outline, destructive)

**Add Seats Modal:**

- Input for number of new seats (default: 1)
- Shows calculation: `X seats × $10/seat/month`
- On confirm:
  - Calls `updateTeamSeats()`
  - Adds invoice for seat cost

---

#### `/teams/usage` (`src/app/(dashboard)/teams/usage/page.tsx`)

**Purpose**: Team-wide credit usage analytics

**Access:** Teams plan users only

**Header:**

- Title: "Team Usage"
- Filter dropdown: "All Members" or individual member email

**Total Team Usage Card:**

- Progress bar showing `sharedCreditsUsed / sharedCredits`
- Stats grid:
  - Total Credits
  - Used
  - Remaining

**Member Usage Table Card:**

- Columns:
  - Member (email)
  - Role
  - Credits Used (currently shows 0 - not tracked per member yet)
  - Credit Limit
- Filters based on dropdown selection

**Note:** Individual member credit tracking is not fully implemented (shows 0)

---

## Components

### Layout Components

#### `<AppSidebar>` (`src/components/layout/Sidebar.tsx`)

**Structure:**

```
┌─────────────────┐
│ Kombai          │ ← SidebarHeader
├─────────────────┤
│ 📊 Overview     │ ← SidebarGroup (always visible)
│ 💳 Your Plan    │
│ 📈 Usage        │
├─────────────────┤
│ Teams           │ ← SidebarGroup (Teams users only)
│ 👥 Team Members │
│ 📊 Team Usage   │
├─────────────────┤
│ [User Dropdown] │ ← SidebarFooter
│ [Logout]        │
│ [Clear Storage] │
│ Plan: teams     │
└─────────────────┘
```

**Navigation Items:**

- Always visible: Overview, Your Plan, Usage
- Teams only: Team Members, Team Usage
- Active state: Purple background when path matches

**Footer Elements:**

1. **User Impersonation Dropdown**
   - Shows current user email
   - Lists all registered users
   - Click to switch user (calls `setCurrentUser()`)
   - Active user has `bg-accent`

2. **Action Buttons**
   - Logout: Clears `currentUser`, redirects to `/login`
   - Clear Storage: Wipes all data, redirects to `/login`

3. **Plan Indicator**
   - Small text showing current plan tier

**Icons Used:**

- LayoutDashboard (Overview)
- CreditCard (Your Plan)
- TrendingUp (Usage)
- Users (Team Members)
- BarChart3 (Team Usage)
- LogOut, Trash2, ChevronDown

---

### Modal Components

#### `<PaymentModal>` (`src/components/modals/PaymentModal.tsx`)

**Props:**

```typescript
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;                    // e.g., "Confirm Pro Subscription"
  description: string;               // Plan details
  amount: number;                    // Total cost
  onConfirm: () => void;            // Payment handler
}
```

**UI:**

- Dialog with centered content
- Large price display: `${amount}` (text-4xl)
- "Total amount" subtext
- Footer buttons:
  - "Cancel" (outline)
  - "Authorize Payment" (primary)

**Usage:**

- Pro subscription confirmation
- Teams subscription confirmation
- Seat purchase confirmation

---

#### `<BuyCreditsModal>` (`src/components/modals/BuyCreditsModal.tsx`)

**Props:**

```typescript
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase: (credits: number, price: number) => void;
}
```

**UI:**

- Dialog with max-width-2xl
- 3-column grid of credit bundles:
  - 500 credits - $15
  - 1000 credits - $25
  - 2500 credits - $55
- Selected bundle: `border-primary ring-2 ring-primary`
- Shows checkmark on selected
- Footer buttons:
  - "Cancel"
  - "Purchase Credits" (disabled until selection)

**Behavior:**

- Click card to select
- Confirm purchase → calls `onPurchase()` → adds credits and invoice

---

#### `<InviteMemberModal>` (`src/components/modals/InviteMemberModal.tsx`)

**Props:**

```typescript
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, creditLimit?: number) => void;
}
```

**UI:**

- Email input (required)
- Credit Limit input (optional, type: number)
- Helper text: "Set a maximum credit usage limit for this member"
- Footer buttons:
  - "Cancel"
  - "Send Invitation" (disabled until email entered)

**Behavior:**

- On submit: calls `onInvite(email, creditLimit)`
- Clears form after successful invite
- Adds member to `teamsPlan.members` array

---

### shadcn UI Components Used

**Installed Components (14):**

1. `alert` - Warning/info messages (e.g., low credits per seat)
2. `badge` - Plan status, member roles
3. `button` - Primary actions, outline variants
4. `card` - Main content containers
5. `dialog` - Payment/invite modals
6. `dropdown-menu` - User impersonation selector
7. `input` - Text/number/email inputs
8. `progress` - Credit usage bars
9. `select` - Tier/plan selection dropdowns
10. `separator` - Visual section dividers
11. `sheet` - Not actively used (installed by sidebar)
12. `sidebar` - Main navigation component
13. `skeleton` - Loading states (imported but not used)
14. `table` - Member lists, usage data
15. `tooltip` - Hover information (provider in root layout)

**Component Customization:**

- All use Tailwind v4 classes
- Color system via CSS variables
- `cn()` utility for conditional classes
- Dark mode via `.dark` class on `<html>`

---

## Business Logic

### Free → Pro Upgrade Flow

1. User on `/your-plan` selects Pro tier from dropdown
2. Clicks "Upgrade to Pro"
3. `PaymentModal` opens with tier details
4. On "Authorize Payment":
   ```typescript
   upgradeToProPlan({
     monthlyCredits: selectedTier.credits,
     price: selectedTier.price,
     name: selectedTier.name,
   });
   ```
5. State updates:
   - `plan: 'pro'`
   - `proPlan: { ... }`
   - `credits: monthlyCredits`
   - `creditsUsed: 0`
   - `billingCycle: new Date()`
6. Invoice added
7. User stays on `/your-plan` (now sees Pro view)

---

### Free → Teams Upgrade Flow

1. User on `/your-plan` configures:
   - Team name
   - Number of seats (min: 1)
   - Plan tier selection
2. System calculates:
   - `totalCost = (seats × 10) + planPrice`
   - `avgCreditsPerSeat = planCredits / seats`
   - Shows warning if avg < 1000
3. Clicks "Upgrade to Teams"
4. `PaymentModal` confirms payment
5. On confirm:
   ```typescript
   upgradeToTeamsPlan({
     teamName,
     seats,
     monthlyCredits: planCredits,
     sharedCredits: planCredits,
     sharedCreditsUsed: 0,
     planName,
     members: [],
   });
   ```
6. State updates:
   - `plan: 'teams'`
   - `teamsPlan: { ... }`
   - `credits: 0` (no individual credits)
   - `creditsUsed: 0`
   - `billingCycle: new Date()`
   - User auto-added to members as 'owner'
7. Redirects to `/teams/members`

---

### Pro → Teams Upgrade Flow

**Key Difference:** Remaining Pro credits carry over

1. User on `/upgrade/teams` configures team
2. On payment confirm:

   ```typescript
   const remainingProCredits = user.credits - user.creditsUsed;

   upgradeToTeamsPlan({
     ...teamConfig,
     sharedCredits: planCredits + remainingProCredits,
     members: [{ email: currentUser, role: "owner", joinedAt: new Date() }],
   });
   ```

3. State updates:
   - `plan: 'teams'`
   - `proPlan: undefined` (removed)
   - Shared credits include Pro remainder
   - Billing cycle resets
4. Redirects to `/teams/members`

---

### Pro Tier Upgrade (Within Pro)

1. User on `/upgrade/pro` sees only higher tiers
2. Selects new tier
3. On payment:
   ```typescript
   upgradePro({
     monthlyCredits: newTier.credits,
     price: newTier.price,
     name: newTier.name,
   });
   ```
4. State updates:
   - `proPlan: newPlan`
   - `credits: newMonthlyCredits`
   - `creditsUsed: 0` (reset)
   - `billingCycle: new Date()` (reset)
5. Redirects to `/your-plan`

---

### Buying Additional Credits

**For Pro Users:**

- Opens `BuyCreditsModal`
- Selects bundle (500/1000/2500 credits)
- On purchase:
  ```typescript
  buyCredits(credits, price);
  // Adds to user.credits
  // Adds invoice
  ```

**For Teams Users:**

- Opens `BuyCreditsModal` from `/teams/manage`
- On purchase:
  ```typescript
  buyCredits(credits, price);
  // Adds to teamsPlan.sharedCredits
  // Adds invoice
  ```

---

### Team Member Management

**Adding Members:**

1. On `/teams/members`, click "Invite Member"
2. Enter email and optional credit limit
3. On submit:
   ```typescript
   addTeamMember(email, creditLimit);
   ```
4. New member added to `teamsPlan.members`:
   ```typescript
   {
     email,
     creditLimit,
     role: 'member',
     joinedAt: new Date(),
   }
   ```

**Seat Constraints:**

- Cannot invite if `members.length >= seats`
- "Invite Member" button disabled
- Must buy seats first via `/teams/manage`

**Buying Seats:**

1. On `/teams/manage`, click "Add Seats"
2. Enter number of seats to add
3. On payment:
   ```typescript
   updateTeamSeats(currentSeats + newSeats);
   // Invoice added for seat cost
   ```

---

### Credit Usage Tracking

**Current Implementation:**

- Individual usage (`user.creditsUsed`) tracked manually in store
- Team shared usage (`teamsPlan.sharedCreditsUsed`) not auto-incremented
- Per-member usage in Teams not implemented (shows 0)

**Usage Display:**

- `/usage`: Shows personal usage vs. allocation
- `/teams/usage`: Shows team total (not per-member breakdown yet)

---

## User Flows

### Flow 1: Free User → Pro Subscription

```
1. Login → /overview
   ↓
2. Navigate to "Your Plan" → /your-plan
   ↓
3. See "Upgrade to Pro" card
   ↓
4. Select tier from dropdown (e.g., Pro Starter - 1000 credits)
   ↓
5. Click "Upgrade to Pro"
   ↓
6. PaymentModal appears: "Confirm Pro Subscription"
   ↓
7. Shows: "$20 - Pro Starter with 1,000 monthly credits"
   ↓
8. Click "Authorize Payment"
   ↓
9. State updates:
   - plan: 'free' → 'pro'
   - proPlan: { monthlyCredits: 1000, price: 20, name: 'Pro Starter' }
   - credits: 150 → 1000
   - creditsUsed: 0
   - billingCycle: today
   ↓
10. Invoice added: "Pro Starter subscription - $20"
    ↓
11. Stay on /your-plan
    ↓
12. Now see Pro user view:
    - Plan details card with progress bar
    - "Upgrade Pro Plan" button
    - "Buy Additional Credits" button
    - "Upgrade to Teams" card
    - Billing action buttons
```

---

### Flow 2: Free User → Teams Subscription

```
1. Login → /overview
   ↓
2. Navigate to "Your Plan" → /your-plan
   ↓
3. See "Upgrade to Teams" card
   ↓
4. Configure team:
   - Seats: 5 (input)
   - Plan: Teams Starter (5000 credits, $100)
   ↓
5. System calculates:
   - Seat cost: 5 × $10 = $50
   - Plan cost: $100
   - Total: $150/month
   - Avg credits/seat: 5000 / 5 = 1000 ✓
   ↓
6. Click "Upgrade to Teams - $150 / month"
   ↓
7. PaymentModal: "Confirm Teams Subscription"
   ↓
8. Click "Authorize Payment"
   ↓
9. State updates:
   - plan: 'free' → 'teams'
   - teamsPlan: {
       teamName: 'My Team',
       seats: 5,
       monthlyCredits: 5000,
       sharedCredits: 5000,
       sharedCreditsUsed: 0,
       planName: 'Teams Starter',
       members: [{ email: current, role: 'owner', joinedAt: today }]
     }
   - credits: 150 → 0
   - creditsUsed: 0
   ↓
10. Invoice: "Teams Starter - 5 seats - $150"
    ↓
11. Redirect to /teams/members
    ↓
12. See:
    - Stats: 5 total seats, 1 active member, 4 available
    - Member table with owner
    - "Invite Member" button enabled
    ↓
13. Sidebar now shows Teams section:
    - Team Members
    - Team Usage
```

---

### Flow 3: Pro User → Higher Pro Tier

```
1. Current: Pro Starter (1000 credits, $20)
   ↓
2. Navigate to /upgrade/pro (from "Upgrade Pro Plan" card)
   ↓
3. See current plan card at top
   ↓
4. See available tiers:
   - Pro Growth (2500 credits, $45)
   - Pro Enterprise (5000 credits, $80)
   - (Pro Starter hidden - already on it)
   ↓
5. Click "Select Plan" on Pro Growth
   ↓
6. PaymentModal: "Confirm Pro Subscription"
   ↓
7. Click "Authorize Payment"
   ↓
8. State updates:
   - proPlan: { monthlyCredits: 2500, price: 45, name: 'Pro Growth' }
   - credits: 1000 → 2500
   - creditsUsed: reset to 0
   - billingCycle: reset to today
   ↓
9. Invoice: "Pro Growth subscription - $45"
   ↓
10. Redirect to /your-plan
    ↓
11. See updated plan details
```

---

### Flow 4: Pro User → Teams (with credit carryover)

```
1. Current Pro: 2500 credits, used 500
   - Remaining: 2000 credits
   ↓
2. Click "Upgrade to Teams" card on /your-plan
   ↓
3. Redirect to /upgrade/teams
   ↓
4. Configure:
   - Team name: "Acme Design"
   - Seats: 10
   - Plan: Teams Growth (10,000 credits, $180)
   ↓
5. Calculation:
   - Seats: 10 × $10 = $100
   - Plan: $180
   - Total: $280/month
   - Avg credits/seat: 10,000 / 10 = 1000 ✓
   ↓
6. Click "Continue to Payment"
   ↓
7. PaymentModal shows $280
   ↓
8. Click "Authorize Payment"
   ↓
9. State updates:
   - plan: 'pro' → 'teams'
   - proPlan: undefined (removed)
   - teamsPlan: {
       teamName: 'Acme Design',
       seats: 10,
       monthlyCredits: 10000,
       sharedCredits: 10000 + 2000 = 12000, ← Pro credits added!
       sharedCreditsUsed: 0,
       planName: 'Teams Growth',
       members: [owner]
     }
   - credits: 2500 → 0
   - creditsUsed: 500 → 0
   - billingCycle: reset
   ↓
10. Invoice: "Teams Growth - 10 seats - $280"
    ↓
11. Redirect to /teams/members
    ↓
12. Overview shows 12,000 shared credits available
```

---

### Flow 5: Team Admin Invites Members

```
1. On /teams/members
   ↓
2. Stats show: 5 seats, 1 member, 4 available
   ↓
3. Click "Invite Member"
   ↓
4. Modal opens
   ↓
5. Enter:
   - Email: "designer@acme.com"
   - Credit Limit: 2000 (optional)
   ↓
6. Click "Send Invitation"
   ↓
7. State updates:
   - teamsPlan.members.push({
       email: 'designer@acme.com',
       creditLimit: 2000,
       role: 'member',
       joinedAt: today
     })
   ↓
8. Modal closes
   ↓
9. Table updates:
   - Now shows 2 members
   - Stats: 5 seats, 2 members, 3 available
   ↓
10. Repeat for 3 more members
    ↓
11. After 5th member:
    - Stats: 5 seats, 5 members, 0 available
    - "Invite Member" button becomes disabled
    - Alert appears: "All seats occupied - Buy more seats"
```

---

### Flow 6: Buy Additional Team Seats

```
1. On /teams/members with 0 available seats
   ↓
2. Click "Buy Seats" in alert
   ↓
3. Redirect to /teams/manage
   ↓
4. Click "Add Seats" card
   ↓
5. PaymentModal opens:
   - Shows input for seat count (default: 1)
   - Price: $10/seat/month
   ↓
6. Enter: 3 seats
   ↓
7. Modal shows: "$30 - 3 additional seats"
   ↓
8. Click "Authorize Payment"
   ↓
9. State updates:
   - teamsPlan.seats: 5 → 8
   ↓
10. Invoice: "3 additional seats - $30"
    ↓
11. Modal closes
    ↓
12. Current plan card updates to show 8 seats
    ↓
13. Return to /teams/members
    ↓
14. Stats: 8 seats, 5 members, 3 available
    ↓
15. "Invite Member" button re-enabled
```

---

### Flow 7: Buy Additional Credits (Teams)

```
1. On /teams/manage
   ↓
2. Click "Buy Additional Credits" card
   ↓
3. BuyCreditsModal opens
   ↓
4. Shows 3 bundles:
   - 500 credits - $15
   - 1000 credits - $25
   - 2500 credits - $55
   ↓
5. Click 2500 credit bundle
   ↓
6. Card highlights with ring
   ↓
7. Click "Purchase Credits"
   ↓
8. State updates:
   - teamsPlan.sharedCredits: 5000 → 7500
   ↓
9. Invoice: "2500 credits purchase - $55"
   ↓
10. Modal closes
    ↓
11. Plan summary shows updated 7500 shared credits
    ↓
12. All team members can now use from 7500 pool
```

---

### Flow 8: User Impersonation (Dev Feature)

```
1. Sidebar footer shows current user dropdown
   ↓
2. Click dropdown
   ↓
3. See list of all registered users:
   - user1@test.com (current - highlighted)
   - user2@test.com
   - admin@test.com
   ↓
4. Click "user2@test.com"
   ↓
5. State updates:
   - currentUser: 'user1@test.com' → 'user2@test.com'
   ↓
6. Page refreshes
   ↓
7. Now viewing user2's dashboard:
   - Different plan tier
   - Different credits
   - Different team (if any)
   ↓
8. Sidebar footer shows "user2@test.com"
```

---

## Configuration

### Next.js Config (`next.config.ts`)

```typescript
const nextConfig: NextConfig = {
  /* Minimal config - no custom settings */
};
```

**Build Command:** `next build --turbopack`
**Dev Command:** `next dev --turbopack`

---

### Tailwind v4 Config

**PostCSS Setup (`postcss.config.mjs`):**

```javascript
const config = {
  plugins: ["@tailwindcss/postcss"],
};
```

**Global CSS (`src/app/globals.css`):**

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* All color and radius mappings */
}

:root {
  /* Light mode variables (not used) */
}

.dark {
  /* Dark mode variables (active) */
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Key Points:**

- Tailwind v4 uses `@import` instead of `@tailwind`
- Theme defined in `@theme inline` block
- Dark mode always active via `className="dark"` on `<html>`
- CSS variables for all colors
- Border radius uses calc() based on `--radius: 0.625rem`

---

### TypeScript Config (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "jsx": "preserve",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Path Aliases:**

- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/stores` → `src/stores`
- `@/hooks` → `src/hooks`

---

### shadcn Config (`components.json`)

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Install Command:**

```bash
npx shadcn add button card input select dialog table badge progress alert separator dropdown-menu sidebar tooltip skeleton sheet
```

---

## Setup Instructions

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation Steps

1. **Create Next.js 15 App with Turbopack**

   ```bash
   npx create-next-app@latest kombai-for-teams --typescript --tailwind --app --turbopack
   cd kombai-for-teams
   ```

2. **Install Dependencies**

   ```bash
   npm install zustand class-variance-authority clsx tailwind-merge lucide-react
   npm install -D @tailwindcss/postcss tailwindcss@4 tw-animate-css shadcn
   ```

3. **Configure Tailwind v4**
   - Update `postcss.config.mjs`:
     ```javascript
     const config = { plugins: ["@tailwindcss/postcss"] };
     export default config;
     ```

4. **Initialize shadcn**

   ```bash
   npx shadcn init
   ```

   - Choose: new-york style, neutral base color, CSS variables: yes

5. **Install shadcn Components**

   ```bash
   npx shadcn add button card input select dialog table badge progress alert separator dropdown-menu sidebar tooltip skeleton sheet
   ```

6. **Set Up Project Structure**
   - Create directory structure as shown in [Project Structure](#project-structure)
   - Copy all files from this guide into respective paths

7. **Update `src/app/globals.css`**
   - Replace with Tailwind v4 syntax (see [Configuration](#configuration))
   - Add dark mode color variables

8. **Create Root Layout**
   - Add `className="dark"` to `<html>` tag
   - Import Geist fonts
   - Wrap with `<TooltipProvider>`

9. **Create Route Groups**

   ```
   src/app/
   ├── (auth)/login/page.tsx
   └── (dashboard)/
       ├── layout.tsx
       ├── overview/page.tsx
       └── ... (other routes)
   ```

10. **Set Up Zustand Store**
    - Create `src/stores/useAuthStore.ts`
    - Add persist middleware
    - Implement all actions

11. **Create Type Definitions**
    - `src/lib/types.ts` - All interfaces
    - `src/lib/constants.ts` - Pricing data

12. **Build Components**
    - Sidebar with navigation
    - Three modal components
    - All page components

13. **Test Flows**
    - Run `npm run dev`
    - Test all user flows listed above
    - Verify localStorage persistence
    - Test user impersonation

---

## Key Implementation Notes

### Dark Mode Enforcement

The app forces dark mode by adding `className="dark"` to the `<html>` element in `src/app/layout.tsx`. This ensures all shadcn components and Tailwind utilities use dark variants.

### State Persistence

All user data persists to `localStorage` under key `kombai-user-data`. This includes:

- All user accounts
- Plan details
- Credit balances
- Team configurations
- Invoices

### Client Components

All dashboard pages use `'use client'` directive because they:

- Access Zustand store hooks
- Use Next.js navigation hooks
- Handle user interactions

### Route Protection

Dashboard layout (`(dashboard)/layout.tsx`) checks authentication via:

```typescript
useEffect(() => {
  if (!currentUser) {
    router.push("/login");
  }
}, [currentUser, router]);
```

### Invoice Generation

Invoices auto-generate IDs using:

```typescript
id: `INV-${Date.now()}`;
```

### Billing Cycle

Set to current date on plan changes:

```typescript
billingCycle: new Date();
```

Displayed as:

```typescript
new Date(user.billingCycle).toLocaleDateString();
```

### Credit Calculations

- **Individual**: `user.credits - user.creditsUsed`
- **Shared (Teams)**: `teamsPlan.sharedCredits - teamsPlan.sharedCreditsUsed`
- **Average per seat**: `Math.floor(sharedCredits / seats)`

### Validation

- Minimum seats: 1 (Free→Teams), 2 (Upgrade Teams page)
- Warning threshold: 1000 credits/seat average
- Email required for invites
- Credit limits optional for team members

---

## Missing Features (Intentionally Not Implemented)

1. **Password Authentication** - Simplified to email only
2. **Payment Processing** - Modal simulation only
3. **Email Invitations** - No actual email sending
4. **Per-Member Credit Tracking** - Shows 0 in Team Usage
5. **Invoice PDF Download** - No invoice view page
6. **Payment Method Management** - Placeholder buttons only
7. **Plan Cancellation** - Button exists but no handler
8. **Teams Plan Upgrade** - Card exists, not implemented
9. **Credit Usage Auto-Increment** - Manual tracking only
10. **Billing History Page** - No dedicated invoices page

---

## Testing Checklist

### User Creation & Authentication

- [ ] New user auto-creates with 150 free credits
- [ ] Login redirects to `/overview`
- [ ] Logout clears session, redirects to `/login`
- [ ] Clear storage wipes all data

### Free User

- [ ] Overview shows Free plan, 150 credits
- [ ] Your Plan shows two upgrade cards
- [ ] Can select Pro tiers from dropdown
- [ ] Can configure Teams with seats and plan
- [ ] Payment modal shows correct amounts
- [ ] Upgrade creates plan correctly

### Pro User

- [ ] Overview shows Pro plan with current tier
- [ ] Your Plan shows plan details and progress bar
- [ ] Can upgrade to higher Pro tier
- [ ] Can buy additional credits
- [ ] Can upgrade to Teams
- [ ] Usage page shows individual credits
- [ ] Sidebar shows no Teams section

### Pro → Teams Upgrade

- [ ] Remaining credits carry over to shared pool
- [ ] Billing cycle resets
- [ ] User becomes team owner
- [ ] Redirects to `/teams/members`
- [ ] Sidebar adds Teams section

### Teams User

- [ ] Overview shows team stats
- [ ] Your Plan shows personal usage + plan summary
- [ ] Can view team members
- [ ] Can invite members (if seats available)
- [ ] Cannot invite when seats full
- [ ] Can buy additional seats
- [ ] Can buy additional credits (shared pool)
- [ ] Team Usage shows shared credit consumption
- [ ] Sidebar shows Teams section

### Team Management

- [ ] Invite member adds to members array
- [ ] Credit limit is optional
- [ ] Member shows in table immediately
- [ ] Available seats decrements
- [ ] Buy seats increases seat count
- [ ] Seat cost: $10 × seats

### User Impersonation

- [ ] Dropdown shows all users
- [ ] Switching user changes entire dashboard
- [ ] Each user has independent state
- [ ] Footer shows current user

### Modals

- [ ] Payment modal shows correct amounts
- [ ] Buy credits shows 3 bundles
- [ ] Selection highlights chosen bundle
- [ ] Invite member requires email
- [ ] All modals close on cancel

### Navigation

- [ ] All sidebar links work
- [ ] Active states show correctly
- [ ] Teams links only for Teams users
- [ ] Protected routes redirect if not logged in

### Data Persistence

- [ ] Refresh page maintains state
- [ ] Close browser and reopen maintains state
- [ ] Multiple tabs share state (localStorage)
- [ ] Clear storage removes all data

---

## Conclusion

This guide provides complete specifications to recreate the Kombai Teams application. Every UI element, interaction, state change, and business rule is documented with exact implementation details, data structures, and user flows.

**To rebuild:**

1. Follow setup instructions to install dependencies
2. Recreate file structure exactly as shown
3. Copy component implementations from this guide
4. Test each user flow against the checklist
5. Verify all state changes persist correctly

The app is fully functional for demo purposes with simulated payments and multi-user management via impersonation.
