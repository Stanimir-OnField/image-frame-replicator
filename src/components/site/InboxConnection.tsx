import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { meQuery, useAuthToken } from "@/lib/api";
import { applyInboxEvent, subscribeInbox } from "@/lib/inbox";

export function InboxConnection() {
  const token = useAuthToken();
  const me = useQuery({ ...meQuery(), enabled: !!token });
  const queryClient = useQueryClient();
  const userId = me.data?.id;

  useEffect(() => {
    if (!token || !userId) return;
    const { consumer, subscription } = subscribeInbox(token, (event) => {
      applyInboxEvent(queryClient, userId, event);
    });
    const beat = window.setInterval(() => subscription.perform("appear"), 30_000);
    return () => {
      window.clearInterval(beat);
      subscription.unsubscribe();
      consumer.disconnect();
    };
  }, [token, userId, queryClient]);

  return null;
}
