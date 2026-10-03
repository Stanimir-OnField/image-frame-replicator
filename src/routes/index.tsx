import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, MessageCircle, ArrowRight } from "lucide-react";
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

export const steps = [
  { icon: Search, title: "Намери продукт", text: "Търси по продукт, категория или населено място." },
  { icon: Users, title: "Избери производител", text: "Разгледай профила, историята и отзивите на стопанина." },
  { icon: MessageCircle, title: "Свържи се директно", text: "Пиши на производителя и се уговорете за доставка или вземане." },
];

export function HowItWorksSteps() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {steps.map((s, i) => (
        <div key={s.title} className="card-soft relative p-7">
          <span className="absolute right-6 top-5 font-display text-5xl font-semibold text-sun/60">{i + 1}</span>
          <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-accent text-primary"><s.icon className="size-7" /></div>
          <h3 className="text-xl font-semibold">{s.title}</h3>
          <p className="mt-2 text-muted-foreground">{s.text}</p>
        </div>
      ))}
    </div>
  );
}

function Home() {
  const cats = useQuery(categoriesQuery());
  const prods = useQuery(producersQuery());
  const items = useQuery(productsQuery({ sort: "popular" }));
  return (
    <>
      <section className="relative overflow-hidden">
        <img src={images.hero} alt="Пазарна сергия с български домати и слънчогледи" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-forest/55" />
        <div className="container-page relative py-20 md:py-32">
          <p className="mb-4 inline-block rounded-full bg-sun px-4 py-1.5 text-sm font-semibold text-sun-foreground">Над 400 местни производители</p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] text-primary-foreground md:text-7xl">Истинска храна. Директно от производителя.</h1>
          <p className="mt-5 max-w-xl text-lg text-primary-foreground/90">Открий фермери, мандри и пчелини около теб и купувай сезонни продукти директно от хората, които ги отглеждат.</p>
          <div className="mt-10 max-w-4xl"><SearchBar /></div>
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading eyebrow="Категории" title="Популярни категории" action={<Button asChild variant="link"><Link to="/categories">Всички категории <ArrowRight /></Link></Button>} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {(cats.data ?? []).slice(0, 9).map((c, i) => (
            <Link key={c.slug} to="/products" search={{ category: c.slug }} className={`hover-lift group relative overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 row-span-2 aspect-square lg:aspect-auto" : "aspect-square"}`}>
              <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/10 to-transparent" />
              <div className="absolute bottom-0 p-4">
                <p className={`font-display font-semibold text-primary-foreground ${i === 0 ? "text-3xl" : "text-lg"}`}>{c.name}</p>
                <p className="text-sm text-primary-foreground/80">{c.count} продукта</p>
              </div>
            </Link>
          ))}
          {cats.isLoading && Array.from({ length: 9 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />)}
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Препоръчани" title="Производители, на които се доверяват" action={<Button asChild variant="link"><Link to="/producers">Всички производители <ArrowRight /></Link></Button>} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {prods.isLoading ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />) : prods.data!.slice(0, 4).map((p) => <ProducerCard key={p.id} producer={p} />)}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading eyebrow="Сезонно" title="Свежо тази седмица" action={<Button asChild variant="link"><Link to="/products">Всички продукти <ArrowRight /></Link></Button>} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.isLoading ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />) : items.data!.items.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="container-page pb-20">
        <SectionHeading eyebrow="Лесно е" title="Как работи?" />
        <HowItWorksSteps />
      </section>

      <section className="container-page">
        <div className="grid overflow-hidden rounded-3xl bg-primary md:grid-cols-2">
          <div className="p-10 md:p-14">
            <h2 className="text-3xl font-semibold text-primary-foreground md:text-4xl">Произвеждаш качествена храна?</h2>
            <p className="mt-4 text-lg text-primary-foreground/85">Създай безплатен профил и достигни до повече клиенти.</p>
            <Button asChild variant="sun" size="lg" className="mt-8"><Link to="/register" search={{ type: "producer" }}>Стани производител</Link></Button>
          </div>
          <img src={images.farm} alt="Българска ферма със слънчогледи" loading="lazy" className="h-64 w-full object-cover md:h-full" />
        </div>
      </section>
    </>
  );
}
