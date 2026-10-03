import { Link, Outlet, type LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export type PanelItem = { to: NonNullable<LinkProps["to"]>; label: string; icon: LucideIcon; exact?: boolean };

export function PanelLayout({ title, subtitle, items }: { title: string; subtitle: string; items: PanelItem[] }) {
  return (
    <div className="container-page grid gap-5 py-5 sm:gap-8 sm:py-8 lg:grid-cols-[240px_1fr]">
      <aside className="min-w-0">
        <div className="mb-4 hidden lg:block"><p className="font-display text-xl font-semibold text-forest">{title}</p><p className="text-sm text-muted-foreground">{subtitle}</p></div>
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:px-0" aria-label={title}>
          {items.map((i) => (
            <Link key={i.to} to={i.to} activeOptions={{ exact: !!i.exact }}
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-cream lg:gap-3 lg:px-4"
              activeProps={{ className: "bg-accent text-forest font-semibold" }}>
              <i.icon className="size-4" />{i.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0"><Outlet /></div>
    </div>
  );
}

export function PanelTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><h1 className="min-w-0 text-2xl font-semibold sm:text-3xl">{title}</h1>{action && <div className="[&>*]:w-full sm:[&>*]:w-auto">{action}</div>}</div>;
}
