'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, MoreHorizontal, LucideIcon } from 'lucide-react';

interface OnboardingCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  buttonVariant?: 'default' | 'outline' | 'secondary';
  onButtonClick?: () => void;
}

export function OnboardingCard({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonVariant = 'default',
  onButtonClick,
}: OnboardingCardProps) {
  return (
    <Card className="border-primary/20 h-full w-full max-w-[400px] mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
        
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <button
            className="p-1.5 rounded hover:bg-accent transition-colors"
            aria-label="Helpful"
          >
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-accent transition-colors"
            aria-label="Not helpful"
          >
            <ThumbsDown className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-accent transition-colors ml-auto"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
