import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PanelTitle } from "@/components/site/PanelLayout";
import { producers } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/profile")({ component: Profile });

function Profile() {
  const p = producers[0]!;
  return (
    <>
      <PanelTitle title="Моят профил" action={<Button asChild variant="outline"><Link to="/producers/$id" params={{ id: p.id }}>Виж публичния профил</Link></Button>} />
      <form className="card-soft space-y-5 p-4 sm:p-6" onSubmit={(e) => { e.preventDefault(); toast.success("Профилът е обновен"); }}>
        <div className="relative mb-12 h-40 overflow-hidden rounded-2xl"><img src={p.cover} alt="" className="h-full w-full object-cover" /></div>
        <img src={p.avatar} alt="" className="-mt-24 relative size-24 rounded-2xl border-4 border-background object-cover" />
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="n">Име на стопанството</Label><Input id="n" defaultValue={p.name} /></div>
          <div className="space-y-1.5"><Label htmlFor="l">Адрес / населено място</Label><Input id="l" defaultValue={p.location} /></div>
          <div className="space-y-1.5"><Label htmlFor="ph">Телефон</Label><Input id="ph" defaultValue={p.phone} /></div>
          <div className="space-y-1.5"><Label htmlFor="em">Имейл</Label><Input id="em" defaultValue={p.email} /></div>
          <div className="space-y-1.5"><Label htmlFor="w">Уебсайт / социални мрежи</Label><Input id="w" defaultValue={p.website} /></div>
          <div className="space-y-1.5"><Label htmlFor="pi">Вземане от място</Label><Input id="pi" defaultValue={p.pickupInfo} /></div>
          <div className="space-y-1.5 md:col-span-2"><Label htmlFor="s">За производителя</Label><Textarea id="s" rows={5} defaultValue={p.story} /></div>
        </div>
        <div className="flex justify-end"><Button type="submit" className="w-full sm:w-auto">Запази промените</Button></div>
      </form>
    </>
  );
}
