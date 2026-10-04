import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  Leaf,
  MapPin,
  Menu,
  PackageCheck,
  Search,
  Sprout,
  Star,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo, Price, Stars } from "@/components/site/bits";
import { categories, images, producers, products } from "@/lib/mock-data";

export const Route = createFileRoute("/marketing")({
  head: () => ({
    meta: [
      { title: "От Полето – местна храна с истински произход" },
      { name: "description", content: "Открий сезонни продукти от български ферми, мандри, пекарни и пчелини и се свържи директно с производителите." },
      { property: "og:title", content: "От Полето – местна храна с истински произход" },
      { property: "og:description", content: "Истинска храна от местни производители. Избери продукт и се свържи директно със стопанина." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://image-frame-replicator.lovable.app/marketing" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://image-frame-replicator.lovable.app/marketing" }],
  }),
  component: MarketingPage,
});

const marketingNav = [
  { href: "#why", label: "Защо От Полето" },
  { href: "#how", label: "Как работи" },
  { href: "#producers", label: "За производители" },
] as const;

function MarketingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 border-b border-primary-foreground/15 text-primary-foreground">
      <div className="container-page grid h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:flex lg:justify-between">
        <Logo className="[&_span:last-child]:text-primary-foreground" />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Навигация на представянето">
          {marketingNav.map((item) => <a key={item.href} href={item.href} className="text-sm font-semibold text-primary-foreground/85 transition hover:text-sun">{item.label}</a>)}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><Link to="/login">Вход</Link></Button>
          <Button asChild variant="sun"><Link to="/products">Разгледай продуктите <ArrowRight /></Link></Button>
        </div>
        <Sheet>
          <SheetTrigger asChild><Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground lg:hidden" aria-label="Отвори менюто"><Menu /></Button></SheetTrigger>
          <SheetContent side="right" className="w-[min(20rem,88vw)]">
            <SheetHeader><SheetTitle><Logo /></SheetTitle></SheetHeader>
            <nav className="mt-6 flex flex-col gap-2 px-4">
              {marketingNav.map((item) => <a key={item.href} href={item.href} className="rounded-xl px-3 py-3 font-medium hover:bg-cream">{item.label}</a>)}
              <Button asChild variant="outline" className="mt-4"><Link to="/login">Вход</Link></Button>
              <Button asChild variant="sun"><Link to="/products">Разгледай продуктите</Link></Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

function MarketingPage() {
  const featured = products.filter((product) => product.available).slice(0, 4);

  return (
    <div className="bg-background">
      <MarketingHeader />

      <section className="relative flex min-h-[min(800px,92vh)] items-end overflow-hidden">
        <img src={images.hero} alt="Свежа местна храна на фермерски пазар" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-forest)_92%,transparent),color-mix(in_oklab,var(--color-forest)_45%,transparent),color-mix(in_oklab,var(--color-forest)_18%,transparent))]" />
        <div className="container-page relative pb-14 pt-36 text-primary-foreground sm:pb-20 sm:pt-44 lg:pb-24">
          <div className="max-w-3xl">
            <p className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-sun"><Sprout className="size-4" /> От българската земя до твоята трапеза</p>
            <h1 className="text-4xl font-semibold leading-[1.08] text-primary-foreground sm:text-6xl lg:text-7xl">Храна с лице, име и истински произход.</h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-primary-foreground/85 sm:text-xl">Открий сезонни продукти от ферми, мандри, пекарни и пчелини близо до теб. Избираш сам, говориш директно с производителя.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="sun" size="lg" className="w-full sm:w-auto"><Link to="/products"><Search /> Разгледай продуктите</Link></Button>
              <Button asChild size="lg" variant="outline" className="w-full border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground sm:w-auto"><Link to="/register" search={{ type: "producer" }}>Предлагай своите продукти</Link></Button>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-primary-foreground/25 pt-6">
              {[['400+', 'местни производители'], ['9', 'категории храни'], ['4.8/5', 'средна оценка']].map(([value, label]) => <div key={label}><p className="text-2xl font-bold text-primary-foreground sm:text-3xl">{value}</p><p className="mt-1 text-xs leading-snug text-primary-foreground/70 sm:text-sm">{label}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="scroll-mt-20 py-16 sm:py-24">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">По-краткият път е по-добрият</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Познавай храната си. Подкрепяй хората зад нея.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">„От Полето“ събира на едно място местни производители и хора, които търсят свежа, сезонна храна. Без безлични етикети — виждаш кой стои зад продукта и избираш как да го получиш.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: BadgeCheck, title: "Ясен произход", text: "Профил, история, място и отзиви за всеки производител." },
              { icon: HeartHandshake, title: "Директен контакт", text: "Питай, уточни количество и доставка направо със стопанина." },
              { icon: MapPin, title: "Близо до теб", text: "Търси по населено място и откривай местни вкусове." },
            ].map((item) => <article key={item.title} className="border-t-2 border-primary pt-6"><div className="mb-5 grid size-12 place-items-center rounded-full bg-accent text-primary"><item.icon /></div><h3 className="text-xl font-semibold">{item.title}</h3><p className="mt-2 leading-relaxed text-muted-foreground">{item.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-24">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div><p className="text-sm font-semibold uppercase tracking-wider text-primary">Сезонът сега</p><h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Вкусът започва оттук</h2></div>
            <Button asChild variant="link"><Link to="/products">Виж всички продукти <ArrowRight /></Link></Button>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {featured.map((product) => {
              const producer = producers.find((item) => item.id === product.producerId);
              return <Link key={product.id} to="/products/$id" params={{ id: product.id }} className="group min-w-0"><div className="aspect-[4/5] overflow-hidden rounded-2xl bg-muted"><img src={product.images[0]} alt={product.name} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" /></div><div className="pt-4"><p className="truncate text-xs font-semibold uppercase tracking-wider text-primary">{producer?.location}</p><h3 className="mt-1 text-base font-semibold sm:text-xl">{product.name}</h3><div className="mt-2"><Price value={product.price} unit={product.unit} /></div></div></Link>;
            })}
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 py-16 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28"><p className="text-sm font-semibold uppercase tracking-wider text-primary">Лесно и лично</p><h2 className="mt-3 text-3xl font-semibold sm:text-5xl">От търсенето до трапезата в три стъпки.</h2><p className="mt-5 text-lg leading-relaxed text-muted-foreground">Няма сложна поръчка. Откриваш продукта, опознаваш производителя и се уговаряте директно.</p></div>
          <div className="divide-y divide-border border-y border-border">
            {[
              { n: '01', icon: Search, title: 'Открий', text: 'Потърси продукт, категория или производител близо до теб.' },
              { n: '02', icon: Users, title: 'Избери', text: 'Разгледай историята, оценките и начина на производство.' },
              { n: '03', icon: Truck, title: 'Получи', text: 'Свържи се директно и уговори доставка или вземане на място.' },
            ].map((step) => <div key={step.n} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 py-7 sm:grid-cols-[4rem_auto_minmax(0,1fr)] sm:items-center sm:gap-6"><span className="hidden font-display text-2xl text-primary/50 sm:block">{step.n}</span><div className="grid size-12 shrink-0 place-items-center rounded-full bg-forest text-primary-foreground"><step.icon /></div><div className="min-w-0"><h3 className="text-xl font-semibold">{step.title}</h3><p className="mt-1 text-muted-foreground">{step.text}</p></div></div>)}
          </div>
        </div>
      </section>

      <section id="producers" className="scroll-mt-20 bg-forest py-16 text-primary-foreground sm:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="grid grid-cols-2 gap-3 sm:gap-5"><img src={images.farm} alt="Българска ферма" loading="lazy" className="col-span-2 aspect-[16/8] w-full rounded-2xl object-cover" /><img src={images.vegetables} alt="Прясно набрани зеленчуци" loading="lazy" className="aspect-square w-full rounded-2xl object-cover" /><img src={images.honey} alt="Местен пчелен мед" loading="lazy" className="aspect-square w-full rounded-2xl object-cover" /></div>
          <div className="lg:pl-8"><p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-sun"><Store className="size-4" /> За производители</p><h2 className="mt-3 text-3xl font-semibold text-primary-foreground sm:text-5xl">Добрата храна заслужава да бъде открита.</h2><p className="mt-5 text-lg leading-relaxed text-primary-foreground/75">Покажи стопанството, разкажи историята си и достигни до хора, които ценят местното производство. Ти определяш продуктите, наличностите и начина на получаване.</p><ul className="mt-7 space-y-3">{['Профил и каталог на едно място', 'Директни запитвания от клиенти', 'Доставка или вземане според твоите условия'].map((item) => <li key={item} className="flex items-center gap-3"><PackageCheck className="size-5 shrink-0 text-sun" />{item}</li>)}</ul><Button asChild variant="sun" size="lg" className="mt-8 w-full sm:w-auto"><Link to="/register" search={{ type: "producer" }}>Стани производител <ArrowRight /></Link></Button></div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-page">
          <div className="text-center"><p className="text-sm font-semibold uppercase tracking-wider text-primary">Хората зад храната</p><h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Запознай се с производителите</h2></div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {producers.slice(0, 3).map((producer) => <Link key={producer.id} to="/producers/$id" params={{ id: producer.id }} className="group overflow-hidden rounded-2xl border border-border bg-card"><div className="relative aspect-[16/9] overflow-hidden"><img src={producer.cover} alt={producer.name} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" /><img src={producer.avatar} alt="" className="absolute bottom-4 left-5 size-14 rounded-full border-4 border-card object-cover" /></div><div className="p-5"><div className="flex min-w-0 items-center gap-2"><h3 className="truncate text-xl font-semibold">{producer.name}</h3>{producer.verified && <BadgeCheck className="size-5 shrink-0 text-primary" />}</div><p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4" />{producer.location}</p><div className="mt-3"><Stars value={producer.rating} count={producer.reviewsCount} /></div></div></Link>)}
          </div>
        </div>
      </section>

      <section className="container-page pb-16 sm:pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-sun px-6 py-12 text-center sm:px-12 sm:py-16"><Leaf className="mx-auto size-10 text-sun-foreground" /><h2 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold text-sun-foreground sm:text-5xl">Следващото ти любимо нещо е отгледано някъде наблизо.</h2><p className="mx-auto mt-5 max-w-xl text-lg text-sun-foreground/80">Разгледай какво предлагат местните производители днес.</p><Button asChild size="lg" className="mt-8 w-full sm:w-auto"><Link to="/products">Разгледай продуктите <ArrowRight /></Link></Button></div>
      </section>

      <footer className="border-t border-border py-8"><div className="container-page flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><Logo /><p className="text-sm text-muted-foreground">© 2026 От Полето. Истинска храна, директно от производителя.</p><div className="flex gap-4 text-sm font-medium"><Link to="/products">Продукти</Link><Link to="/producers">Производители</Link></div></div></footer>
    </div>
  );
}