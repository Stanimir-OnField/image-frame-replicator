import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { HowItWorksSteps } from "@/components/site/HowItWorksSteps";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/site/SearchBar";
import { SectionHeading } from "@/components/site/bits";
import { CardSkeleton, ProducerCard, ProductCard } from "@/components/site/cards";
import { categoriesQuery, producersQuery, productsQuery } from "@/lib/api";
import { images } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "От Полето – Истинска храна, директно от производителя" },
      { name: "description", content: "Открий местни фермери, мандри и пчелини в България и купувай директно от тях." },
      { property: "og:title", content: "От Полето – Истинска храна, директно от производителя" },
      { property: "og:description", content: "Местни производители на храна в България на едно място." },
    ],
  }),
  component: Home,
});

function Home() {
  const cats = useQuery(categoriesQuery());
  const prods = useQuery(producersQuery());
  const items = useQuery(productsQuery({ sort: "popular" }));
  return (
    <>
      <section className="relative overflow-hidden">
        <img src={images.hero} alt="Пазарна сергия с български домати и слънчогледи" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-forest/55" />
        <div className="container-page relative py-14 sm:py-20 md:py-32">
          <p className="mb-4 inline-block rounded-full bg-sun px-4 py-1.5 text-sm font-semibold text-sun-foreground">Над 400 местни производители</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] text-primary-foreground sm:text-5xl md:text-7xl">Истинска храна. Директно от производителя.</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/90 sm:mt-5 sm:text-lg">Открий фермери, мандри и пчелини около теб и купувай сезонни продукти директно от хората, които ги отглеждат.</p>
          <div className="mt-10 max-w-4xl"><SearchBar /></div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <SectionHeading eyebrow="Категории" title="Популярни категории" action={<Button asChild variant="link"><Link to="/categories">Всички категории <ArrowRight /></Link></Button>} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {cats.isError && <p className="col-span-full text-muted-foreground">Не успяхме да заредим категориите.</p>}
          {(cats.data ?? []).slice(0, 9).map((c, i) => (
            <Link key={c.slug} to="/products" search={{ category: [c.slug] }} className={`hover-lift group relative overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 row-span-2 aspect-square lg:aspect-auto" : "aspect-square"}`}>
              <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/10 to-transparent" />
              <div className="absolute bottom-0 p-4">
                 <p className={`font-display font-semibold text-primary-foreground ${i === 0 ? "text-2xl sm:text-3xl" : "text-base sm:text-lg"}`}>{c.name}</p>
                <p className="text-sm text-primary-foreground/80">{c.count} продукта</p>
              </div>
            </Link>
          ))}
          {cats.isLoading && Array.from({ length: 9 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />)}
        </div>
      </section>

      <section className="bg-cream py-14 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Препоръчани" title="Производители, на които се доверяват" action={<Button asChild variant="link"><Link to="/producers">Всички производители <ArrowRight /></Link></Button>} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {prods.isError ? <p className="text-muted-foreground">Не успяхме да заредим производителите.</p> : prods.isLoading ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />) : (prods.data?.items ?? []).slice(0, 4).map((p) => <ProducerCard key={p.id} producer={p} />)}
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <SectionHeading eyebrow="Сезонно" title="Свежо тази седмица" action={<Button asChild variant="link"><Link to="/products">Всички продукти <ArrowRight /></Link></Button>} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.isError ? <p className="text-muted-foreground">Не успяхме да заредим продуктите.</p> : items.isLoading ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />) : (items.data?.items ?? []).slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="container-page pb-14 sm:pb-20">
        <SectionHeading eyebrow="Лесно е" title="Как работи?" />
        <HowItWorksSteps />
      </section>

      <section className="container-page">
        <div className="grid overflow-hidden rounded-3xl bg-primary md:grid-cols-2">
          <div className="p-6 sm:p-10 md:p-14">
            <h2 className="text-2xl font-semibold text-primary-foreground sm:text-3xl md:text-4xl">Произвеждаш качествена храна?</h2>
            <p className="mt-4 text-lg text-primary-foreground/85">Създай безплатен профил и достигни до повече клиенти.</p>
            <Button asChild variant="sun" size="lg" className="mt-8"><Link to="/register" search={{ type: "producer" }}>Стани производител</Link></Button>
          </div>
          <img src={images.farm} alt="Българска ферма със слънчогледи" loading="lazy" className="h-64 w-full object-cover md:h-full" />
        </div>
      </section>
    </>
  );
}
