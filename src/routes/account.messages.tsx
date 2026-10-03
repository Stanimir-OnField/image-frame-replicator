import { createFileRoute } from "@tanstack/react-router";
import { Messenger } from "@/components/site/Messenger";
import { PanelTitle } from "@/components/site/PanelLayout";

export const Route = createFileRoute("/account/messages")({
  component: () => <><PanelTitle title="Съобщения" /><Messenger /></>,
});
