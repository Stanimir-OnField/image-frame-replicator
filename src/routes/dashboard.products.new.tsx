import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PanelTitle } from "@/components/site/PanelLayout";
import { categories } from "@/lib/mock-data";
import { deliveryLabels } from "@/lib/format";

export const Route = createFileRoute("/dashboard/products/new")({ component: ProductForm });

function ProductForm() {
  const navigate = useNavigate();
  return (
    <>
      <PanelTitle title="Добави продукт" />
      <form className="card-soft space-y-6 p-6" onSubmit={(e) => { e.preventDefault(); toast.success("Продуктът е запазен"); navigate({ to: "/dashboard/products" }); }}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2"><Label htmlFor="n">Име на продукта</Label><Input id="n" required placeholder="напр. Розови домати" /></div>
          <div className="space-y-1.5"><Label>Категория</Label>
            <Select required><SelectTrigger className="rounded-xl"><SelectValue placeholder="Избери" /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label htmlFor="pr">Цена (€)</Label><Input id="pr" type="number" step="0.01" min="0" required /></div>
            <div className="space-y-1.5"><Label>Мерна единица</Label>
              <Select defaultValue="кг"><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{["кг", "бр.", "л", "буркан", "връзка"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <div className="space-y-1.5 md:col-span-2"><Label htmlFor="d">Описание</Label><Textarea id="d" rows={4} placeholder="Как е отгледан, вкус, сорт..." /></div>
          <div className="md:col-span-2">
            <Label>Снимки</Label>
            <label className="mt-1.5 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-cream p-8 text-center text-muted-foreground hover:border-primary">
              <ImagePlus className="size-8 text-primary" />Плъзни снимки тук или кликни за избор<input type="file" multiple accept="image/*" className="sr-only" onChange={(e) => toast.success(`Избрани ${e.target.files?.length ?? 0} снимки`)} />
            </label>
          </div>
          <label className="flex items-center justify-between rounded-xl border border-border p-4"><span className="font-medium">Наличен</span><Switch defaultChecked /></label>
          <div className="space-y-1.5"><Label htmlFor="q">Количество (по избор)</Label><Input id="q" type="number" min="0" /></div>
          <fieldset className="md:col-span-2"><legend className="mb-2 text-sm font-medium">Начини на получаване</legend>
            <div className="flex flex-wrap gap-5">{Object.values(deliveryLabels).map((l) => <label key={l} className="flex items-center gap-2"><Checkbox defaultChecked={l !== "Куриер"} />{l}</label>)}</div>
          </fieldset>
        </div>
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => navigate({ to: "/dashboard/products" })}>Отказ</Button><Button type="submit">Запази продукта</Button></div>
      </form>
    </>
  );
}
