import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, List, SlidersHorizontal, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CardSkeleton, ProductCard } from "@/components/site/cards";
import { EmptyState, PageHeader } from "@/components/site/bits";
import { productsQuery } from "@/lib/api";
import { categories, locations, producers } from "@/lib/mock-data";
import { deliveryLabels } from "@/lib/format";
import type { DeliveryMethod, ProductFilters } from "@/lib/types";
import { cn } from "@/lib/utils";

type Search = ProductFilters & { view?: "grid" | "list" | undefined };

export const Route = createFileRoute("/products/")({
  validateSearch: (s: Partial<Record<keyof Search, unknown>>): Search => ({
    q: (s.q as string) || undefined,
    category: (s.category as string) || undefined,
    location: (s.location as string) || undefined,
    producer: (s.producer as string) || undefined,
    delivery: Array.isArray(s.delivery) ? (s.delivery as DeliveryMethod[]) : undefined,
    minRating: s.minRating ? Number(s.minRating) : undefined,
    maxPrice: s.maxPrice ? Number(s.maxPrice) : undefined,
    sort: (s.sort as Search["sort"]) || undefined,
    page: s.page ? Number(s.page) : undefined,
    view: (s.view as Search["view"]) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Продукти от местни производители – От Полето" },
      { name: "description", content: "Търси сезонни плодове, зеленчуци, мед, сирене и още директно от български производители." },
      { property: "og:title", content: "Продукти – От Полето" },
      { property: "og:description", content: "Пресни продукти от местни ферми в България." },
    ],
  }),
  component: ProductsPage,
});

const ALL = "__all";

function Filters({ s, set }: { s: Search; set: (p: Partial<Search>) => void }) {
  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <Label htmlFor="f-q">Търсене</Label>
        <Input id="f-q" defaultValue={s.q} placeholder="Напр. мед" onKeyDown={(e) => e.key === "Enter" && set({ q: (e.target as HTMLInputElement).value || undefined })} onBlur={(e) => set({ q: e.target.value || undefined })} />
      </div>
      {[
        { label: "Категория", key: "category" as const, opts: categories.map((c) => [c.slug, c.name] as const) },
        { label: "Населено място", key: "location" as const, opts: locations.map((l) => [l, l] as const) },
        { label: "Производител", key: "producer" as const, opts: producers.map((p) => [p.id, p.name] as const) },
      ].map((f) => (
        <div key={f.key} className="space-y-2">
          <Label>{f.label}</Label>
          <Select value={s[f.key] ?? ALL} onValueChange={(v) => set({ [f.key]: v === ALL ? undefined : v })}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Всички</SelectItem>
              {f.opts.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      ))}
      <div className="space-y-3">
        <Label>Максимална цена: €{s.maxPrice ?? 20}</Label>
        <Slider min={1} max={20} step={1} defaultValue={[s.maxPrice ?? 20]} onValueCommit={([v]) => set({ maxPrice: v === 20 ? undefined : v })} />
      </div>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Начин на получаване</legend>
        {(Object.keys(deliveryLabels) as DeliveryMethod[]).map((d) => (
          <label key={d} className="flex items-center gap-2 text-sm">
            <Checkbox checked={s.delivery?.includes(d) ?? false} onCheckedChange={(c) => {
              const cur = s.delivery ?? [];
              const next = c ? [...cur, d] : cur.filter((x) => x !== d);
              set({ delivery: next.length ? next : undefined });
            }} />
            {d === "courier" ? "Изпращане с куриер" : deliveryLabels[d]}
          </label>
        ))}
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Оценка</legend>
        {[4.5, 4, 0].map((r) => (
          <label key={r} className="flex items-center gap-2 text-sm">
            <input type="radio" name="rating" className="accent-[var(--primary)]" checked={(s.minRating ?? 0) === r} onChange={() => set({ minRating: r || undefined })} />
            {r ? `${r}+ звезди` : "Всички"}
          </label>
        ))}
      </fieldset>
      <Button variant="outline" className="w-full" asChild><Link to="/products" search={{}}>Изчисти филтрите</Link></Button>
    </div>
  );
}

function ProductsPage() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/products/" });
  const set = (p: Partial<Search>) => navigate({ search: (prev) => ({ ...prev, ...p, page: "page" in p ? p.page : undefined }) });
  const { view, ...filters } = s;
  const q = useQuery(productsQuery(filters));
  const list = view === "list";

  return (
    <>
      <PageHeader title="Продукти" subtitle="Сезонна храна от проверени местни производители.">
        <Breadcrumb className="mb-4"><BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Начало</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Продукти</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </PageHeader>
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block"><div className="card-soft sticky top-24 p-6"><Filters s={s} set={set} /></div></aside>
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground">{q.data ? `${q.data.total} продукта` : "Зареждане..."}</p>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild><Button variant="outline" className="lg:hidden"><SlidersHorizontal /> Филтри</Button></SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto"><SheetHeader><SheetTitle>Филтри</SheetTitle></SheetHeader><div className="px-4 pb-8"><Filters s={s} set={set} /></div></SheetContent>
              </Sheet>
              <Select value={s.sort ?? "popular"} onValueChange={(v) => set({ sort: v as Search["sort"] })}>
                <SelectTrigger className="w-52 rounded-full" aria-label="Подреди по"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Най-популярни</SelectItem>
                  <SelectItem value="rating">Най-висока оценка</SelectItem>
                  <SelectItem value="price_asc">Цена: ниска към висока</SelectItem>
                  <SelectItem value="price_desc">Цена: висока към ниска</SelectItem>
                  <SelectItem value="newest">Най-нови</SelectItem>
                </SelectContent>
              </Select>
              <div className="hidden rounded-full border border-border p-1 sm:flex">
                {(["grid", "list"] as const).map((v) => (
                  <button key={v} aria-label={v === "grid" ? "Мрежа" : "Списък"} onClick={() => navigate({ search: (p) => ({ ...p, view: v }) })}
                    className={cn("grid size-8 place-items-center rounded-full", (view ?? "grid") === v && "bg-primary text-primary-foreground")}>
                    {v === "grid" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {q.isError ? (
            <EmptyState icon={<SearchX />} title="Нещо се обърка" text="Не успяхме да заредим продуктите." action={<Button onClick={() => q.refetch()}>Опитай отново</Button>} />
          ) : q.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : q.data!.items.length === 0 ? (
            <EmptyState icon={<SearchX />} title="Няма намерени продукти" text="Опитай с друга дума или премахни някои филтри." action={<Button asChild><Link to="/products" search={{}}>Изчисти филтрите</Link></Button>} />
          ) : (
            <>
              <div className={cn("grid gap-6", list ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3")}>
                {q.data!.items.map((p) => <ProductCard key={p.id} product={p} layout={list ? "list" : "grid"} />)}
              </div>
              {q.data!.pages > 1 && (
                <nav className="mt-10 flex justify-center gap-2" aria-label="Страници">
                  {Array.from({ length: q.data!.pages }).map((_, i) => (
                    <Button key={i} size="icon" variant={q.data!.page === i + 1 ? "default" : "outline"} onClick={() => set({ page: i + 1 })}>{i + 1}</Button>
                  ))}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
