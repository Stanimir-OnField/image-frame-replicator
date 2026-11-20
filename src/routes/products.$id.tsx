import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Check, MessageCircle, Send, PackageX, BadgeCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DeliveryTags, EmptyState, Price, SectionHeading, Stars } from "@/components/site/bits";
import { FavoriteButton, ProductCard } from "@/components/site/cards";
import { MessageDialog } from "@/components/site/MessageDialog";
import { productQuery } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$id")({
  head: () => ({
    meta: [
      { title: "Продукт – От Полето" },
      { name: "description", content: "Детайли за продукт от местен български производител." },
      { property: "og:title", content: "Продукт – От Полето" },
      { property: "og:description", content: "Купи директно от производителя." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const q = useQuery(productQuery(id));
  const [img, setImg] = useState(0);

  if (q.isLoading) return (
    <div className="container-page grid gap-10 py-10 md:grid-cols-2">
      <Skeleton className="aspect-square rounded-3xl" />
      <div className="space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-6 w-1/3" /><Skeleton className="h-24 w-full" /></div>
    </div>
  );
  if (q.isError) return <div className="container-page py-16"><EmptyState icon={<PackageX />} title="Нещо се обърка" text="Не успяхме да заредим продукта." action={<Button onClick={() => q.refetch()}>Опитай отново</Button>} /></div>;
  if (!q.data) return <div className="container-page py-16"><EmptyState icon={<PackageX />} title="Продуктът не е намерен" text="Може да е бил премахнат от производителя." action={<Button asChild><Link to="/products">Към продуктите</Link></Button>} /></div>;

  const { product, producer, similar } = q.data;

  return (
    <div className="container-page py-6 sm:py-8">
      <Breadcrumb className="mb-6"><BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Начало</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbLink asChild><Link to="/products">Продукти</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList></Breadcrumb>

      <div className="grid gap-7 sm:gap-10 lg:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-3xl bg-muted">
            <img src={product.images[img]} alt={product.name} className="aspect-square w-full object-cover" />
            <FavoriteButton id={product.slug} label={product.name} className="absolute right-4 top-4 size-12" />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:mt-4 sm:gap-3">
            {product.images.map((src, i) => (
              <button key={i} onClick={() => setImg(i)} aria-label={`Снимка ${i + 1}`} className={cn("size-16 shrink-0 overflow-hidden rounded-xl border-2 sm:size-20", i === img ? "border-primary" : "border-transparent opacity-70")}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Link to="/products" search={{ category: [product.category] }} className="text-sm font-semibold text-primary">{product.categoryName}</Link>
            <h1 className="mt-1 text-3xl font-semibold sm:text-4xl md:text-5xl">{product.name}</h1>
            <div className="mt-3"><Stars value={product.rating} count={product.reviewsCount} /></div>
          </div>
          <Price value={product.price} unit={product.unit} large />
          <p className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold", product.available ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>
            {product.available ? <><Check className="size-4" /> Наличен</> : "Временно изчерпан"}
          </p>
          <p className="text-lg leading-relaxed">{product.description}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => toast.success(`Телефон: ${producer.phone}`, { description: producer.name })}><MessageCircle /> Свържи се с производителя</Button>
            <MessageDialog to={producer.name} producerId={producer.slug} productId={product.slug} product={product.name}><Button size="lg" variant="outline" className="w-full sm:w-auto"><Send /> Изпрати съобщение</Button></MessageDialog>
          </div>
          <div className="rounded-2xl bg-cream p-5">
            <h2 className="mb-3 text-lg font-semibold">Доставка и получаване</h2>
            <DeliveryTags methods={product.delivery} />
            <p className="mt-3 text-sm text-muted-foreground">{producer.pickupInfo}</p>
          </div>
          <div className="card-soft grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-4 sm:flex sm:p-5">
            <img src={producer.avatar} alt="" className="size-14 shrink-0 rounded-2xl object-cover sm:size-16" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 font-display text-lg font-semibold text-forest">{producer.name}{producer.verified && <BadgeCheck className="size-5 text-primary" />}</p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" />{producer.location}</p>
              <Stars value={producer.rating} count={producer.reviewsCount} />
            </div>
            <Button asChild variant="outline" className="col-span-2 w-full sm:w-auto"><Link to="/producers/$id" params={{ id: producer.slug }}>Виж профила</Link></Button>
          </div>
        </div>
      </div>

      <section className="mt-14 sm:mt-20">
        <SectionHeading title="Подобни продукти" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{similar.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>
    </div>
  );
}
