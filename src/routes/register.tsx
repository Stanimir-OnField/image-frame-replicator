import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShoppingBasket, Tractor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/site/AuthCard";
import { cn } from "@/lib/utils";

type S = { type?: "customer" | "producer" };

export const Route = createFileRoute("/register")({
  validateSearch: (s: Record<string, unknown>): S => ({ type: s.type === "producer" ? "producer" : s.type === "customer" ? "customer" : undefined }),
  head: () => ({ meta: [
    { title: "Регистрация – От Полето" }, { name: "description", content: "Създай безплатен профил като клиент или производител." },
    { property: "og:title", content: "Регистрация – От Полето" }, { property: "og:description", content: "Безплатна регистрация." },
  ]}),
  component: Register,
});

function Register() {
  const { type = "customer" } = Route.useSearch();
  const navigate = useNavigate({ from: "/register" });
  const producer = type === "producer";
  return (
    <AuthCard title="Създай профил" subtitle="Регистрацията е безплатна.">
      <p className="mb-3 font-semibold text-forest">Как ще използваш платформата?</p>
      <div className="mb-6 grid grid-cols-2 gap-3" role="radiogroup">
        {([["customer", "Като клиент", ShoppingBasket], ["producer", "Като производител", Tractor]] as const).map(([v, l, I]) => (
          <button key={v} type="button" role="radio" aria-checked={type === v} onClick={() => navigate({ search: { type: v } })}
            className={cn("flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-sm font-semibold transition", type === v ? "border-primary bg-accent text-forest" : "border-border")}>
            <I className="size-7 text-primary" />{l}
          </button>
        ))}
      </div>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Профилът е създаден!"); navigate({ to: producer ? "/dashboard" : "/account" }); }}>
        <div className="space-y-1.5"><Label htmlFor="name">{producer ? "Име на фермата / стопанството" : "Име и фамилия"}</Label><Input id="name" required /></div>
        {producer && <div className="space-y-1.5"><Label htmlFor="loc">Населено място</Label><Input id="loc" required placeholder="напр. с. Брестник, Пловдив" /></div>}
        <div className="space-y-1.5"><Label htmlFor="email">Имейл</Label><Input id="email" type="email" required /></div>
        {producer && <div className="space-y-1.5"><Label htmlFor="phone">Телефон</Label><Input id="phone" type="tel" required /></div>}
        <div className="space-y-1.5"><Label htmlFor="pw">Парола</Label><Input id="pw" type="password" required minLength={8} /></div>
        <Button type="submit" className="w-full" size="lg" variant={producer ? "sun" : "default"}>{producer ? "Стани производител" : "Регистрация"}</Button>
        <p className="text-center text-sm text-muted-foreground">Имаш профил? <Link to="/login" className="font-semibold text-primary">Вход</Link></p>
      </form>
    </AuthCard>
  );
}
