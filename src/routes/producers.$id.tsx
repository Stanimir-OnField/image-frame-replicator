import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
import { InquiryDialog } from "@/components/site/InquiryDialog";
import { producerQuery } from "@/lib/api";
import { reviewDistribution } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

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
  const q = useQuery(producerQuery(id));
  if (q.isLoading) return <div><Skeleton className="h-64 w-full rounded-none" /><div className="container-page space-y-3 py-8"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-5 w-1/4" /></div></div>;
  if (!q.data) return <div className="container-page py-16"><EmptyState icon={<UserX />} title="Производителят не е намерен" text="Профилът може да е бил деактивиран." action={<Button asChild><Link to="/producers">Към производителите</Link></Button>} /></div>;
  const { producer: p, products, reviews } = q.data;

  return (
    <div>
      <div className="relative h-56 md:h-80"><img src={p.cover} alt="" className="h-full w-full object-cover" /></div>
      <div className="container-page">
        <div className="-mt-16 flex flex-col gap-6 md:flex-row md:items-end">
          <img src={p.avatar} alt={p.name} className="relative size-32 rounded-3xl border-4 border-background object-cover shadow-lg" />
          <div className="flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-4xl font-semibold">{p.name}
              {p.verified && <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-sans text-sm font-semibold text-primary"><BadgeCheck className="size-4" /> Потвърден</span>}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="size-4" />{p.location}</span>
              <Stars value={p.rating} count={p.reviewsCount} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => toast.success(`Телефон: ${p.phone}`)}><MessageCircle /> Свържи се</Button>
            <InquiryDialog to={p.name}><Button variant="outline"><Send /> Изпрати запитване</Button></InquiryDialog>
            <FavoriteButton id={`producer:${p.id}`} label={p.name} className="border border-border" />
          </div>
        </div>

        <Tabs defaultValue="about" className="mt-10">
          <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-full bg-cream p-1">
            {[["about", "За производителя"], ["products", `Продукти (${products.length})`], ["delivery", "Доставка и получаване"], ["contacts", "Контакти"], ["reviews", "Отзиви"]].map(([v, l]) => (
              <TabsTrigger key={v} value={v} className="rounded-full px-4 py-2">{l}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="about" className="mt-8 max-w-3xl">
            <h2 className="mb-4 text-2xl font-semibold">Нашата история</h2>
            <p className="text-lg leading-relaxed">{p.story}</p>
          </TabsContent>
          <TabsContent value="products" className="mt-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((x) => <ProductCard key={x.id} product={x} />)}</div>
          </TabsContent>
          <TabsContent value="delivery" className="mt-8 grid max-w-3xl gap-6 md:grid-cols-2">
            <div className="card-soft p-6"><h3 className="mb-3 text-lg font-semibold">Начини на получаване</h3><DeliveryTags methods={p.delivery} /></div>
            <div className="card-soft p-6"><h3 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Clock className="size-5" /> Вземане от място</h3><p>{p.pickupInfo}</p></div>
          </TabsContent>
          <TabsContent value="contacts" className="mt-8">
            <ul className="card-soft max-w-xl divide-y divide-border">
              {[[MapPin, p.location], [Phone, p.phone], [Mail, p.email], ...(p.website ? [[Globe, p.website]] : [])].map(([I, v], i) => {
                const Icon = I as typeof MapPin;
                return <li key={i} className="flex items-center gap-3 p-4"><Icon className="size-5 text-primary" />{String(v)}</li>;
              })}
            </ul>
          </TabsContent>
          <TabsContent value="reviews" className="mt-8 grid gap-10 lg:grid-cols-[300px_1fr]">
            <div className="card-soft h-fit p-6">
              <p className="font-display text-5xl font-semibold text-forest">{p.rating.toFixed(1)}</p>
              <Stars value={p.rating} size="lg" />
              <p className="mt-1 text-sm text-muted-foreground">{p.reviewsCount} отзива</p>
              <div className="mt-5 space-y-2">
                {reviewDistribution.map((pct, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm"><span className="w-3">{5 - i}</span><Progress value={pct} className="h-2" /><span className="w-9 text-right text-muted-foreground">{pct}%</span></div>
                ))}
              </div>
              <WriteReview name={p.name} />
            </div>
            <div className="space-y-4">
              {reviews.length === 0 && <p className="text-muted-foreground">Все още няма отзиви. Бъди първият!</p>}
              {reviews.map((r) => (
                <article key={r.id} className="card-soft p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-sun font-semibold text-sun-foreground">{r.author[0]}</span><p className="font-semibold">{r.author}</p></div>
                    <time className="text-sm text-muted-foreground">{formatDate(r.date)}</time>
                  </div>
                  <div className="mt-3"><Stars value={r.rating} /></div>
                  <p className="mt-2">{r.text}</p>
                </article>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function WriteReview({ name }: { name: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild><Button className="mt-6 w-full" variant="sun">Напиши отзив</Button></DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader><DialogTitle className="font-display text-2xl text-forest">Отзив за {name}</DialogTitle></DialogHeader>
        <Textarea rows={5} placeholder="Сподели своя опит..." />
        <DialogFooter><Button onClick={() => toast.success("Благодарим за отзива!")}>Публикувай</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
