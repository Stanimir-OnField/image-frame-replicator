import { Link, Outlet, type LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export type PanelItem = { to: NonNullable<LinkProps["to"]>; label: string; icon: LucideIcon; exact?: boolean };

export function PanelLayout({ title, subtitle, items }: { title: string; subtitle: string; items: PanelItem[] }) {
  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[240px_1fr]">
      <aside>
        <div className="mb-4 hidden lg:block"><p className="font-display text-xl font-semibold text-forest">{title}</p><p className="text-sm text-muted-foreground">{subtitle}</p></div>
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:px-0" aria-label={title}>
          {items.map((i) => (
            <Link key={i.to} to={i.to} activeOptions={{ exact: !!i.exact }}
              className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition hover:bg-cream"
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
  return <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-semibold">{title}</h1>{action}</div>;
}
