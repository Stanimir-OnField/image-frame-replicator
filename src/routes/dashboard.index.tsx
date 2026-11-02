import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, MessageCircle, Star, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelTitle } from "@/components/site/PanelLayout";
import { dashboardOverviewQuery } from "@/lib/api";
import { messagePreview } from "@/lib/chat-attachments";
import { images } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/")({ component: Overview });

function Overview() {
  const q = useQuery(dashboardOverviewQuery());
  const data = q.data;
  const stats = [
    { label: "Активни продукти", value: data?.activeProducts ?? 0, icon: Package },
    { label: "Непрочетени съобщения", value: data?.unreadMessages ?? 0, icon: MessageCircle },
    { label: "Отзиви", value: data?.reviewsCount ?? 0, icon: Star },
    { label: "Прегледи на профила", value: (data?.profileViews ?? 0).toLocaleString("bg-BG"), icon: Eye },
  ];
  return (
    <>
      <PanelTitle title="Добро утро! 🌻" action={<Button asChild><Link to="/dashboard/products/new"><Plus /> Добави продукт</Link></Button>} />
      {q.isLoading ? <Skeleton className="h-28 rounded-2xl" /> : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card-soft min-w-0 p-4 sm:p-5">
              <div className="mb-3 grid size-10 place-items-center rounded-xl bg-accent text-primary"><s.icon className="size-5" /></div>
              <p className="font-display text-2xl font-semibold text-forest sm:text-3xl">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card-soft min-w-0 p-4 sm:p-6">
          <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] gap-3"><h2 className="text-xl font-semibold">Последни съобщения</h2><Link to="/dashboard/messages" className="text-sm font-semibold text-primary">Всички</Link></div>
          <ul className="divide-y divide-border">
            {(data?.recentConversations ?? []).map((conversation) => {
              const last = conversation.messages.at(-1);
              return (
                <li key={conversation.id}><Link to="/dashboard/messages" search={{ conversation: conversation.id }} className="flex items-center gap-3 py-3"><img src={conversation.productImage || conversation.avatar || images.vegetables} alt="" className="size-10 rounded-full object-cover" /><div className="min-w-0 flex-1"><p className="font-medium">{conversation.with}</p><p className="truncate text-sm text-muted-foreground">{last ? messagePreview(last) : ""}</p></div>{conversation.unread > 0 && <span className="rounded-full bg-sun px-2 py-0.5 text-xs font-bold text-sun-foreground">Ново</span>}</Link></li>
              );
            })}
          </ul>
        </div>
        <div className="card-soft min-w-0 p-4 sm:p-6">
          <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] gap-3"><h2 className="text-xl font-semibold">Най-гледани продукти</h2><Link to="/dashboard/products" className="text-sm font-semibold text-primary">Всички</Link></div>
          <ul className="divide-y divide-border">
            {(data?.topProducts ?? []).map((product) => (
              <li key={product.id} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 py-3 sm:flex"><img src={product.images[0]} alt="" className="size-10 rounded-lg object-cover" /><p className="min-w-0 flex-1 font-medium">{product.name}</p><span className="col-start-2 text-sm text-muted-foreground">{product.viewsCount} прегледа</span></li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
