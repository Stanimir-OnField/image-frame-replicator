declare module "@rails/actioncable" {
  export interface Subscription {
    unsubscribe(): void;
    perform(action: string): void;
  }

  export interface Consumer {
    disconnect(): void;
    subscriptions: {
      create(channel: { channel: string }, callbacks: { received: (data: unknown) => void }): Subscription;
    };
  }

  export function createConsumer(url: string): Consumer;
}
