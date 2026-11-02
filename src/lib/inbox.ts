import type { QueryClient } from "@tanstack/react-query";
import { createConsumer, type Consumer, type Subscription } from "@rails/actioncable";
import { API_BASE_URL, mapAttachments, markConversationRead, messageTime } from "./api";
import type { Conversation } from "./types";

export interface InboxEvent {
  conversation_id: string;
  message: {
    id: string;
    sender_id: string | null;
    text: string;
    created_at: string;
    edited_at?: string | null;
    deleted?: boolean;
    attachments?: unknown;
  };
}

export function cableUrl(token: string) {
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
  return `${origin.replace(/^http/, "ws")}/cable?token=${encodeURIComponent(token)}`;
}

function isInboxEvent(value: unknown): value is InboxEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as InboxEvent;
  return (
    typeof event.conversation_id === "string" &&
    typeof event.message?.id === "string" &&
    typeof event.message.text === "string"
  );
}

export function applyInboxEvent(queryClient: QueryClient, userId: string, event: InboxEvent) {
  let found = false;
  for (const scope of ["customer", "producer"] as const) {
    queryClient.setQueryData<Conversation[]>(["conversations", scope], (current) => {
      if (!current) return current;
      const conversation = current.find((item) => item.id === event.conversation_id);
      if (!conversation) return current;
      found = true;
      const fromMe = event.message.sender_id === userId;
      const incoming = {
        id: event.message.id,
        fromMe,
        text: event.message.deleted ? "" : event.message.text,
        time: messageTime(event.message.created_at),
        createdAt: event.message.created_at,
        editedAt: event.message.deleted ? null : (event.message.edited_at ?? null),
        deleted: Boolean(event.message.deleted),
        attachments: event.message.deleted ? [] : mapAttachments(event.message.attachments),
      };
      const existing = conversation.messages.some((message) => message.id === incoming.id);
      const next: Conversation = {
        ...conversation,
        unread: existing || fromMe ? conversation.unread : conversation.unread + 1,
        messages: existing
          ? conversation.messages.map((message) =>
              message.id === incoming.id ? incoming : message,
            )
          : [...conversation.messages, incoming],
      };
      return [next, ...current.filter((item) => item.id !== conversation.id)];
    });
  }
  if (!found) void queryClient.invalidateQueries({ queryKey: ["conversations"] });
  void queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
  void queryClient.invalidateQueries({ queryKey: ["notifications"] });
}

export function subscribeInbox(
  token: string,
  onMessage: (event: InboxEvent) => void,
): { consumer: Consumer; subscription: Subscription } {
  const consumer = createConsumer(cableUrl(token));
  const subscription = consumer.subscriptions.create(
    { channel: "InboxChannel" },
    {
      received(data: unknown) {
        if (isInboxEvent(data)) onMessage(data);
      },
    },
  );
  return { consumer, subscription };
}

export function clearOpenUnread(queryClient: QueryClient, conversationId: string) {
  for (const scope of ["customer", "producer"] as const) {
    queryClient.setQueryData<Conversation[]>(["conversations", scope], (current) =>
      current?.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation,
      ),
    );
  }
  void markConversationRead(conversationId).finally(() => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  });
}
