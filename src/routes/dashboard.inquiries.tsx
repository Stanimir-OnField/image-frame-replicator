import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PanelTitle } from "@/components/site/PanelLayout";
import { conversations, products } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/inquiries")({ component: Inquiries });

function Inquiries() {
  return (
    <>
      <PanelTitle title="Запитвания" />
      <div className="space-y-4">
        {conversations.map((c) => {
          const p = products.find((x) => x.id === c.productId)!;
          return (
            <div key={c.id} className="card-soft flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <img src={p.images[0]} alt="" className="size-16 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-semibold text-forest">{c.with} {c.unread > 0 && <span className="ml-2 rounded-full bg-sun px-2 py-0.5 text-xs font-bold text-sun-foreground">Ново</span>}</p>
                <p className="text-sm text-muted-foreground">Относно: {p.name} · {c.messages[0]?.time}</p>
                <p className="mt-1">{c.messages[0]?.text}</p>
              </div>
              <Button asChild variant="outline"><Link to="/dashboard/messages">Отговори</Link></Button>
            </div>
          );
        })}
      </div>
    </>
  );
}
