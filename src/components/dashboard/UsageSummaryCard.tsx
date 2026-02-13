import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

interface UsageSummaryCardProps {
  usedCredits: number;
  totalCredits: number;
  detailsPath?: string;
}

export function UsageSummaryCard({ usedCredits, totalCredits, detailsPath = '/usage' }: UsageSummaryCardProps) {
  const router = useRouter();
  // Generate mock daily usage data for the current billing cycle
  const usageData = useMemo(() => {
    const data = [];
    const today = new Date();
    const days = 30; // Show last 30 days
    
    // Generate cumulative usage data
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Mock cumulative credits used (gradually increasing to current usedCredits)
      const progress = (days - i) / days;
      const credits = Math.floor(usedCredits * progress);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        credits: credits,
      });
    }
    
    return data;
  }, [usedCredits]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Usage Summary</CardTitle>
            <CardDescription>Credit usage trend for current billing cycle</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(detailsPath)}
          >
            View Detailed Usage
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Credits Used</p>
              <p className="text-2xl font-bold">{usedCredits}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Credits Remaining</p>
              <p className="text-2xl font-bold">{totalCredits - usedCredits}</p>
            </div>
          </div>
          
          <ChartContainer
            config={{
              credits: {
                label: 'Credits Used',
                color: 'hsl(var(--primary))',
              },
            }}
            className="h-[200px] w-full"
          >
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="credits"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
