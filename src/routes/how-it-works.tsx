import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/bits";
import { HowItWorksSteps } from "@/components/site/HowItWorksSteps";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "Как работи? – От Полето" },
      { name: "description", content: "Три лесни стъпки до истинска храна директно от производителя." },
      { property: "og:title", content: "Как работи? – От Полето" },
      { property: "og:description", content: "Намери, избери, свържи се." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Как работи?" subtitle="Свързваме те директно с хората, които произвеждат храната ти – без посредници и надценки." />
      <div className="container-page space-y-16 py-14">
        <HowItWorksSteps />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-cream p-8"><h2 className="text-2xl font-semibold">За клиенти</h2><p className="mt-3 text-muted-foreground">Регистрацията е безплатна. Запазвай любими продукти, пиши на производители и оставяй отзиви.</p><Button asChild className="mt-6"><Link to="/register">Създай профил</Link></Button></div>
          <div className="rounded-3xl bg-accent p-8"><h2 className="text-2xl font-semibold">За производители</h2><p className="mt-3 text-muted-foreground">Създай профил, добави продуктите си и получавай запитвания директно от клиенти.</p><Button asChild variant="sun" className="mt-6"><Link to="/register" search={{ type: "producer" }}>Стани производител</Link></Button></div>
        </div>
      </div>
    </>
  ),
});
