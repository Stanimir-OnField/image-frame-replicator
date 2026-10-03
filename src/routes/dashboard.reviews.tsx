import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PanelTitle } from "@/components/site/PanelLayout";
import { Stars } from "@/components/site/bits";
import { reviews } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/reviews")({
  component: () => (
    <>
      <PanelTitle title="Отзиви" action={<Stars value={4.9} count={128} size="lg" />} />
      <div className="space-y-4">
        {reviews.filter((r) => r.producerId === "zelenata-dolina").map((r) => (
          <article key={r.id} className="card-soft p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3"><p className="font-semibold">{r.author}</p><time className="text-sm text-muted-foreground">{formatDate(r.date)}</time></div>
            <Stars value={r.rating} /><p className="mt-2">{r.text}</p>
            <Button variant="link" className="mt-1 px-0" onClick={() => toast.success("Отговорът е публикуван")}>Отговори публично</Button>
          </article>
        ))}
      </div>
    </>
  ),
});
