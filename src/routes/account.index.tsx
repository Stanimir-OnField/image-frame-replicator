import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelTitle } from "@/components/site/PanelLayout";
import { meQuery, updateProfile, useAuthToken } from "@/lib/api";

export const Route = createFileRoute("/account/")({ component: Profile });

function Profile() {
  const token = useAuthToken();
  const me = useQuery({ ...meQuery(), enabled: !!token });
  const queryClient = useQueryClient();
  if (me.isLoading || !me.data) return <Skeleton className="h-64 rounded-2xl" />;
  const user = me.data;
  return (
    <>
      <PanelTitle title="Профил" />
      <form key={user.id} className="card-soft grid gap-5 p-4 sm:p-6 md:grid-cols-2" onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
          const next = await updateProfile({
            name: String(data.get("name")),
            email: String(data.get("email")),
            phone: String(data.get("phone")),
            city: String(data.get("city")),
          });
          queryClient.setQueryData(["me"], next);
          toast.success("Данните са запазени");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Данните не са запазени");
        }
      }}>
        <div className="space-y-1.5"><Label htmlFor="n">Име и фамилия</Label><Input id="n" name="name" defaultValue={user.name} required /></div>
        <div className="space-y-1.5"><Label htmlFor="e">Имейл</Label><Input id="e" name="email" type="email" defaultValue={user.email} required /></div>
        <div className="space-y-1.5"><Label htmlFor="p">Телефон</Label><Input id="p" name="phone" defaultValue={user.phone} /></div>
        <div className="space-y-1.5"><Label htmlFor="c">Град</Label><Input id="c" name="city" defaultValue={user.city} /></div>
        <div className="flex justify-end md:col-span-2"><Button type="submit" className="w-full sm:w-auto">Запази</Button></div>
      </form>
    </>
  );
}
