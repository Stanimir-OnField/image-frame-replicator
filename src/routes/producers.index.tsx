import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useId } from "react";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, PageHeader, PageNav } from "@/components/site/bits";
import { CardSkeleton, ProducerCard } from "@/components/site/cards";
import { FilterAside, FilterDrawer, FilterSection, searchFlag } from "@/components/site/FilterPanel";
import { categoriesQuery, locationsQuery, producersQuery } from "@/lib/api";
import { deliveryLabels } from "@/lib/format";
import type { DeliveryMethod, ProducerFilters } from "@/lib/types";

type Search = ProducerFilters;

const ALL = "__all";

export const Route = createFileRoute("/producers/")({
  validateSearch: (s: Partial<Record<keyof Search, unknown>>): Search => {
    const page = Number(s.page);
    const sort = s.sort;
    return {
      q: typeof s.q === "string" && s.q ? s.q : undefined,
      category: typeof s.category === "string" && s.category ? s.category : undefined,
      location: typeof s.location === "string" && s.location ? s.location : undefined,
      delivery: Array.isArray(s.delivery) ? (s.delivery as DeliveryMethod[]) : undefined,
      minRating: s.minRating ? Number(s.minRating) : undefined,
      verified: searchFlag(s.verified),
      sort: sort === "rating" || sort === "name" || sort === "popular" ? sort : undefined,
      page: Number.isInteger(page) && page > 1 ? page : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Местни производители – От Полето" },
      { name: "description", content: "Ферми, мандри, пчелини и пекарни от цяла България." },
      { property: "og:title", content: "Производители – От Полето" },
      { property: "og:description", content: "Запознай се с хората зад храната." },
    ],
  }),
  component: ProducersPage,
});

function Filters({ s, set }: { s: Search; set: (patch: Partial<Search>) => void }) {
  const ratingName = useId();
  const categories = useQuery(categoriesQuery());
  const locations = useQuery(locationsQuery());
  return (
    <div className="space-y-5">
      <FilterSection title="Търсене">
        <Input key={s.q ?? ""} defaultValue={s.q ?? ""} placeholder="Име или град" onKeyDown={(event) => event.key === "Enter" && set({ q: (event.target as HTMLInputElement).value || undefined })} onBlur={(event) => set({ q: event.target.value || undefined })} />
      </FilterSection>
      <FilterSection title="Населено място">
        <Select value={s.location ?? ALL} onValueChange={(value) => set({ location: value === ALL ? undefined : value })}>
          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Цяла България</SelectItem>
            {(locations.data ?? []).map((location) => <SelectItem key={location} value={location}>{location}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterSection>
      <FilterSection title="Категория">
        <Select value={s.category ?? ALL} onValueChange={(value) => set({ category: value === ALL ? undefined : value })}>
          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Всички</SelectItem>
            {(categories.data ?? []).map((category) => <SelectItem key={category.slug} value={category.slug}>{category.name}</SelectItem>)}
          </SelectContent>
        </Select>
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
      <FilterSection title="Потвърждение">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={s.verified ?? false} onCheckedChange={(checked) => set({ verified: checked ? true : undefined })} />
          Само потвърдени
        </label>
      </FilterSection>
      <Button variant="outline" className="w-full" asChild><Link to="/producers" search={{}}>Изчисти филтрите</Link></Button>
    </div>
  );
}

function ProducersPage() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/producers/" });
  const set = (patch: Partial<Search>) => navigate({ search: (prev) => ({ ...prev, ...patch, page: "page" in patch ? patch.page : undefined }) });
  const q = useQuery({ ...producersQuery(s), placeholderData: keepPreviousData });
  const list = q.data?.items ?? [];
  return (
    <>
      <PageHeader title="Производители" subtitle="Запознай се с хората, които отглеждат храната ти." />
      <div className="container-page grid gap-8 py-7 sm:py-10 lg:grid-cols-[260px_1fr]">
        <FilterAside><Filters s={s} set={set} /></FilterAside>
        <div>
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <p className="text-muted-foreground">{q.data ? `${q.data.total} производителя` : "Зареждане..."}</p>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 sm:flex">
              <FilterDrawer><Filters s={s} set={set} /></FilterDrawer>
              <Select value={s.sort ?? "popular"} onValueChange={(value) => set({ sort: value as Search["sort"] })}>
                <SelectTrigger className="w-full min-w-0 rounded-full sm:w-52" aria-label="Подреди по"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Най-популярни</SelectItem>
                  <SelectItem value="rating">Най-висока оценка</SelectItem>
                  <SelectItem value="name">Име</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {q.isError ? (
            <EmptyState icon={<SearchX />} title="Нещо се обърка" text={q.error instanceof Error ? q.error.message : "Не успяхме да заредим производителите."} action={<Button onClick={() => q.refetch()}>Опитай отново</Button>} />
          ) : q.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <CardSkeleton key={index} />)}</div>
          ) : list.length === 0 ? (
            <EmptyState icon={<SearchX />} title="Няма намерени производители" text="Опитай с друга дума или премахни някои филтри." action={<Button asChild><Link to="/producers" search={{}}>Изчисти филтрите</Link></Button>} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{list.map((producer) => <ProducerCard key={producer.id} producer={producer} />)}</div>
          )}
          <PageNav page={q.data?.page ?? 1} pages={q.data?.pages ?? 1} onPage={(page) => set({ page: page > 1 ? page : undefined })} />
        </div>
      </div>
    </>
  );
}
