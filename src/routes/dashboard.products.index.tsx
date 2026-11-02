import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelTitle } from "@/components/site/PanelLayout";
import { EmptyState, PageNav } from "@/components/site/bits";
import { deleteProduct, myProductsQuery } from "@/lib/api";
import { eur } from "@/lib/format";

type Search = { page?: number | undefined };

export const Route = createFileRoute("/dashboard/products/")({
  validateSearch: (s: { page?: unknown }): Search => {
    const page = Number(s.page);
    return { page: Number.isInteger(page) && page > 1 ? page : undefined };
  },
  component: MyProducts,
});

function MyProducts() {
  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: "/dashboard/products/" });
  const q = useQuery({ ...myProductsQuery(page), placeholderData: keepPreviousData });
  const queryClient = useQueryClient();
  const list = q.data?.items ?? [];
  const remove = async (id: string) => {
    try {
      if (list.length <= 1 && page && page > 1) await navigate({ search: { page: page - 1 > 1 ? page - 1 : undefined } });
      await deleteProduct(id);
      toast.success("Продуктът е изтрит");
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "products"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Продуктът не е изтрит");
    }
  };
  return (
    <>
      <PanelTitle title="Моите продукти" action={<Button asChild><Link to="/dashboard/products/new"><Plus /> Добави продукт</Link></Button>} />
      {q.isLoading ? <Skeleton className="h-48 rounded-2xl" /> : list.length === 0 ? (
        <EmptyState icon={<Package />} title="Все още нямаш продукти" text="Добави първия си продукт, за да те намират клиенти." action={<Button asChild><Link to="/dashboard/products/new">+ Добави продукт</Link></Button>} />
      ) : (
        <>
        <div className="space-y-3 md:hidden">
          {list.map((p) => (
            <article key={p.id} className="card-soft p-4">
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                <img src={p.images[0]} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0">
                  <h2 className="font-semibold text-forest">{p.name}</h2>
                  <p className="mt-1 text-sm">{eur(p.price)} / {p.unit}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-cream px-2.5 py-1 text-forest">{p.available ? "Наличен" : "Изчерпан"}</span>
                    <span className={p.status === "active" ? "rounded-full bg-accent px-2.5 py-1 font-semibold text-primary" : "rounded-full bg-muted px-2.5 py-1 font-semibold text-muted-foreground"}>{p.status === "active" ? "Активен" : "Чернова"}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" aria-label="Редактирай" asChild><Link to="/dashboard/products/new" search={{ product: p.slug }}><Pencil /></Link></Button>
                  <DeleteButton name={p.name} onConfirm={() => void remove(p.slug)} />
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="card-soft hidden overflow-x-auto md:block">
          <Table>
            <TableHeader><TableRow><TableHead>Продукт</TableHead><TableHead>Цена</TableHead><TableHead>Наличност</TableHead><TableHead>Статус</TableHead><TableHead className="text-right">Действия</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.map((p) => (
                <TableRow key={p.id}>
                  <TableCell><div className="flex items-center gap-3"><img src={p.images[0]} alt="" className="size-12 rounded-lg object-cover" /><span className="font-medium">{p.name}</span></div></TableCell>
                  <TableCell>{eur(p.price)} / {p.unit}</TableCell>
                  <TableCell>{p.available ? "Наличен" : "Изчерпан"}</TableCell>
                  <TableCell><span className={p.status === "active" ? "rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-primary" : "rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"}>{p.status === "active" ? "Активен" : "Чернова"}</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" aria-label="Редактирай" asChild><Link to="/dashboard/products/new" search={{ product: p.slug }}><Pencil /></Link></Button>
                    <DeleteButton name={p.name} onConfirm={() => void remove(p.slug)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <PageNav page={q.data?.page ?? 1} pages={q.data?.pages ?? 1} onPage={(next) => navigate({ search: { page: next > 1 ? next : undefined } })} />
        </>
      )}
    </>
  );
}

function DeleteButton({ name, onConfirm }: { name: string; onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Изтрий"><Trash2 className="text-destructive" /></Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Изтриване на „{name}“?</AlertDialogTitle><AlertDialogDescription>Продуктът ще бъде премахнат от профила ви.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Отказ</AlertDialogCancel><AlertDialogAction onClick={onConfirm}>Изтрий</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
