'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { QuickStatsCard } from '@/components/dashboard/QuickStatsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import { mockChatHistory } from '@/lib/mock-data';
import type { CreditTransaction } from '@/lib/types';

export default function TeamUsagePage() {
  const user = useAuthStore((state) => state.getCurrentUser());
  const [selectedMember, setSelectedMember] = useState<string>('');

  if (!user || user.plan !== 'teams' || !user.teamsPlan) {
    return null;
  }

  const totalCredits = user.teamsPlan.monthlyCredits;
  const usedCredits = user.teamsPlan.sharedCreditsUsed;
  const isTeamsOwner = user.teamsPlan.members.find(m => m.email === user.email)?.role === 'owner';
  
  // Mock transactions for the selected member
  const transactions: CreditTransaction[] = user.creditTransactions || [];

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const handleExportUsage = () => {
    // TODO: Implement export functionality
    console.log('Exporting usage data for all members');
  };

  const handleExportAllocation = () => {
    // TODO: Implement export functionality
    console.log('Exporting allocation data for all members');
  };

  return (
    <div className="space-y-6">
      <QuickStatsCard
        user={user}
        totalCredits={totalCredits}
        usedCredits={usedCredits}
        isTeamsOwner={isTeamsOwner}
      />

      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
        </TabsList>

        {/* Member Filter */}
        <div className="mt-6 flex items-center gap-4">
          <label htmlFor="member-filter" className="text-sm font-medium">
            Select Team Member:
          </label>
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger id="member-filter" className="w-64">
              <SelectValue placeholder="Select a member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {user.teamsPlan.members.map((member) => (
                <SelectItem key={member.email} value={member.email}>
                  {member.email} ({member.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="usage" className="mt-6">
          {!selectedMember ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground text-center">
                  Please select a team member to view their usage
                </p>
              </CardContent>
            </Card>
          ) : selectedMember === 'all' ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Members Usage</CardTitle>
                    <CardDescription>Export usage data for all team members</CardDescription>
                  </div>
                  <Button onClick={handleExportUsage} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">
                {selectedMember}&apos;s past chats
              </h2>
              
              <Accordion type="single" collapsible defaultValue="item-0">
                {mockChatHistory.map((chat, chatIndex) => (
                  <AccordionItem key={chatIndex} value={`item-${chatIndex}`}>
                    <AccordionTrigger className="text-base font-medium">
                      {chat.chatTitle}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {chat.messages.map((message, messageIndex) => (
                          <div
                            key={messageIndex}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Message sent:</span>
                              <span className="text-foreground">{formatTimestamp(message.timestamp)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Credits used:</span>
                              <span className="text-foreground font-medium">{message.creditsUsed}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </TabsContent>

        <TabsContent value="allocation" className="mt-6">
          {!selectedMember ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground text-center">
                  Please select a team member to view their allocation
                </p>
              </CardContent>
            </Card>
          ) : selectedMember === 'all' ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Members Allocation</CardTitle>
                    <CardDescription>Export allocation data for all team members</CardDescription>
                  </div>
                  <Button onClick={handleExportAllocation} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No credit transactions yet. Transactions will appear here when you purchase credits, upgrade plans, or receive daily credits.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Credits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...transactions]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-foreground">{formatDate(transaction.date)}</TableCell>
                          <TableCell className="text-foreground font-medium">{transaction.description}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
