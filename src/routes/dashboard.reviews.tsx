import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PanelTitle } from "@/components/site/PanelLayout";
import { EmptyState, PageNav, Stars } from "@/components/site/bits";
import { dashboardReviewsQuery, replyToReview } from "@/lib/api";
import { formatDate } from "@/lib/format";

type Search = { page?: number | undefined };

export const Route = createFileRoute("/dashboard/reviews")({
  validateSearch: (s: { page?: unknown }): Search => {
    const page = Number(s.page);
    return { page: Number.isInteger(page) && page > 1 ? page : undefined };
  },
  component: Reviews,
});

function Reviews() {
  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: "/dashboard/reviews" });
  const q = useQuery({ ...dashboardReviewsQuery(page), placeholderData: keepPreviousData });
  const reviews = q.data?.reviews ?? [];
  return (
    <>
      <PanelTitle title="Отзиви" action={q.data ? <Stars value={q.data.rating} count={q.data.reviewsCount} size="lg" /> : undefined} />
      {reviews.length === 0 && !q.isLoading ? (
        <EmptyState icon={<Star />} title="Все още няма отзиви" text="Когато клиент оцени стопанството, отзивът ще се появи тук." />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => <ReviewCard key={review.id} id={review.id} author={review.author} date={review.date} rating={review.rating} text={review.text} reply={review.reply} />)}
        </div>
      )}
      <PageNav page={q.data?.page ?? 1} pages={q.data?.pages ?? 1} onPage={(next) => navigate({ search: { page: next > 1 ? next : undefined } })} />
    </>
  );
}

function ReviewCard({ id, author, date, rating, text, reply }: { id: string; author: string; date: string; rating: number; text: string; reply?: string | null | undefined }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(reply ?? "");
  const queryClient = useQueryClient();
  return (
    <article className="card-soft p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3"><p className="font-semibold">{author}</p><time className="text-sm text-muted-foreground">{formatDate(date)}</time></div>
      <Stars value={rating} /><p className="mt-2">{text}</p>
      {reply && !open && <p className="mt-3 rounded-xl bg-cream p-3 text-sm"><span className="font-semibold">Твоят отговор: </span>{reply}</p>}
      {open ? (
        <form className="mt-3 space-y-2" onSubmit={async (event) => {
          event.preventDefault();
          try {
            await replyToReview(id, body);
            await queryClient.invalidateQueries({ queryKey: ["dashboard", "reviews"] });
            setOpen(false);
            toast.success("Отговорът е публикуван");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Отговорът не е публикуван");
          }
        }}>
          <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={3} required minLength={2} aria-label="Публичен отговор" />
          <Button type="submit">Публикувай</Button>
        </form>
      ) : (
        <Button variant="link" className="mt-1 px-0" onClick={() => setOpen(true)}>{reply ? "Редактирай отговора" : "Отговори публично"}</Button>
      )}
    </article>
  );
}
