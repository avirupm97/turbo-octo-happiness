'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Download,
  BookOpen,
  FileText,
  PlayCircle,
  ExternalLink,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/lib/types';

// ─── Plan Card Config ─────────────────────────────────────────────────────────

interface PlanCardConfig {
  header: string;
  subtext: string;
  ctaLabel: string;
  href: string;
  isUpgrade: boolean;
}

function getPlanCardConfig(
  user: User,
  currentUserEmail: string,
  isBillingAdmin: boolean,
  ownerUser?: User | null,
): PlanCardConfig {
  // When an admin impersonates a team member or billing admin, the viewed user's own
  // record still has plan:'free'. Detect this and use the owner's teamsPlan instead.
  const isImpersonatedTeamUser =
    user.plan === 'free' && ownerUser?.plan === 'teams' && !!ownerUser.teamsPlan;

  if (user.plan === 'free' && !isImpersonatedTeamUser) {
    const creditsLeft = user.credits - user.creditsUsed;
    return {
      header: 'You are on Free plan.',
      subtext: `You have ${creditsLeft} credits left. Upgrade your plan to get more credits.`,
      ctaLabel: 'Upgrade Plan',
      href: '/upgrade/pro',
      isUpgrade: true,
    };
  }

  if (user.plan === 'pro') {
    const creditsLeft = user.credits - user.creditsUsed;
    return {
      header: 'You are on Pro plan.',
      subtext: `You have ${creditsLeft} credits left. Go to Your Plan to upgrade your plan or make changes to your current plan.`,
      ctaLabel: 'Go to Your Plan',
      href: '/your-plan',
      isUpgrade: false,
    };
  }

  // teams — use the owner's teamsPlan when impersonating a member/billing admin,
  // otherwise use the user's own teamsPlan (they are the owner logged in directly)
  const teamsPlan = isImpersonatedTeamUser ? ownerUser!.teamsPlan! : user.teamsPlan;

  // Determine role using the viewed user's email in the team members list
  const memberEntry = teamsPlan?.members.find((m) => m.email === user.email);
  const isAdmin = memberEntry?.role === 'owner' || isBillingAdmin;

  if (isAdmin) {
    const creditsLeft = (teamsPlan?.sharedCredits ?? 0) - (teamsPlan?.sharedCreditsUsed ?? 0);
    return {
      header: 'You are on Teams plan.',
      subtext: `You have ${creditsLeft} credits left. Go to Manage Plan to upgrade your plan, buy one-time credits or make changes to your current plan.`,
      ctaLabel: 'Go to Manage Plan',
      href: '/teams/manage',
      isUpgrade: false,
    };
  }

  // teams member
  const creditsUsed = teamsPlan?.sharedCreditsUsed ?? 0;
  return {
    header: 'You are on Teams plan.',
    subtext: `You have used ${creditsUsed} credits. Go to Your Usage to view your credit usage.`,
    ctaLabel: 'Go to Your Usage',
    href: '/usage',
    isUpgrade: false,
  };
}

// ─── Install Step ─────────────────────────────────────────────────────────────

function InstallStep() {
  return (
    <Card className="h-full py-0">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted mb-3">
          <Download className="h-5 w-5 text-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">Install Kombai</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
            Kombai is available as an IDE extension. To start using Kombai, install it in your favourite IDE.
          </p>
        </div>
        <div className="mt-4">
          <Button size="sm" asChild>
            <a href="https://kombai.com/install/" target="_blank" rel="noopener noreferrer">
              Install Extension
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Plan Status Card ─────────────────────────────────────────────────────────

function PlanStatusCard({ config }: { config: PlanCardConfig }) {
  const { header, subtext, ctaLabel, href, isUpgrade } = config;

  return (
    <Card className={cn('h-full py-0', isUpgrade && 'bg-green-500/10 border-green-500/25')}>
      <CardContent className="p-5 flex flex-col h-full">
        <div
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg mb-3',
            isUpgrade ? 'bg-green-500/20' : 'bg-muted',
          )}
        >
          <Zap
            className={cn('h-5 w-5', isUpgrade ? 'text-green-400' : 'text-muted-foreground')}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{header}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{subtext}</p>
        </div>
        <div className="mt-4">
          {isUpgrade ? (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-500 text-white w-fit"
              asChild
            >
              <Link href={href}>
                {ctaLabel}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" asChild>
              <Link href={href}>
                {ctaLabel}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Get Started Section ──────────────────────────────────────────────────────

function GetStartedSection() {
  const user = useAuthStore((state) => state.getViewingAsUser());
  const currentUser = useAuthStore((state) => state.currentUser);
  const isBillingAdmin = useAuthStore((state) => state.isViewingAsBillingAdmin());
  // When impersonating, grab the logged-in (owner) user's data so we can detect
  // team membership even though the viewed user's own record has plan:'free'
  const ownerUser = useAuthStore((state) =>
    state.impersonatedUser ? state.users[state.currentUser] ?? null : null,
  );

  if (!user) return null;

  const config = getPlanCardConfig(user, currentUser, isBillingAdmin, ownerUser);

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Get Started
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="sm:col-span-3">
          <InstallStep />
        </div>
        <div className="sm:col-span-2">
          <PlanStatusCard config={config} />
        </div>
      </div>
    </section>
  );
}

// ─── Resource Cards ───────────────────────────────────────────────────────────

const resources = [
  {
    icon: BookOpen,
    title: 'Guides',
    description: 'Step-by-step guides to help you get the most out of Kombai.',
    href: 'https://kombai.com/guide/',
  },
  {
    icon: FileText,
    title: 'Documentation',
    description: 'Everything you need to go from setup to shipping — how-to\'s, tips, and references.',
    href: 'https://docs.kombai.com/get-started/welcome',
  },
  {
    icon: PlayCircle,
    title: 'Community Videos',
    description: 'Watch tutorials and real-world examples from the community.',
    href: 'https://www.youtube.com/playlist?list=PLlInBUflf8KcD3G-lBesA0rbmEfQstaIM',
  },
];

function ResourceCard({ icon: Icon, title, description, href }: (typeof resources)[number]) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
      <Card className="h-full py-0 transition-colors hover:bg-accent/50 cursor-pointer">
        <CardContent className="p-5 flex flex-col gap-3 h-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted">
              <Icon className="h-5 w-5 text-foreground" />
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

// ─── Support Section ──────────────────────────────────────────────────────────

function SupportSection() {
  return (
    <Card className="py-0">
      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div>
          <h3 className="font-semibold text-foreground mb-1">Support</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
            If you&apos;re experiencing any issues with your plan, or have any feature requests, our
            support team is here to help.
          </p>
        </div>
        <Button variant="outline" asChild className="shrink-0">
          <a href="https://kombai.com/support/" target="_blank" rel="noopener noreferrer">
            Contact Support
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function GetStartedPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <GetStartedSection />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Explore
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <ResourceCard key={resource.title} {...resource} />
          ))}
        </div>
      </section>

      <SupportSection />
    </div>
  );
}
