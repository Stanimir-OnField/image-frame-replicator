import { Link, Outlet, type LinkProps } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { meQuery, notificationsQuery, useAuthToken } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AlertDot, EmptyState } from "./bits";

export type PanelItem = {
  to: NonNullable<LinkProps["to"]>;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export function PanelLayout({
  title,
  subtitle,
  items,
  requireRole,
}: {
  title: string;
  subtitle: string;
  items: PanelItem[];
  requireRole?: "producer" | "any";
}) {
  const token = useAuthToken();
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => setAuthReady(true), []);
  const me = useQuery({ ...meQuery(), enabled: !!token });
  const notes = useQuery({ ...notificationsQuery(), enabled: !!token });
  const heading = me.data?.name ?? title;
  const badge = (to: string) => {
    if (to === "/account/messages") return notes.data?.unreadCustomerMessages ?? 0;
    if (to === "/dashboard/messages") return notes.data?.unreadProducerMessages ?? 0;
    return 0;
  };
  return (
    <div className="container-page grid gap-5 py-5 sm:gap-8 sm:py-8 lg:grid-cols-[240px_1fr]">
      <aside className="min-w-0 max-w-full overflow-hidden">
        <div className="mb-4 hidden lg:block">
          <p className="font-display text-xl font-semibold text-forest">{heading}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <nav
          className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:px-0"
          aria-label={title}
        >
          {items.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              activeOptions={{ exact: !!i.exact }}
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-cream lg:gap-3 lg:px-4"
              activeProps={{ className: "bg-accent text-forest font-semibold" }}
            >
              <i.icon className="size-4" />
              <span className="flex-1">{i.label}</span>
              <AlertDot count={badge(i.to)} />
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 max-w-full">
        {!requireRole ? (
          <Outlet />
        ) : !authReady || (token && me.isLoading) ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : !token ? (
          <EmptyState
            icon={<User />}
            title="Влез в профила си"
            text="Тази страница е достъпна след вход."
            action={
              <Button asChild>
                <Link to="/login">Вход</Link>
              </Button>
            }
          />
        ) : requireRole === "producer" && me.data?.role !== "producer" ? (
          <EmptyState
            icon={<User />}
            title="Таблото е за производители"
            text="Създай профил на производител, за да добавяш продукти и да получаваш съобщения."
            action={
              <Button asChild variant="sun">
                <Link to="/register" search={{ type: "producer" }}>
                  Стани производител
                </Link>
              </Button>
            }
          />
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}

export function PanelTitle({
  title,
  action,
  compact,
}: {
  title: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
        compact && "max-lg:mb-3",
      )}
    >
      <h1 className={cn("min-w-0 text-2xl font-semibold sm:text-3xl", compact && "max-lg:text-xl")}>
        {title}
      </h1>
      {action && <div className="[&>*]:w-full sm:[&>*]:w-auto">{action}</div>}
    </div>
  );
}
