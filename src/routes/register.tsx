import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShoppingBasket, Tractor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/site/AuthCard";
import { register } from "@/lib/api";
import { cn } from "@/lib/utils";

type S = { type?: "customer" | "producer" | undefined };

export const Route = createFileRoute("/register")({
  validateSearch: (s: { type?: unknown }): S => ({ type: s.type === "producer" ? "producer" : s.type === "customer" ? "customer" : undefined }),
  head: () => ({ meta: [
    { title: "Регистрация – От Полето" }, { name: "description", content: "Създай безплатен профил като клиент или производител." },
    { property: "og:title", content: "Регистрация – От Полето" }, { property: "og:description", content: "Безплатна регистрация." },
  ]}),
  component: Register,
});

function Register() {
  const { type = "customer" } = Route.useSearch();
  const navigate = useNavigate({ from: "/register" });
  const queryClient = useQueryClient();
  const producer = type === "producer";
  return (
    <AuthCard title="Създай профил" subtitle="Регистрацията е безплатна.">
      <p className="mb-3 font-semibold text-forest">Как ще използваш платформата?</p>
      <div className="mb-6 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:gap-3" role="radiogroup">
        {([["customer", "Като клиент", ShoppingBasket], ["producer", "Като производител", Tractor]] as const).map(([v, l, I]) => (
          <button key={v} type="button" role="radio" aria-checked={type === v} onClick={() => navigate({ search: { type: v } })}
            className={cn("flex min-h-20 flex-row items-center justify-center gap-2 rounded-2xl border-2 p-3 text-sm font-semibold transition min-[360px]:flex-col min-[360px]:p-4", type === v ? "border-primary bg-accent text-forest" : "border-border")}>
            <I className="size-7 text-primary" />{l}
          </button>
        ))}
      </div>
      <form className="space-y-4" onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
          const user = await register({
            role: producer ? "producer" : "customer",
            name: String(data.get("name")),
            email: String(data.get("email")),
            password: String(data.get("password")),
            location: String(data.get("location") ?? ""),
            phone: String(data.get("phone") ?? ""),
          });
          queryClient.setQueryData(["me"], user);
          toast.success("Профилът е създаден!");
          await navigate({ to: producer ? "/dashboard" : "/account" });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Неуспешна регистрация");
        }
      }}>
        <div className="space-y-1.5"><Label htmlFor="name">{producer ? "Име на фермата / стопанството" : "Име и фамилия"}</Label><Input id="name" name="name" required /></div>
        {producer && <div className="space-y-1.5"><Label htmlFor="loc">Населено място</Label><Input id="loc" name="location" required placeholder="напр. с. Брестник, Пловдив" /></div>}
        <div className="space-y-1.5"><Label htmlFor="email">Имейл</Label><Input id="email" name="email" type="email" required /></div>
        {producer && <div className="space-y-1.5"><Label htmlFor="phone">Телефон</Label><Input id="phone" name="phone" type="tel" required /></div>}
        <div className="space-y-1.5"><Label htmlFor="pw">Парола</Label><Input id="pw" name="password" type="password" required minLength={8} /></div>
        <Button type="submit" className="w-full" size="lg" variant={producer ? "sun" : "default"}>{producer ? "Стани производител" : "Регистрация"}</Button>
        <p className="text-center text-sm text-muted-foreground">Имаш профил? <Link to="/login" className="font-semibold text-primary">Вход</Link></p>
      </form>
    </AuthCard>
  );
}
