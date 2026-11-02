import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelTitle } from "@/components/site/PanelLayout";
import { categoriesQuery, myProductQuery, saveProduct } from "@/lib/api";
import { deliveryLabels } from "@/lib/format";
import type { DeliveryMethod, Product } from "@/lib/types";

type Search = { product?: string | undefined };

export const Route = createFileRoute("/dashboard/products/new")({
  validateSearch: (search: { product?: unknown }): Search => ({ product: typeof search.product === "string" ? search.product : undefined }),
  component: ProductForm,
});

function ProductForm() {
  const { product: slug } = Route.useSearch();
  const existing = useQuery({ ...myProductQuery(slug ?? ""), enabled: !!slug });
  if (slug && existing.isLoading) return <Skeleton className="h-96 rounded-2xl" />;
  return <ProductFields initial={existing.data} />;
}

function ProductFields({ initial }: { initial?: Product | undefined }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const categories = useQuery(categoriesQuery());
  const [category, setCategory] = useState(initial?.category ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "кг");
  const [available, setAvailable] = useState(initial?.available ?? true);
  const [delivery, setDelivery] = useState<DeliveryMethod[]>(initial?.delivery?.length ? initial.delivery : ["delivery", "pickup"]);
  const [files, setFiles] = useState<File[]>([]);

  return (
    <>
      <PanelTitle title={initial ? "Редактирай продукт" : "Добави продукт"} />
      <form className="card-soft space-y-6 p-4 sm:p-6" onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        if (!category) { toast.error("Избери категория"); return; }
        if (!delivery.length) { toast.error("Избери поне един начин на получаване"); return; }
        try {
          await saveProduct({
            name: String(data.get("name")),
            category,
            price: Number(data.get("price")),
            unit,
            description: String(data.get("description") ?? ""),
            available,
            quantity: String(data.get("quantity") ?? ""),
            delivery,
            status: initial?.status,
            images: files,
          }, initial?.id);
          await queryClient.invalidateQueries({ queryKey: ["dashboard", "products"] });
          await queryClient.invalidateQueries({ queryKey: ["products"] });
          toast.success("Продуктът е запазен");
          await navigate({ to: "/dashboard/products" });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Продуктът не е запазен");
        }
      }}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2"><Label htmlFor="n">Име на продукта</Label><Input id="n" name="name" required defaultValue={initial?.name} placeholder="напр. Розови домати" /></div>
          <div className="space-y-1.5"><Label>Категория</Label>
            <Select value={category} onValueChange={setCategory}><SelectTrigger className="rounded-xl"><SelectValue placeholder="Избери" /></SelectTrigger><SelectContent>{(categories.data ?? []).map((item) => <SelectItem key={item.slug} value={item.slug}>{item.name}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="pr">Цена (€)</Label><Input id="pr" name="price" type="number" step="0.01" min="0" required defaultValue={initial?.price} /></div>
            <div className="space-y-1.5"><Label>Мерна единица</Label>
              <Select value={unit} onValueChange={setUnit}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{["кг", "бр.", "л", "буркан", "връзка", initial?.unit].filter((value, index, all): value is string => Boolean(value) && all.indexOf(value) === index).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <div className="space-y-1.5 md:col-span-2"><Label htmlFor="d">Описание</Label><Textarea id="d" name="description" rows={4} defaultValue={initial?.description} placeholder="Как е отгледан, вкус, сорт..." /></div>
          <div className="md:col-span-2">
            <Label>Снимки</Label>
            {(initial?.images ?? []).some((src) => src.startsWith("http")) && (
              <div className="mt-1.5 flex gap-2 overflow-x-auto">
                {initial?.images.filter((src) => src.startsWith("http")).map((src) => <img key={src} src={src} alt="" className="size-20 rounded-xl object-cover" />)}
              </div>
            )}
            <label className="mt-1.5 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-cream p-8 text-center text-muted-foreground hover:border-primary">
              <ImagePlus className="size-8 text-primary" />{files.length ? `Избрани ${files.length} снимки` : "Плъзни снимки тук или кликни за избор"}<input type="file" multiple accept="image/*" className="sr-only" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
            </label>
          </div>
          <label className="flex items-center justify-between rounded-xl border border-border p-4"><span className="font-medium">Наличен</span><Switch checked={available} onCheckedChange={setAvailable} /></label>
          <div className="space-y-1.5"><Label htmlFor="q">Количество (по избор)</Label><Input id="q" name="quantity" type="number" min="0" defaultValue={initial?.quantity ?? ""} /></div>
          <fieldset className="md:col-span-2"><legend className="mb-2 text-sm font-medium">Начини на получаване</legend>
            <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-5">{(Object.keys(deliveryLabels) as DeliveryMethod[]).map((method) => <label key={method} className="flex min-h-10 items-center gap-2"><Checkbox checked={delivery.includes(method)} onCheckedChange={(checked) => setDelivery((current) => checked ? [...current, method] : current.filter((item) => item !== method))} />{deliveryLabels[method]}</label>)}</div>
          </fieldset>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end"><Button type="button" variant="ghost" onClick={() => void navigate({ to: "/dashboard/products" })}>Отказ</Button><Button type="submit">Запази продукта</Button></div>
      </form>
    </>
  );
}
