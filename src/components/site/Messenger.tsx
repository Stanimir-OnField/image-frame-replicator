import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { conversationsQuery } from "@/lib/api";
import { products } from "@/lib/mock-data";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EmptyState } from "./bits";

export function Messenger() {
  const q = useQuery(conversationsQuery());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [extra, setExtra] = useState<Record<string, Message[]>>({});
  const [read, setRead] = useState<string[]>([]);
  const [text, setText] = useState("");

  if (q.isLoading) return <Skeleton className="h-[560px] rounded-2xl" />;
  const convs = q.data ?? [];
  if (!convs.length) return <EmptyState icon={<MessageCircle />} title="Няма съобщения" text="Когато някой ти пише, разговорът ще се появи тук." />;
  const active = convs.find((c) => c.id === activeId);
  const product = active && products.find((p) => p.id === active.productId);

  return (
    <div className="card-soft grid h-[calc(100vh-200px)] min-h-[500px] md:h-[600px] overflow-hidden md:grid-cols-[300px_1fr]">
      <ul className={cn("overflow-y-auto border-r border-border", active && "hidden md:block")}>
        {convs.map((c) => {
          const unread = read.includes(c.id) ? 0 : c.unread;
          const last = [...c.messages, ...(extra[c.id] ?? [])].at(-1)!;
          return (
            <li key={c.id}>
              <button onClick={() => { setActiveId(c.id); setRead((r) => [...r, c.id]); }} className={cn("flex w-full items-center gap-3 p-4 text-left transition hover:bg-cream", c.id === activeId && "bg-cream")}>
                <img src={c.avatar} alt="" className="size-11 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2"><p className={cn("truncate", unread ? "font-bold text-forest" : "font-medium")}>{c.with}</p><span className="text-xs text-muted-foreground">{last.time}</span></div>
                  <p className="truncate text-sm text-muted-foreground">{last.text}</p>
                </div>
                {unread > 0 && <span className="grid size-5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{unread}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {active ? (
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveId(null)} aria-label="Назад"><ArrowLeft /></Button>
            <div className="flex-1"><p className="font-semibold text-forest">{active.with}</p>{product && <p className="text-xs text-muted-foreground">Относно: {product.name}</p>}</div>
            {product && <img src={product.images[0]} alt="" className="size-10 rounded-lg object-cover" />}
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-cream/50 p-4">
            {[...active.messages, ...(extra[active.id] ?? [])].map((m) => (
              <div key={m.id} className={cn("flex", m.fromMe && "justify-end")}>
                <div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5", m.fromMe ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-background shadow-sm")}>
                  <p>{m.text}</p><p className={cn("mt-1 text-right text-xs", m.fromMe ? "text-primary-foreground/70" : "text-muted-foreground")}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <form className="flex gap-2 border-t border-border p-3" onSubmit={(e) => {
            e.preventDefault(); if (!text.trim()) return;
            const now = new Date().toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" });
            setExtra((x) => ({ ...x, [active.id]: [...(x[active.id] ?? []), { id: crypto.randomUUID(), fromMe: true, text, time: now }] }));
            setText("");
          }}>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Напиши съобщение..." className="rounded-full" aria-label="Съобщение" />
            <Button type="submit" size="icon" aria-label="Изпрати"><Send /></Button>
          </form>
        </div>
      ) : (
        <div className="hidden place-items-center text-muted-foreground md:grid">Избери разговор</div>
      )}
    </div>
  );
}
