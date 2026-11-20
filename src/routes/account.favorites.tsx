import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelTitle } from "@/components/site/PanelLayout";
import { EmptyState, PageNav } from "@/components/site/bits";
import { FavoriteButton, ProducerCard, ProductCard } from "@/components/site/cards";
import { ListingFilters } from "@/components/site/FilterPanel";
import { favoriteProducersQuery } from "@/lib/api";
import { useFavorites } from "@/lib/favorites";

type Search = { tab?: "shops" | undefined; page?: number | undefined; q?: string | undefined };

export const Route = createFileRoute("/account/favorites")({
  validateSearch: (s: { tab?: unknown; page?: unknown; q?: unknown }): Search => {
    const page = Number(s.page);
    return {
      tab: s.tab === "shops" ? "shops" : undefined,
      page: Number.isInteger(page) && page > 1 ? page : undefined,
      q: typeof s.q === "string" && s.q ? s.q : undefined,
    };
  },
  component: Favorites,
});

function Favorites() {
  const { page, tab, q } = Route.useSearch();
  const navigate = useNavigate({ from: "/account/favorites" });
  const shops = tab === "shops";
  const productsQuery = useFavorites(shops ? undefined : page, shops ? undefined : q);
  const shopsQuery = useQuery({ ...favoriteProducersQuery(page, q), enabled: shops });
  const shopList = shopsQuery.data?.producers ?? [];
  const shopsPending = shops && shopsQuery.isLoading;
  const setTab = (value: string) => {
    void navigate({ search: { tab: value === "shops" ? "shops" : undefined, q, page: undefined } });
  };
  const setQuery = (value: string) => {
    void navigate({ search: { tab, q: value || undefined, page: undefined } });
  };
  return (
    <>
      <PanelTitle title="Любими" />
      <ListingFilters
        query={q ?? ""}
        onQuery={setQuery}
        placeholder={shops ? "Име или град" : "Име на продукт"}
        onClear={q ? () => setQuery("") : undefined}
      />
      <Tabs value={shops ? "shops" : "products"} onValueChange={setTab}>
        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <TabsList className="h-auto w-max justify-start gap-1 rounded-full bg-cream p-1">
            <TabsTrigger value="products" className="rounded-full px-4 py-2">
              Продукти
            </TabsTrigger>
            <TabsTrigger value="shops" className="rounded-full px-4 py-2">
              Производители
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="products" className="mt-6">
          {productsQuery.isLoading ? null : productsQuery.products.length === 0 ? (
            <EmptyState
              icon={<Heart />}
              title={q ? "Няма намерени продукти" : "Нямаш любими продукти"}
              text={
                q
                  ? "Опитай с друга дума или изчисти търсенето."
                  : "Натисни сърцето върху продукт, за да го запазиш тук."
              }
              action={
                q ? (
                  <Button variant="outline" onClick={() => setQuery("")}>
                    Изчисти
                  </Button>
                ) : (
                  <Button asChild>
                    <Link to="/products">Разгледай продукти</Link>
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {productsQuery.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <PageNav
            page={page ?? 1}
            pages={productsQuery.pages}
            onPage={(next) => navigate({ search: { tab, q, page: next > 1 ? next : undefined } })}
          />
        </TabsContent>
        <TabsContent value="shops" className="mt-6">
          {shopsPending ? null : shopList.length === 0 ? (
            <EmptyState
              icon={<Store />}
              title={q ? "Няма намерени производители" : "Нямаш любими производители"}
              text={
                q
                  ? "Опитай с друга дума или изчисти търсенето."
                  : "Натисни сърцето върху производител, за да го запазиш тук."
              }
              action={
                q ? (
                  <Button variant="outline" onClick={() => setQuery("")}>
                    Изчисти
                  </Button>
                ) : (
                  <Button asChild>
                    <Link to="/producers">Разгледай производители</Link>
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {shopList.map((producer) => (
                <div key={producer.id} className="relative">
                  <FavoriteButton
                    id={`producer:${producer.slug}`}
                    label={producer.name}
                    className="absolute right-3 top-3 z-10 border border-border"
                  />
                  <ProducerCard producer={producer} />
                </div>
              ))}
            </div>
          )}
          <PageNav
            page={page ?? 1}
            pages={shopsQuery.data?.pages ?? 1}
            onPage={(next) =>
              navigate({ search: { tab: "shops", q, page: next > 1 ? next : undefined } })
            }
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
