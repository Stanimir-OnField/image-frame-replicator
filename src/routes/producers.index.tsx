import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/site/bits";
import { CardSkeleton, ProducerCard } from "@/components/site/cards";
import { producersQuery } from "@/lib/api";

export const Route = createFileRoute("/producers/")({
  head: () => ({
    meta: [
      { title: "Местни производители – От Полето" },
      { name: "description", content: "Ферми, мандри, пчелини и пекарни от цяла България." },
      { property: "og:title", content: "Производители – От Полето" },
      { property: "og:description", content: "Запознай се с хората зад храната." },
    ],
  }),
  component: ProducersPage,
});

function ProducersPage() {
  const q = useQuery(producersQuery());
  const [term, setTerm] = useState("");
  const list = (q.data ?? []).filter((p) => `${p.name} ${p.location}`.toLowerCase().includes(term.toLowerCase()));
  return (
    <>
      <PageHeader title="Производители" subtitle="Запознай се с хората, които отглеждат храната ти.">
      </PageHeader>
      <div className="container-page py-10">
        <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Търси по име или град..." className="mb-8 h-12 max-w-md rounded-full px-5" aria-label="Търси производител" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {q.isLoading ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />) : list.map((p) => <ProducerCard key={p.id} producer={p} />)}
        </div>
        {!q.isLoading && list.length === 0 && <p className="py-16 text-center text-muted-foreground">Няма намерени производители.</p>}
      </div>
    </>
  );
}
