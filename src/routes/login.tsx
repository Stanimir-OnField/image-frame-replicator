import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/site/AuthCard";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Вход – От Полето" }, { name: "description", content: "Влез в своя профил в От Полето." },
    { property: "og:title", content: "Вход – От Полето" }, { property: "og:description", content: "Влез в своя профил." },
  ]}),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  return (
    <AuthCard title="Добре дошли отново" subtitle="Влез, за да пишеш на производители и да пазиш любими.">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Успешен вход"); navigate({ to: "/account" }); }}>
        <div className="space-y-1.5"><Label htmlFor="email">Имейл</Label><Input id="email" type="email" required placeholder="ime@primer.bg" /></div>
        <div className="space-y-1.5">
          <div className="flex justify-between"><Label htmlFor="pw">Парола</Label><Link to="/forgot-password" className="text-sm text-primary">Забравена парола?</Link></div>
          <Input id="pw" type="password" required />
        </div>
        <Button type="submit" className="w-full" size="lg">Вход</Button>
        <p className="text-center text-sm text-muted-foreground">Нямаш профил? <Link to="/register" className="font-semibold text-primary">Регистрирай се</Link></p>
      </form>
    </AuthCard>
  );
}
