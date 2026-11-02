import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanelTitle } from "@/components/site/PanelLayout";
import { EmptyState, PageNav } from "@/components/site/bits";
import { ProductCard } from "@/components/site/cards";
import { useFavorites } from "@/lib/favorites";

type Search = { page?: number | undefined };

export const Route = createFileRoute("/account/favorites")({
  validateSearch: (s: { page?: unknown }): Search => {
    const page = Number(s.page);
    return { page: Number.isInteger(page) && page > 1 ? page : undefined };
  },
  component: Favorites,
});

function Favorites() {
  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: "/account/favorites" });
  const { products, pages, isLoading } = useFavorites(page);
  return (
    <>
      <PanelTitle title="Любими" />
      {isLoading ? null : products.length === 0 ? (
        <EmptyState icon={<Heart />} title="Нямаш любими продукти" text="Натисни сърцето върху продукт, за да го запазиш тук." action={<Button asChild><Link to="/products">Разгледай продукти</Link></Button>} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      )}
      <PageNav page={page ?? 1} pages={pages} onPage={(next) => navigate({ search: { page: next > 1 ? next : undefined } })} />
    </>
  );
}
