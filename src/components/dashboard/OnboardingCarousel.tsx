'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { OnboardingCard } from './OnboardingCard';
import {
  ClipboardCheck,
  Rocket,
  Zap,
  BookOpen,
  Users,
  Sparkles,
} from 'lucide-react';

const onboardingItems = [
  {
    icon: ClipboardCheck,
    title: 'Review your app\'s UI/UX',
    description:
      'Reviewed visual design and responsive behavior. Found 16 issues: 2 high (mobile grid breakage, tabs overflow), 7 medium (hardcoded values, spacing inconsistencies), 7 low (polish items).\n\nClick Open to view the full design review report',
    buttonText: 'Open',
    buttonVariant: 'default' as const,
  },
  {
    icon: Rocket,
    title: 'Get Started Quickly',
    description:
      'Jump right in with our comprehensive getting started guide. Learn the basics of Kombai and start building your frontend projects with AI assistance in minutes.',
    buttonText: 'Start Guide',
    buttonVariant: 'default' as const,
  },
  {
    icon: Zap,
    title: 'Boost Your Productivity',
    description:
      'Discover powerful features that help you code faster. From intelligent component generation to automated styling, Kombai streamlines your development workflow.',
    buttonText: 'Explore',
    buttonVariant: 'default' as const,
  },
  {
    icon: BookOpen,
    title: 'Learn Best Practices',
    description:
      'Access curated resources and documentation to master frontend development. Get tips on React, TypeScript, Tailwind CSS, and modern design patterns.',
    buttonText: 'Read More',
    buttonVariant: 'outline' as const,
  },
  {
    icon: Users,
    title: 'Collaborate with Teams',
    description:
      'Invite team members and work together seamlessly. Share credits, manage permissions, and build better products with collaborative AI development.',
    buttonText: 'Invite Team',
    buttonVariant: 'default' as const,
  },
  {
    icon: Sparkles,
    title: 'Explore Advanced Features',
    description:
      'Unlock the full potential of Kombai with advanced features. From custom component libraries to design system integration, take your projects to the next level.',
    buttonText: 'Learn More',
    buttonVariant: 'outline' as const,
  },
];

export function OnboardingCarousel() {
  return (
    <div className="relative flex items-center justify-center gap-4">
      <Carousel
        opts={{
          align: 'center',
          loop: true,
        }}
        className="w-full max-w-[400px]"
      >
        <CarouselContent>
          {onboardingItems.map((item, index) => (
            <CarouselItem key={index} className="basis-full">
              <OnboardingCard
                icon={item.icon}
                title={item.title}
                description={item.description}
                buttonText={item.buttonText}
                buttonVariant={item.buttonVariant}
                onButtonClick={() => console.log(`Clicked: ${item.title}`)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute -left-16" />
        <CarouselNext className="absolute -right-16" />
      </Carousel>
    </div>
  );
}
