import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/site/bits";
import { FilterSection } from "@/components/site/FilterPanel";
import { categoriesQuery } from "@/lib/api";

type Search = { q?: string | undefined };

export const Route = createFileRoute("/categories")({
  validateSearch: (s: { q?: unknown }): Search => ({ q: typeof s.q === "string" && s.q ? s.q : undefined }),
  head: () => ({
    meta: [
      { title: "Категории храни – От Полето" },
      { name: "description", content: "Плодове, зеленчуци, млечни продукти, мед, хляб и още от местни производители." },
      { property: "og:title", content: "Категории – От Полето" },
      { property: "og:description", content: "Разгледай храната по категории." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { q = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/categories" });
  const categories = useQuery(categoriesQuery());
  const term = q.trim().toLocaleLowerCase("bg");
  const list = (categories.data ?? []).filter((category) => !term || category.name.toLocaleLowerCase("bg").includes(term));
  return (
    <>
      <PageHeader title="Категории" subtitle="Избери какво ти се яде днес." />
      <div className="container-page py-7 sm:py-10">
        <div className="mb-8 max-w-md">
          <FilterSection title="Търсене">
            <Input value={q} onChange={(event) => navigate({ search: { q: event.target.value || undefined } })} placeholder="Напр. мед" aria-label="Търси категория" />
          </FilterSection>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
        {list.map((c) => (
          <Link key={c.slug} to="/products" search={{ category: [c.slug] }} className="hover-lift group relative aspect-[4/3] overflow-hidden rounded-2xl">
            <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/85 to-transparent" />
            <div className="absolute bottom-0 p-3 sm:p-5"><p className="font-display text-base font-semibold leading-tight text-primary-foreground sm:text-2xl">{c.name}</p><p className="mt-1 text-xs text-primary-foreground/80 sm:text-base">{c.count} продукта</p></div>
          </Link>
        ))}
        </div>
        {categories.isError && <p className="py-16 text-center text-muted-foreground">Не успяхме да заредим категориите.</p>}
        {!categories.isLoading && !categories.isError && list.length === 0 && <p className="py-16 text-center text-muted-foreground">Няма намерени категории.</p>}
      </div>
    </>
  );
}
