import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, Store, Package, MessageCircle, Star, Settings } from "lucide-react";
import { PanelLayout } from "@/components/site/PanelLayout";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "Табло на производителя – От Полето" }, { name: "description", content: "Управлявай продуктите, съобщенията и профила си." },
    { property: "og:title", content: "Табло на производителя – От Полето" }, { property: "og:description", content: "Управлявай продуктите, съобщенията и профила си." },
  ]}),
  component: () => (
    <PanelLayout requireRole="producer" title="Табло на производителя" subtitle="Табло на производителя" items={[
      { to: "/dashboard", label: "Табло", icon: LayoutDashboard, exact: true },
      { to: "/dashboard/profile", label: "Моят профил", icon: Store },
      { to: "/dashboard/products", label: "Моите продукти", icon: Package },
      { to: "/dashboard/messages", label: "Съобщения", icon: MessageCircle },
      { to: "/dashboard/reviews", label: "Отзиви", icon: Star },
      { to: "/dashboard/settings", label: "Настройки", icon: Settings },
    ]} />
  ),
});
