import { createFileRoute } from "@tanstack/react-router";
import { User, Heart, MessageCircle, Star, Settings } from "lucide-react";
import { PanelLayout } from "@/components/site/PanelLayout";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [
    { title: "Моят профил – От Полето" }, { name: "description", content: "Любими продукти, съобщения и отзиви." },
    { property: "og:title", content: "Моят профил – От Полето" }, { property: "og:description", content: "Любими продукти, съобщения и отзиви." },
  ]}),
  component: () => (
    <PanelLayout requireRole="any" title="Моят профил" subtitle="Клиентски профил" items={[
      { to: "/account", label: "Профил", icon: User, exact: true },
      { to: "/account/favorites", label: "Любими", icon: Heart },
      { to: "/account/messages", label: "Съобщения", icon: MessageCircle },
      { to: "/account/reviews", label: "Моите отзиви", icon: Star },
      { to: "/account/settings", label: "Настройки", icon: Settings },
    ]} />
  ),
});
