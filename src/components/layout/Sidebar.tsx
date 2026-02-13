'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InsufficientCreditsModal } from '@/components/modals/InsufficientCreditsModal';
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Trash2,
  ChevronDown,
  RefreshCw,
  Flame,
} from 'lucide-react';

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { getCurrentUser, currentUser, logout, clearStorage, setCurrentUser, users, processBillingCycle, burnCredits } = useAuthStore();
  const user = getCurrentUser();
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleClearStorage = () => {
    clearStorage();
    router.push('/login');
  };

  const handleImpersonate = (email: string) => {
    setCurrentUser(email);
    router.refresh();
  };

  const handleProcessBillingCycle = () => {
    if (currentUser) {
      processBillingCycle(currentUser);
      router.refresh();
    }
  };

  const handleBurnCredits = () => {
    if (!user) return;

    // Calculate available credits
    let available = 0;
    if (user.plan === 'teams' && user.teamsPlan) {
      available = user.teamsPlan.sharedCredits - user.teamsPlan.sharedCreditsUsed;
    } else {
      available = user.credits - user.creditsUsed;
    }

    // Check if user has enough credits
    if (available < 100) {
      setAvailableCredits(available);
      setShowInsufficientCreditsModal(true);
      return;
    }

    // Burn credits if sufficient
    burnCredits(100);
    router.refresh();
  };

  const navItems = [
    { href: '/overview', icon: LayoutDashboard, label: "What's new!" },
    { href: '/your-plan', icon: CreditCard, label: 'Your Plan' },
    { href: '/usage', icon: TrendingUp, label: 'Usage' },
  ];

  const teamItems =
    user?.plan === 'teams'
      ? [
          { href: '/teams/members', icon: Users, label: 'Team Members' },
          { href: '/teams/usage', icon: BarChart3, label: 'Team Usage' },
          { href: '/teams/manage', icon: Settings, label: 'Manage Team' },
        ]
      : [];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="text-lg font-semibold">Kombai</div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {teamItems.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Teams</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {teamItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        <SidebarSeparator className="mb-2" />
        
        {/* Burn Credits */}
        {user && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground px-2">Demo Utility</div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleBurnCredits}
            >
              <Flame className="h-4 w-4 mr-2" />
              Burn 100 Credits
            </Button>
          </div>
        )}

        {/* User Impersonation Dropdown */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground px-2">User</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span className="truncate">{currentUser || 'Select user'}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {Object.keys(users).map((email) => (
                <DropdownMenuItem
                  key={email}
                  onClick={() => handleImpersonate(email)}
                  className={currentUser === email ? 'bg-accent' : ''}
                >
                  {email}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Process Billing Cycle */}
        {user && user.planStatus === 'cancelled' && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground px-2">Demo Utility</div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleProcessBillingCycle}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Process Billing Cycle
            </Button>
          </div>
        )}

        {/* Dev Tools */}
        <div className="space-y-1">
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-destructive hover:text-destructive"
            onClick={handleClearStorage}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Storage
          </Button>
        </div>

        {user && (
          <div className="text-xs text-muted-foreground px-2 pt-2">
            Plan: <span className="font-medium capitalize">{user.plan}</span>
          </div>
        )}
      </SidebarFooter>

      <InsufficientCreditsModal
        open={showInsufficientCreditsModal}
        onOpenChange={setShowInsufficientCreditsModal}
        availableCredits={availableCredits}
        requiredCredits={100}
      />
    </Sidebar>
  );
}
