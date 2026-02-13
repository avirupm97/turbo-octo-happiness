import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { mockChatHistory } from '@/lib/mock-data';

export function UsageTab() {
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Your past chats</h2>
      
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
  );
}
