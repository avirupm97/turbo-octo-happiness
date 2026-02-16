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
  const { getCurrentUser, getViewingAsUser, currentUser, impersonatedUser, logout, clearStorage, setImpersonatedUser, processBillingCycle, burnCredits } = useAuthStore();
  const loggedInUser = getCurrentUser();
  const user = getViewingAsUser();
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
    // If selecting the logged-in user, clear impersonation
    if (email === currentUser) {
      setImpersonatedUser(null);
    } else {
      setImpersonatedUser(email);
    }
    router.refresh();
  };

  // Get list of users to show in dropdown based on plan
  const getAvailableUsers = (): string[] => {
    if (!loggedInUser) return [];

    // For Free and Pro users, only show themselves
    if (loggedInUser.plan === 'free' || loggedInUser.plan === 'pro') {
      return [currentUser];
    }

    // For Teams users, show all active members and billing admins
    if (loggedInUser.plan === 'teams' && loggedInUser.teamsPlan) {
      const activeMembers = loggedInUser.teamsPlan.members
        .filter(member => member.status === 'active')
        .map(member => member.email);

      const activeBillingAdmins = (loggedInUser.teamsPlan.billingAdmins || [])
        .filter(admin => admin.status === 'active')
        .map(admin => admin.email);

      // Combine and remove duplicates, then sort alphabetically
      const allUsers = [...new Set([...activeMembers, ...activeBillingAdmins])];
      return allUsers.sort();
    }

    return [currentUser];
  };

  const availableUsers = getAvailableUsers();
  const viewingAsEmail = impersonatedUser || currentUser;

  // Check if viewing user is a billing admin of the logged-in user's team
  const isViewingAsBillingAdmin = (): boolean => {
    if (!loggedInUser || !impersonatedUser) return false;
    if (loggedInUser.plan !== 'teams' || !loggedInUser.teamsPlan) return false;
    
    const billingAdmins = loggedInUser.teamsPlan.billingAdmins || [];
    return billingAdmins.some(admin => admin.email === impersonatedUser && admin.status === 'active');
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

  // Show team items if viewing user has teams plan OR is a billing admin
  const shouldShowTeamItems = user?.plan === 'teams' || isViewingAsBillingAdmin();
  
  const teamItems = shouldShowTeamItems
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
          <div className="text-xs text-muted-foreground px-2">Viewing as</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span className="truncate">{viewingAsEmail || 'Select user'}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {availableUsers.map((email) => (
                <DropdownMenuItem
                  key={email}
                  onClick={() => handleImpersonate(email)}
                  className={viewingAsEmail === email ? 'bg-accent' : ''}
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
