import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/site/AuthCard";
import { login } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Вход – От Полето" }, { name: "description", content: "Влез в своя профил в От Полето." },
    { property: "og:title", content: "Вход – От Полето" }, { property: "og:description", content: "Влез в своя профил." },
  ]}),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return (
    <AuthCard title="Добре дошли отново" subtitle="Влез, за да пишеш на производители и да пазиш любими.">
      <form className="space-y-4" onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
          const user = await login(String(data.get("email")), String(data.get("password")));
          queryClient.setQueryData(["me"], user);
          toast.success("Успешен вход");
          await navigate({ to: user.role === "producer" ? "/dashboard" : "/account" });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Неуспешен вход");
        }
      }}>
        <div className="space-y-1.5"><Label htmlFor="email">Имейл</Label><Input id="email" name="email" type="email" required placeholder="ime@primer.bg" /></div>
        <div className="space-y-1.5">
          <div className="flex justify-between"><Label htmlFor="pw">Парола</Label><Link to="/forgot-password" className="text-sm text-primary">Забравена парола?</Link></div>
          <Input id="pw" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full" size="lg">Вход</Button>
        <p className="text-center text-sm text-muted-foreground">Нямаш профил? <Link to="/register" className="font-semibold text-primary">Регистрирай се</Link></p>
      </form>
    </AuthCard>
  );
}
