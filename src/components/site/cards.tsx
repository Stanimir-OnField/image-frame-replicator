import { Link } from "@tanstack/react-router";
import { Heart, MapPin, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { categories, producers } from "@/lib/mock-data";
import { useFavorites } from "@/lib/favorites";
import type { Producer, Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DeliveryTags, Price, Stars } from "./bits";

export function FavoriteButton({ id, label, className }: { id: string; label?: string; className?: string }) {
  const fav = useFavorites();
  const on = fav.has(id);
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); fav.toggle(id, label); }}
      aria-label={on ? "Премахни от любими" : "Добави в любими"}
      aria-pressed={on}
      className={cn("grid size-10 place-items-center rounded-full bg-background/95 shadow-sm transition hover:scale-105", className)}
    >
      <Heart className={cn("size-5", on ? "fill-destructive text-destructive" : "text-forest")} />
    </button>
  );
}

export function ProductCard({ product, layout = "grid" }: { product: Product; layout?: "grid" | "list" }) {
  const producer = producers.find((p) => p.id === product.producerId)!;
  const list = layout === "list";
  return (
    <Link
      to="/products/$id"
      params={{ id: product.id }}
      className={cn("card-soft hover-lift group relative flex min-w-0 overflow-hidden", list ? "flex-row" : "flex-col")}
    >
      <div className={cn("relative overflow-hidden bg-muted", list ? "w-28 shrink-0 sm:w-52" : "aspect-[4/3]")}>
        <img src={product.images[0]} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {!product.available && (
          <span className="absolute left-3 top-3 rounded-full bg-forest px-2.5 py-1 text-xs font-semibold text-primary-foreground">Изчерпан</span>
        )}
        <FavoriteButton id={product.id} label={product.name} className="absolute right-3 top-3" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:p-4">
        <h3 className="line-clamp-2 font-display text-base font-semibold leading-tight sm:text-lg">{product.name}</h3>
        <p className="truncate text-sm text-muted-foreground">
          {producer.name}
        </p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5" />{producer.location}</p>
        <Stars value={product.rating} count={product.reviewsCount} />
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
          <Price value={product.price} unit={product.unit} />
          <DeliveryTags methods={product.delivery} compact />
        </div>
      </div>
    </Link>
  );
}

export function ProducerCard({ producer }: { producer: Producer }) {
  return (
    <div className="card-soft hover-lift flex flex-col overflow-hidden">
      <div className="relative h-32 bg-muted">
        <img src={producer.cover} alt="" loading="lazy" className="h-full w-full object-cover" />
        <img src={producer.avatar} alt={producer.name} loading="lazy" className="absolute -bottom-8 left-5 size-16 rounded-2xl border-4 border-background object-cover shadow-md" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5 pt-10">
        <h3 className="flex items-center gap-1.5 font-display text-lg font-semibold">
          {producer.name}
          {producer.verified && <BadgeCheck className="size-5 text-primary" aria-label="Потвърден производител" />}
        </h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4" />{producer.location}</p>
        <Stars value={producer.rating} count={producer.reviewsCount} />
        <p className="line-clamp-2 text-sm">{producer.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {producer.categories.map((c) => (
            <span key={c} className="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-forest">
              {categories.find((x) => x.slug === c)?.name}
            </span>
          ))}
        </div>
        <DeliveryTags methods={producer.delivery} />
        <Button asChild variant="outline" className="mt-auto">
          <Link to="/producers/$id" params={{ id: producer.id }}>Виж производителя</Link>
        </Button>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card-soft overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
      </div>
    </div>
  );
}
