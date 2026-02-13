import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CreditTransaction } from '@/lib/types';

interface AllocationTabProps {
  transactions: CreditTransaction[];
}

export function AllocationTab({ transactions }: AllocationTabProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  // Sort transactions by date descending (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedTransactions.length === 0 ? (
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
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="text-foreground">{formatDate(transaction.date)}</TableCell>
                <TableCell className="text-foreground font-medium">{transaction.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
