import { createFileRoute, Link } from "@tanstack/react-router";
import { PanelTitle } from "@/components/site/PanelLayout";
import { Stars } from "@/components/site/bits";
import { producers, reviews } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/account/reviews")({
  component: () => (
    <>
      <PanelTitle title="Моите отзиви" />
      <div className="space-y-4">
        {reviews.slice(0, 2).map((r) => {
          const p = producers.find((x) => x.id === r.producerId)!;
          return (
            <article key={r.id} className="card-soft p-5">
              <div className="flex justify-between"><Link to="/producers/$id" params={{ id: p.id }} className="font-semibold text-forest hover:underline">{p.name}</Link><time className="text-sm text-muted-foreground">{formatDate(r.date)}</time></div>
              <Stars value={r.rating} /><p className="mt-2">{r.text}</p>
            </article>
          );
        })}
      </div>
    </>
  ),
});
