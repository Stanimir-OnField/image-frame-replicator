import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanelTitle } from "@/components/site/PanelLayout";
import { EmptyState } from "@/components/site/bits";
import { ProductCard } from "@/components/site/cards";
import { useFavorites } from "@/lib/favorites";
import { products } from "@/lib/mock-data";

export const Route = createFileRoute("/account/favorites")({ component: Favorites });

function Favorites() {
  const { list } = useFavorites();
  const items = products.filter((p) => list.includes(p.id));
  return (
    <>
      <PanelTitle title="Любими" />
      {items.length === 0 ? (
        <EmptyState icon={<Heart />} title="Нямаш любими продукти" text="Натисни сърцето върху продукт, за да го запазиш тук." action={<Button asChild><Link to="/products">Разгледай продукти</Link></Button>} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </>
  );
}
