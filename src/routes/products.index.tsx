import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useId } from "react";
import { LayoutGrid, List, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CardSkeleton, ProductCard } from "@/components/site/cards";
import { EmptyState, PageHeader, PageNav } from "@/components/site/bits";
import { FilterAside, FilterDrawer, FilterSection, searchCoordinate, searchFlag, searchNumber } from "@/components/site/FilterPanel";
import { categoriesQuery, locationsQuery, producersQuery, productsQuery } from "@/lib/api";
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
    minPrice: searchNumber(s.minPrice),
    maxPrice: searchNumber(s.maxPrice),
    available: searchFlag(s.available),
    verified: searchFlag(s.verified),
    lat: searchCoordinate(s.lat),
    lng: searchCoordinate(s.lng),
    radius: (() => {
      const radius = searchNumber(s.radius);
      return radius && radius > 0 ? radius : undefined;
    })(),
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

function commitNumber(value: string) {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function Filters({ s, set }: { s: Search; set: (p: Partial<Search>) => void }) {
  const ratingName = useId();
  const categories = useQuery(categoriesQuery());
  const locations = useQuery(locationsQuery());
  const producers = useQuery(producersQuery({ perPage: 48 }));
  const choices = [
    { title: "Категория", key: "category" as const, opts: (categories.data ?? []).map((c) => [c.slug, c.name] as const) },
    { title: "Населено място", key: "location" as const, opts: (locations.data ?? []).map((l) => [l, l] as const) },
    { title: "Производител", key: "producer" as const, opts: (producers.data?.items ?? []).map((p) => [p.slug, p.name] as const) },
  ];
  return (
    <div className="space-y-5">
      <FilterSection title="Търсене">
        <Input key={s.q ?? ""} defaultValue={s.q ?? ""} placeholder="Напр. мед" onKeyDown={(e) => e.key === "Enter" && set({ q: (e.target as HTMLInputElement).value || undefined })} onBlur={(e) => set({ q: e.target.value || undefined })} />
      </FilterSection>
      {choices.map((choice) => (
        <FilterSection key={choice.key} title={choice.title}>
          <Select value={s[choice.key] ?? ALL} onValueChange={(value) => set({ [choice.key]: value === ALL ? undefined : value })}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Всички</SelectItem>
              {choice.opts.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterSection>
      ))}
      <FilterSection title="Разстояние">
        <div className="grid grid-cols-2 gap-2">
          <Input key={`lat-${s.lat ?? ""}`} type="number" step="0.0000001" inputMode="decimal" defaultValue={s.lat ?? ""} placeholder="Ширина" aria-label="Географска ширина" onBlur={(e) => set({ lat: searchCoordinate(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
          <Input key={`lng-${s.lng ?? ""}`} type="number" step="0.0000001" inputMode="decimal" defaultValue={s.lng ?? ""} placeholder="Дължина" aria-label="Географска дължина" onBlur={(e) => set({ lng: searchCoordinate(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
        </div>
        <Input key={`radius-${s.radius ?? ""}`} type="number" min={1} step="1" inputMode="numeric" defaultValue={s.radius ?? ""} placeholder="Радиус в км" aria-label="Радиус в километри" onBlur={(e) => set({ radius: (() => { const radius = searchNumber(e.target.value); return radius && radius > 0 ? radius : undefined; })() })} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
      </FilterSection>
      <FilterSection title="Цена (€)">
        <div className="grid grid-cols-2 gap-2">
          <Input key={`min-${s.minPrice ?? ""}`} type="number" min={0} step="0.1" inputMode="decimal" defaultValue={s.minPrice ?? ""} placeholder="От" aria-label="Минимална цена" onBlur={(e) => set({ minPrice: commitNumber(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
          <Input key={`max-${s.maxPrice ?? ""}`} type="number" min={0} step="0.1" inputMode="decimal" defaultValue={s.maxPrice ?? ""} placeholder="До" aria-label="Максимална цена" onBlur={(e) => set({ maxPrice: commitNumber(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
        </div>
      </FilterSection>
      <FilterSection title="Начин на получаване">
        <div className="space-y-2">
          {(Object.keys(deliveryLabels) as DeliveryMethod[]).map((method) => (
            <label key={method} className="flex items-center gap-2 text-sm">
              <Checkbox checked={s.delivery?.includes(method) ?? false} onCheckedChange={(checked) => {
                const current = s.delivery ?? [];
                const next = checked ? [...current, method] : current.filter((item) => item !== method);
                set({ delivery: next.length ? next : undefined });
              }} />
              {deliveryLabels[method]}
            </label>
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Оценка">
        <div className="space-y-2">
          {[4.5, 4, 0].map((rating) => (
            <label key={rating} className="flex items-center gap-2 text-sm">
              <input type="radio" name={ratingName} className="accent-[var(--primary)]" checked={(s.minRating ?? 0) === rating} onChange={() => set({ minRating: rating || undefined })} />
              {rating ? `${rating}+ звезди` : "Всички"}
            </label>
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Наличност">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={s.available ?? false} onCheckedChange={(checked) => set({ available: checked ? true : undefined })} />
          Само налични
        </label>
      </FilterSection>
      <FilterSection title="Потвърждение">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={s.verified ?? false} onCheckedChange={(checked) => set({ verified: checked ? true : undefined })} />
          Само потвърдени производители
        </label>
      </FilterSection>
      <Button variant="outline" className="w-full" asChild><Link to="/products" search={{ view: s.view }}>Изчисти филтрите</Link></Button>
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
      <div className="container-page grid gap-8 py-7 sm:py-10 lg:grid-cols-[260px_1fr]">
        <FilterAside><Filters s={s} set={set} /></FilterAside>
        <div>
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <p className="text-muted-foreground">{q.data ? `${q.data.total} продукта` : "Зареждане..."}</p>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 sm:flex">
              <FilterDrawer><Filters s={s} set={set} /></FilterDrawer>
              <Select value={s.sort ?? "popular"} onValueChange={(v) => set({ sort: v as Search["sort"] })}>
                <SelectTrigger className="w-full min-w-0 rounded-full sm:w-52" aria-label="Подреди по"><SelectValue /></SelectTrigger>
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
            <EmptyState icon={<SearchX />} title="Нещо се обърка" text={q.error instanceof Error ? q.error.message : "Не успяхме да заредим продуктите."} action={<Button onClick={() => q.refetch()}>Опитай отново</Button>} />
          ) : q.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : q.data!.items.length === 0 ? (
            <EmptyState icon={<SearchX />} title="Няма намерени продукти" text="Опитай с друга дума или премахни някои филтри." action={<Button asChild><Link to="/products" search={{}}>Изчисти филтрите</Link></Button>} />
          ) : (
            <>
              <div className={cn("grid gap-6", list ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3")}>
                {q.data!.items.map((p) => <ProductCard key={p.id} product={p} layout={list ? "list" : "grid"} />)}
              </div>
              <PageNav page={q.data!.page} pages={q.data!.pages} onPage={(page) => set({ page })} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
