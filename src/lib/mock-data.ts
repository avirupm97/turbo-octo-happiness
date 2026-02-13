// Mock chat history data for demonstration purposes
export interface MockChatEntry {
  chatTitle: string;
  messages: Array<{
    timestamp: Date;
    creditsUsed: number;
  }>;
}

export const mockChatHistory: MockChatEntry[] = [
  {
    chatTitle: 'Extra Credits UI Refactor',
    messages: [
      {
        timestamp: new Date('2026-02-13T16:26:00'),
        creditsUsed: 42,
      },
      {
        timestamp: new Date('2026-02-13T16:29:00'),
        creditsUsed: 54,
      },
      {
        timestamp: new Date('2026-02-13T16:30:00'),
        creditsUsed: 16,
      },
      {
        timestamp: new Date('2026-02-13T16:32:00'),
        creditsUsed: 16,
      },
      {
        timestamp: new Date('2026-02-13T16:36:00'),
        creditsUsed: 22,
      },
      {
        timestamp: new Date('2026-02-13T17:13:00'),
        creditsUsed: 25,
      },
      {
        timestamp: new Date('2026-02-13T17:16:00'),
        creditsUsed: 38,
      },
      {
        timestamp: new Date('2026-02-13T17:18:00'),
        creditsUsed: 8,
      },
      {
        timestamp: new Date('2026-02-13T17:19:00'),
        creditsUsed: 81,
      },
    ],
  },
  {
    chatTitle: 'Extra Credits Feature Implementation',
    messages: [
      {
        timestamp: new Date('2026-02-12T14:20:00'),
        creditsUsed: 35,
      },
      {
        timestamp: new Date('2026-02-12T14:25:00'),
        creditsUsed: 48,
      },
      {
        timestamp: new Date('2026-02-12T14:30:00'),
        creditsUsed: 62,
      },
    ],
  },
];
