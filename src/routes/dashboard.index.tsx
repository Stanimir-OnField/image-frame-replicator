import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Inbox, MessageCircle, Star, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanelTitle } from "@/components/site/PanelLayout";
import { conversations, products } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/")({ component: Overview });

function Overview() {
  const stats = [
    { label: "Активни продукти", value: 4, icon: Package },
    { label: "Нови запитвания", value: 3, icon: Inbox },
    { label: "Непрочетени съобщения", value: 3, icon: MessageCircle },
    { label: "Отзиви", value: 128, icon: Star },
    { label: "Прегледи на профила", value: "1 248", icon: Eye },
  ];
  return (
    <>
      <PanelTitle title="Добро утро! 🌻" action={<Button asChild><Link to="/dashboard/products/new"><Plus /> Добави продукт</Link></Button>} />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card-soft p-5">
            <div className="mb-3 grid size-10 place-items-center rounded-xl bg-accent text-primary"><s.icon className="size-5" /></div>
            <p className="font-display text-3xl font-semibold text-forest">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card-soft p-6">
          <div className="mb-4 flex justify-between"><h2 className="text-xl font-semibold">Последни запитвания</h2><Link to="/dashboard/inquiries" className="text-sm font-semibold text-primary">Всички</Link></div>
          <ul className="divide-y divide-border">
            {conversations.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3"><img src={c.avatar} alt="" className="size-10 rounded-full object-cover" /><div className="min-w-0 flex-1"><p className="font-medium">{c.with}</p><p className="truncate text-sm text-muted-foreground">{c.messages[0].text}</p></div>{c.unread > 0 && <span className="rounded-full bg-sun px-2 py-0.5 text-xs font-bold text-sun-foreground">Ново</span>}</li>
            ))}
          </ul>
        </div>
        <div className="card-soft p-6">
          <div className="mb-4 flex justify-between"><h2 className="text-xl font-semibold">Най-гледани продукти</h2><Link to="/dashboard/products" className="text-sm font-semibold text-primary">Всички</Link></div>
          <ul className="divide-y divide-border">
            {products.filter((p) => p.producerId === "zelenata-dolina").map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 py-3"><img src={p.images[0]} alt="" className="size-10 rounded-lg object-cover" /><p className="flex-1 font-medium">{p.name}</p><span className="text-sm text-muted-foreground">{320 - i * 70} прегледа</span></li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
