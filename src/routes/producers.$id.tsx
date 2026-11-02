import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ComponentType } from "react";
import { toast } from "sonner";
import { BadgeCheck, MapPin, Phone, Mail, Globe, MessageCircle, Send, UserX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DeliveryTags, EmptyState, Stars } from "@/components/site/bits";
import { FavoriteButton, ProductCard } from "@/components/site/cards";
import { MessageDialog } from "@/components/site/MessageDialog";
import { createReview, meQuery, producerQuery, useAuthToken } from "@/lib/api";
import { formatDate } from "@/lib/format";

const producerTabs = ["products", "about", "delivery", "contacts", "reviews"] as const;
type ProducerTab = (typeof producerTabs)[number];

function producerTab(hash: string): ProducerTab {
  return (producerTabs as readonly string[]).includes(hash) ? (hash as ProducerTab) : "products";
}

export const Route = createFileRoute("/producers/$id")({
  head: () => ({
    meta: [
      { title: "Профил на производител – От Полето" },
      { name: "description", content: "История, продукти, доставка и отзиви за местен производител." },
      { property: "og:title", content: "Производител – От Полето" },
      { property: "og:description", content: "Купи директно от производителя." },
    ],
  }),
  component: ProducerPage,
});

function ProducerPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate({ from: "/producers/$id" });
  const hash = useRouterState({ select: (state) => state.location.hash });
  const tab = producerTab(hash);
  const token = useAuthToken();
  const me = useQuery({ ...meQuery(), enabled: !!token });
  const q = useQuery(producerQuery(id));
  if (q.isLoading) return <div className="pt-4 sm:pt-6 md:pt-8"><Skeleton className="h-64 w-full rounded-none" /><div className="container-page space-y-3 py-8"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-5 w-1/4" /></div></div>;
  if (q.isError) return <div className="container-page py-16"><EmptyState icon={<UserX />} title="Нещо се обърка" text="Не успяхме да заредим профила." action={<Button onClick={() => q.refetch()}>Опитай отново</Button>} /></div>;
  if (!q.data) return <div className="container-page py-16"><EmptyState icon={<UserX />} title="Производителят не е намерен" text="Профилът може да е бил деактивиран." action={<Button asChild><Link to="/producers">Към производителите</Link></Button>} /></div>;
  const { producer: p, products, reviews, reviewDistribution } = q.data;
  const ownPage = me.data?.producerId === p.slug;

  return (
    <div className="pt-4 sm:pt-6 md:pt-8">
      <div className="relative h-48 sm:h-56 md:h-80"><img src={p.cover} alt="" className="h-full w-full object-cover" /></div>
      <div className="container-page">
        <div className="-mt-10 flex flex-col gap-5 sm:gap-6 md:-mt-8 md:flex-row md:items-end">
          <img src={p.avatar} alt={p.name} className="relative size-24 rounded-2xl border-4 border-background object-cover shadow-lg sm:size-32 sm:rounded-3xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-5 sm:gap-6 md:flex-row md:items-center">
            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 text-3xl font-semibold sm:text-4xl">{p.name}
                {p.verified && <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-sans text-sm font-semibold text-primary"><BadgeCheck className="size-4" /> Потвърден</span>}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="size-4" />{p.location}</span>
                <Stars value={p.rating} count={p.reviewsCount} />
              </div>
            </div>
            <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2 sm:flex sm:w-auto sm:flex-wrap">
              <Button className="w-full sm:w-auto" onClick={() => toast.success(`Телефон: ${p.phone}`)}><MessageCircle /> Свържи се</Button>
              {!ownPage && <MessageDialog to={p.name} producerId={p.slug}><Button variant="outline" className="w-full sm:w-auto"><Send /> Изпрати съобщение</Button></MessageDialog>}
              <FavoriteButton id={`producer:${p.slug}`} label={p.name} className="border border-border" />
            </div>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(value) => { void navigate({ hash: value === "products" ? "" : value, replace: true, resetScroll: false }); }} className="mt-8 sm:mt-10">
          <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0"><TabsList className="h-auto w-max justify-start gap-1 rounded-full bg-cream p-1">
            {([["products", `Продукти (${products.length})`], ["about", "За производителя"], ["delivery", "Доставка и получаване"], ["contacts", "Контакти"], ["reviews", "Отзиви"]] as const).map(([v, l]) => (
              <TabsTrigger key={v} value={v} className="rounded-full px-4 py-2">{l}</TabsTrigger>
            ))}
          </TabsList></div>

          <TabsContent value="about" className="mt-8 max-w-3xl">
            <h2 className="mb-4 text-2xl font-semibold">Нашата история</h2>
            <p className="text-base leading-relaxed sm:text-lg">{p.story}</p>
          </TabsContent>
          <TabsContent value="products" className="mt-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((x) => <ProductCard key={x.id} product={x} />)}</div>
          </TabsContent>
          <TabsContent value="delivery" className="mt-8 grid max-w-3xl gap-6 md:grid-cols-2">
            <div className="card-soft p-5 sm:p-6"><h3 className="mb-3 text-lg font-semibold">Начини на получаване</h3><DeliveryTags methods={p.delivery} /></div>
            <div className="card-soft p-5 sm:p-6"><h3 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Clock className="size-5" /> Вземане от място</h3><p>{p.pickupInfo}</p></div>
          </TabsContent>
          <TabsContent value="contacts" className="mt-8">
            <ul className="card-soft max-w-xl divide-y divide-border">
              {[[MapPin, p.location], [Phone, p.phone], [Mail, p.email], ...(p.website ? [[Globe, p.website]] : [])].map(([I, v], i) => {
                const Icon = I as typeof MapPin;
                return <li key={i} className="flex min-w-0 items-center gap-3 p-4"><Icon className="size-5 shrink-0 text-primary" /><span className="min-w-0 break-all">{String(v)}</span></li>;
              })}
            </ul>
            {p.latitude != null && p.longitude != null && <ContactsMap latitude={p.latitude} longitude={p.longitude} name={p.name} />}
          </TabsContent>
          <TabsContent value="reviews" className="mt-8 grid gap-10 lg:grid-cols-[300px_1fr]">
            <div className="card-soft h-fit p-5 sm:p-6">
              <p className="font-display text-5xl font-semibold text-forest">{p.rating.toFixed(1)}</p>
              <Stars value={p.rating} size="lg" />
              <p className="mt-1 text-sm text-muted-foreground">{p.reviewsCount} отзива</p>
              <div className="mt-5 space-y-2">
                {reviewDistribution.map((pct, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm"><span className="w-3">{5 - i}</span><Progress value={pct} className="h-2" /><span className="w-12 text-right text-muted-foreground">{pct}%</span></div>
                ))}
              </div>
              <WriteReview producerId={p.slug} name={p.name} />
            </div>
            <div className="space-y-4">
              {reviews.length === 0 && <p className="text-muted-foreground">Все още няма отзиви. Бъди първият!</p>}
              {reviews.map((r) => (
                <article key={r.id} className="card-soft p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-sun font-semibold text-sun-foreground">{r.author[0]}</span><p className="font-semibold">{r.author}</p></div>
                    <time className="text-sm text-muted-foreground">{formatDate(r.date)}</time>
                  </div>
                  <div className="mt-3"><Stars value={r.rating} /></div>
                  <p className="mt-2">{r.text}</p>
                  {r.reply && <p className="mt-3 rounded-xl bg-cream p-3 text-sm"><span className="font-semibold">Отговор: </span>{r.reply}</p>}
                </article>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ContactsMap({ latitude, longitude, name }: { latitude: number; longitude: number; name: string }) {
  const [MapView, setMapView] = useState<ComponentType<{ latitude: number; longitude: number; name: string }> | null>(null);
  useEffect(() => {
    let active = true;
    void import("@/components/site/ProducerMap").then((mod) => {
      if (active) setMapView(() => mod.ProducerMap);
    });
    return () => {
      active = false;
    };
  }, []);
  if (!MapView) return <div className="mt-6 h-80 rounded-xl border border-border bg-cream" />;
  return <MapView latitude={latitude} longitude={longitude} name={name} />;
}

function WriteReview({ producerId, name }: { producerId: string; name: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="mt-6 w-full" variant="sun">Напиши отзив</Button></DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader><DialogTitle className="font-display text-2xl text-forest">Отзив за {name}</DialogTitle></DialogHeader>
        <div className="flex gap-1" role="radiogroup" aria-label="Оценка">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" aria-checked={rating === value} onClick={() => setRating(value)} className={value <= rating ? "text-sun" : "text-muted-foreground"}>{value}★</button>
          ))}
        </div>
        <Textarea rows={5} placeholder="Сподели своя опит..." value={text} onChange={(event) => setText(event.target.value)} />
        <DialogFooter><Button onClick={async () => {
          try {
            await createReview(producerId, { rating, body: text });
            await queryClient.invalidateQueries({ queryKey: ["producer", producerId] });
            setOpen(false);
            setText("");
            toast.success("Благодарим за отзива!");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Неуспешно публикуване");
          }
        }}>Публикувай</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
