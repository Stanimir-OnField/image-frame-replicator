import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/site/AuthCard";
import { requestPasswordReset, resetPassword } from "@/lib/api";

type Search = { token?: string | undefined };

export const Route = createFileRoute("/forgot-password")({
  validateSearch: (search: { token?: unknown }): Search => ({ token: typeof search.token === "string" ? search.token : undefined }),
  head: () => ({ meta: [
    { title: "Забравена парола – От Полето" }, { name: "description", content: "Възстанови достъпа до своя профил." },
    { property: "og:title", content: "Забравена парола – От Полето" }, { property: "og:description", content: "Възстановяване на парола." },
  ]}),
  component: Forgot,
});

function Forgot() {
  const { token } = Route.useSearch();
  const [sent, setSent] = useState(false);
  const [reset, setReset] = useState(false);
  return (
    <AuthCard title="Забравена парола" subtitle={token ? "Избери нова парола за профила си." : "Ще ти изпратим линк за нова парола."}>
      {reset ? (
        <div className="text-center"><MailCheck className="mx-auto size-12 text-primary" /><p className="mt-3">Паролата е обновена.</p><Button asChild variant="outline" className="mt-6"><Link to="/login">Към вход</Link></Button></div>
      ) : token ? (
        <form className="space-y-4" onSubmit={async (event) => {
          event.preventDefault();
          const password = String(new FormData(event.currentTarget).get("password"));
          try {
            await resetPassword(token, password);
            setReset(true);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Линкът е невалиден");
          }
        }}>
          <div className="space-y-1.5"><Label htmlFor="password">Нова парола</Label><Input id="password" name="password" type="password" required minLength={8} /></div>
          <Button type="submit" className="w-full" size="lg">Запази паролата</Button>
        </form>
      ) : sent ? (
        <div className="text-center"><MailCheck className="mx-auto size-12 text-primary" /><p className="mt-3">Провери пощата си за линк за възстановяване.</p><Button asChild variant="outline" className="mt-6"><Link to="/login">Обратно към вход</Link></Button></div>
      ) : (
        <form className="space-y-4" onSubmit={async (event) => {
          event.preventDefault();
          const email = String(new FormData(event.currentTarget).get("email"));
          try {
            await requestPasswordReset(email);
            setSent(true);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Неуспешно изпращане");
          }
        }}>
          <div className="space-y-1.5"><Label htmlFor="email">Имейл</Label><Input id="email" name="email" type="email" required /></div>
          <Button type="submit" className="w-full" size="lg">Изпрати линк</Button>
        </form>
      )}
    </AuthCard>
  );
}
