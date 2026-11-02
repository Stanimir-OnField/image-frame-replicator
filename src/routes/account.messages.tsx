import { createFileRoute } from "@tanstack/react-router";
import { Messenger } from "@/components/site/Messenger";
import { PanelTitle } from "@/components/site/PanelLayout";

type Search = { conversation?: string | undefined };

export const Route = createFileRoute("/account/messages")({
  validateSearch: (search: { conversation?: unknown }): Search => ({
    conversation: typeof search.conversation === "string" ? search.conversation : undefined,
  }),
  component: Messages,
});

function Messages() {
  const { conversation } = Route.useSearch();
  return (
    <>
      <PanelTitle title="Съобщения" compact />
      <Messenger scope="customer" {...(conversation ? { conversationId: conversation } : {})} />
    </>
  );
}
