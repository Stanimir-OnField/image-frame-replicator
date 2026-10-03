import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/site/AuthCard";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [
    { title: "Забравена парола – От Полето" }, { name: "description", content: "Възстанови достъпа до своя профил." },
    { property: "og:title", content: "Забравена парола – От Полето" }, { property: "og:description", content: "Възстановяване на парола." },
  ]}),
  component: Forgot,
});

function Forgot() {
  const [sent, setSent] = useState(false);
  return (
    <AuthCard title="Забравена парола" subtitle="Ще ти изпратим линк за нова парола.">
      {sent ? (
        <div className="text-center"><MailCheck className="mx-auto size-12 text-primary" /><p className="mt-3">Провери пощата си за линк за възстановяване.</p><Button asChild variant="outline" className="mt-6"><Link to="/login">Обратно към вход</Link></Button></div>
      ) : (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <div className="space-y-1.5"><Label htmlFor="email">Имейл</Label><Input id="email" type="email" required /></div>
          <Button type="submit" className="w-full" size="lg">Изпрати линк</Button>
        </form>
      )}
    </AuthCard>
  );
}
