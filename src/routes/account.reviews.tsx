import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { PanelTitle } from "@/components/site/PanelLayout";
import { EmptyState, PageNav, Stars } from "@/components/site/bits";
import { accountReviewsQuery } from "@/lib/api";
import { formatDate } from "@/lib/format";

type Search = { page?: number | undefined };

export const Route = createFileRoute("/account/reviews")({
  validateSearch: (s: { page?: unknown }): Search => {
    const page = Number(s.page);
    return { page: Number.isInteger(page) && page > 1 ? page : undefined };
  },
  component: Reviews,
});

function Reviews() {
  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: "/account/reviews" });
  const q = useQuery({ ...accountReviewsQuery(page), placeholderData: keepPreviousData });
  const reviews = q.data?.items ?? [];
  return (
    <>
      <PanelTitle title="Моите отзиви" />
      {q.isLoading ? null : reviews.length === 0 ? (
        <EmptyState icon={<Star />} title="Все още нямаш отзиви" text="След покупка можеш да оцениш производителя от профила му." />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="card-soft p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3"><Link to="/producers/$id" params={{ id: review.producerId }} className="font-semibold text-forest hover:underline">{review.producerName}</Link><time className="text-sm text-muted-foreground">{formatDate(review.date)}</time></div>
              <Stars value={review.rating} /><p className="mt-2">{review.text}</p>
            </article>
          ))}
        </div>
      )}
      <PageNav page={q.data?.page ?? 1} pages={q.data?.pages ?? 1} onPage={(next) => navigate({ search: { page: next > 1 ? next : undefined } })} />
    </>
  );
}
