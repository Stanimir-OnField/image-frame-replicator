import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/bits";
import { categories } from "@/lib/mock-data";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Категории храни – От Полето" },
      { name: "description", content: "Плодове, зеленчуци, млечни продукти, мед, хляб и още от местни производители." },
      { property: "og:title", content: "Категории – От Полето" },
      { property: "og:description", content: "Разгледай храната по категории." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Категории" subtitle="Избери какво ти се яде днес." />
      <div className="container-page grid grid-cols-2 gap-5 py-10 md:grid-cols-3">
        {categories.map((c) => (
          <Link key={c.slug} to="/products" search={{ category: c.slug }} className="hover-lift group relative aspect-[4/3] overflow-hidden rounded-2xl">
            <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/85 to-transparent" />
            <div className="absolute bottom-0 p-5"><p className="font-display text-2xl font-semibold text-primary-foreground">{c.name}</p><p className="text-primary-foreground/80">{c.count} продукта</p></div>
          </Link>
        ))}
      </div>
    </>
  ),
});
