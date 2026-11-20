import type { MouseEvent, ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PanelTitle } from "@/components/site/PanelLayout";
import { EmptyState, PageNav } from "@/components/site/bits";
import { ListingFilters, SearchableSelect, searchList } from "@/components/site/FilterPanel";
import { categoriesQuery, deleteProduct, myProductsQuery } from "@/lib/api";
import { eur } from "@/lib/format";
import type { Product } from "@/lib/types";

type Search = {
  page?: number | undefined;
  q?: string | undefined;
  status?: "active" | "draft" | undefined;
  available?: "1" | "0" | undefined;
  category?: string[] | undefined;
};

const ALL = "__all";

export const Route = createFileRoute("/dashboard/products/")({
  validateSearch: (s: Partial<Record<keyof Search, unknown>>): Search => {
    const page = Number(s.page);
    const status = s.status === "active" || s.status === "draft" ? s.status : undefined;
    const available = s.available === "1" || s.available === "0" ? s.available : undefined;
    return {
      page: Number.isInteger(page) && page > 1 ? page : undefined,
      q: typeof s.q === "string" && s.q ? s.q : undefined,
      status,
      available,
      category: searchList(s.category),
    };
  },
  component: MyProducts,
});

function MyProducts() {
  const search = Route.useSearch();
  const { page, q, status, available, category } = search;
  const navigate = useNavigate({ from: "/dashboard/products/" });
  const categories = useQuery(categoriesQuery());
  const filtering = Boolean(q || status || available || category?.length);
  const set = (patch: Partial<Search>) => {
    void navigate({
      search: (prev) => ({ ...prev, ...patch, page: "page" in patch ? patch.page : undefined }),
    });
  };
  const open = useNavigate();
  const openProduct = (product: Product) => {
    if (product.status === "draft") {
      void open({ to: "/dashboard/products/new", search: { product: product.slug } });
      return;
    }
    void open({ to: "/products/$id", params: { id: product.slug } });
  };
  const qProducts = useQuery({
    ...myProductsQuery({
      page,
      q,
      status,
      category,
      available: available === "1" ? true : available === "0" ? false : undefined,
    }),
    placeholderData: keepPreviousData,
  });
  const queryClient = useQueryClient();
  const list = qProducts.data?.items ?? [];
  const remove = async (id: string) => {
    try {
      if (list.length <= 1 && page && page > 1)
        await navigate({ search: { ...search, page: page - 1 > 1 ? page - 1 : undefined } });
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
      <PanelTitle
        title="Моите продукти"
        action={
          <Button asChild>
            <Link to="/dashboard/products/new">
              <Plus /> Добави продукт
            </Link>
          </Button>
        }
      />
      <ListingFilters
        query={q ?? ""}
        onQuery={(value) => set({ q: value || undefined })}
        placeholder="Име на продукт"
        onClear={filtering ? () => void navigate({ search: {} }) : undefined}
      >
        <SearchableSelect
          ariaLabel="Категория"
          allLabel="Всички категории"
          className="sm:w-44"
          value={category}
          onValueChange={(value) => set({ category: value })}
          options={(categories.data ?? []).map((item) => ({ value: item.slug, label: item.name }))}
        />
        <Select
          value={status ?? ALL}
          onValueChange={(value) =>
            set({ status: value === ALL ? undefined : (value as Search["status"]) })
          }
        >
          <SelectTrigger className="h-11 w-full rounded-xl sm:w-40" aria-label="Статус">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Всички статуси</SelectItem>
            <SelectItem value="active">Активен</SelectItem>
            <SelectItem value="draft">Чернова</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={available ?? ALL}
          onValueChange={(value) =>
            set({ available: value === ALL ? undefined : (value as Search["available"]) })
          }
        >
          <SelectTrigger className="h-11 w-full rounded-xl sm:w-40" aria-label="Наличност">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Всички</SelectItem>
            <SelectItem value="1">Налични</SelectItem>
            <SelectItem value="0">Изчерпани</SelectItem>
          </SelectContent>
        </Select>
      </ListingFilters>
      {qProducts.isLoading ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Package />}
          title={filtering ? "Няма намерени продукти" : "Все още нямаш продукти"}
          text={
            filtering
              ? "Опитай с друга дума или премахни някои филтри."
              : "Добави първия си продукт, за да те намират клиенти."
          }
          action={
            filtering ? (
              <Button variant="outline" onClick={() => void navigate({ search: {} })}>
                Изчисти филтрите
              </Button>
            ) : (
              <Button asChild>
                <Link to="/dashboard/products/new">+ Добави продукт</Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {list.map((p) => (
              <article key={p.id} className="card-soft hover-lift relative p-4">
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                  <img
                    src={p.images[0]}
                    alt=""
                    className="size-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <h2 className="font-semibold text-forest">
                      <ProductLink product={p} className="after:absolute after:inset-0">
                        {p.name}
                      </ProductLink>
                    </h2>
                    <p className="mt-1 text-sm">
                      {eur(p.price)} / {p.unit}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-cream px-2.5 py-1 text-forest">
                        {p.available ? "Наличен" : "Изчерпан"}
                      </span>
                      <span
                        className={
                          p.status === "active"
                            ? "rounded-full bg-accent px-2.5 py-1 font-semibold text-primary"
                            : "rounded-full bg-muted px-2.5 py-1 font-semibold text-muted-foreground"
                        }
                      >
                        {p.status === "active" ? "Активен" : "Чернова"}
                      </span>
                    </div>
                  </div>
                  <div className="relative z-10 flex flex-col gap-1">
                    <Button variant="ghost" size="icon" aria-label="Редактирай" asChild>
                      <Link to="/dashboard/products/new" search={{ product: p.slug }}>
                        <Pencil />
                      </Link>
                    </Button>
                    <DeleteButton name={p.name} onConfirm={() => void remove(p.slug)} />
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="card-soft hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Продукт</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Наличност</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => openProduct(p)}>
                    <TableCell>
                      <ProductLink
                        product={p}
                        className="flex items-center gap-3"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <img src={p.images[0]} alt="" className="size-12 rounded-lg object-cover" />
                        <span className="font-medium">{p.name}</span>
                      </ProductLink>
                    </TableCell>
                    <TableCell>
                      {eur(p.price)} / {p.unit}
                    </TableCell>
                    <TableCell>{p.available ? "Наличен" : "Изчерпан"}</TableCell>
                    <TableCell>
                      <span
                        className={
                          p.status === "active"
                            ? "rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-primary"
                            : "rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                        }
                      >
                        {p.status === "active" ? "Активен" : "Чернова"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                      <Button variant="ghost" size="icon" aria-label="Редактирай" asChild>
                        <Link to="/dashboard/products/new" search={{ product: p.slug }}>
                          <Pencil />
                        </Link>
                      </Button>
                      <DeleteButton name={p.name} onConfirm={() => void remove(p.slug)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PageNav
            page={qProducts.data?.page ?? 1}
            pages={qProducts.data?.pages ?? 1}
            onPage={(next) => set({ page: next > 1 ? next : undefined })}
          />
        </>
      )}
    </>
  );
}

function ProductLink({
  product,
  className,
  children,
  onClick,
}: {
  product: Product;
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  if (product.status === "draft") {
    return (
      <Link
        to="/dashboard/products/new"
        search={{ product: product.slug }}
        className={className}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link to="/products/$id" params={{ id: product.slug }} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

function DeleteButton({ name, onConfirm }: { name: string; onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Изтрий">
          <Trash2 className="text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Изтриване на „{name}“?</AlertDialogTitle>
          <AlertDialogDescription>
            Продуктът ще бъде премахнат от профила ви.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отказ</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Изтрий</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
