import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelTitle } from "@/components/site/PanelLayout";
import { dashboardProfileQuery, updateProducerProfile } from "@/lib/api";

export const Route = createFileRoute("/dashboard/profile")({ component: Profile });

function Profile() {
  const q = useQuery(dashboardProfileQuery());
  const queryClient = useQueryClient();
  if (q.isLoading || !q.data) return <Skeleton className="h-96 rounded-2xl" />;
  const producer = q.data;
  return (
    <>
      <PanelTitle title="Моят профил" action={<Button asChild variant="outline"><Link to="/producers/$id" params={{ id: producer.slug }}>Виж публичния профил</Link></Button>} />
      <form className="card-soft space-y-5 p-4 sm:p-6" onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
          const avatar = data.get("avatar");
          const cover = data.get("cover");
          const next = await updateProducerProfile({
            name: String(data.get("name")),
            location: String(data.get("location")),
            phone: String(data.get("phone")),
            email: String(data.get("email")),
            website: String(data.get("website")),
            pickupInfo: String(data.get("pickup")),
            story: String(data.get("story")),
            latitude: String(data.get("latitude") ?? ""),
            longitude: String(data.get("longitude") ?? ""),
            avatar: avatar instanceof File && avatar.size > 0 ? avatar : undefined,
            cover: cover instanceof File && cover.size > 0 ? cover : undefined,
          });
          queryClient.setQueryData(["dashboard", "profile"], next);
          await queryClient.invalidateQueries({ queryKey: ["me"] });
          toast.success("Профилът е обновен");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Профилът не е обновен");
        }
      }}>
        <div className="relative mb-12 h-40 overflow-hidden rounded-2xl"><img src={producer.cover} alt="" className="h-full w-full object-cover" /></div>
        <img src={producer.avatar} alt="" className="-mt-24 relative size-24 rounded-2xl border-4 border-background object-cover" />
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="cover">Корица</Label><Input id="cover" name="cover" type="file" accept="image/*" /></div>
          <div className="space-y-1.5"><Label htmlFor="avatar">Снимка</Label><Input id="avatar" name="avatar" type="file" accept="image/*" /></div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="n">Име на стопанството</Label><Input id="n" name="name" defaultValue={producer.name} required /></div>
          <div className="space-y-1.5"><Label htmlFor="l">Адрес / населено място</Label><Input id="l" name="location" defaultValue={producer.location} /></div>
          <div className="space-y-1.5"><Label htmlFor="lat">Географска ширина</Label><Input id="lat" name="latitude" type="number" step="0.0000001" defaultValue={producer.latitude ?? ""} /></div>
          <div className="space-y-1.5"><Label htmlFor="lng">Географска дължина</Label><Input id="lng" name="longitude" type="number" step="0.0000001" defaultValue={producer.longitude ?? ""} /></div>
          <div className="space-y-1.5"><Label htmlFor="ph">Телефон</Label><Input id="ph" name="phone" defaultValue={producer.phone} /></div>
          <div className="space-y-1.5"><Label htmlFor="em">Имейл</Label><Input id="em" name="email" type="email" defaultValue={producer.email} /></div>
          <div className="space-y-1.5"><Label htmlFor="w">Уебсайт / социални мрежи</Label><Input id="w" name="website" defaultValue={producer.website} /></div>
          <div className="space-y-1.5"><Label htmlFor="pi">Вземане от място</Label><Input id="pi" name="pickup" defaultValue={producer.pickupInfo} /></div>
          <div className="space-y-1.5 md:col-span-2"><Label htmlFor="s">За производителя</Label><Textarea id="s" name="story" rows={5} defaultValue={producer.story} /></div>
        </div>
        <div className="flex justify-end"><Button type="submit" className="w-full sm:w-auto">Запази промените</Button></div>
      </form>
    </>
  );
}
