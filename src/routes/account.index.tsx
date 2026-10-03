import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PanelTitle } from "@/components/site/PanelLayout";

export const Route = createFileRoute("/account/")({
  component: () => (
    <>
      <PanelTitle title="Профил" />
      <form className="card-soft grid gap-5 p-6 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast.success("Данните са запазени"); }}>
        <div className="space-y-1.5"><Label htmlFor="n">Име и фамилия</Label><Input id="n" defaultValue="Мария Петрова" /></div>
        <div className="space-y-1.5"><Label htmlFor="e">Имейл</Label><Input id="e" type="email" defaultValue="maria.petrova@mail.bg" /></div>
        <div className="space-y-1.5"><Label htmlFor="p">Телефон</Label><Input id="p" defaultValue="+359 888 777 666" /></div>
        <div className="space-y-1.5"><Label htmlFor="c">Град</Label><Input id="c" defaultValue="Пловдив" /></div>
        <div className="md:col-span-2 flex justify-end"><Button type="submit">Запази</Button></div>
      </form>
    </>
  ),
});
