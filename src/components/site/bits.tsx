import { ChevronLeft, ChevronRight, Star, Truck, MapPin, Package, Leaf } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bgn, deliveryLabels, eur } from "@/lib/format";
import type { DeliveryMethod } from "@/lib/types";
import type { ReactNode } from "react";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", className)} aria-label="От Полето – начало">
      <span className="grid size-9 place-items-center rounded-full bg-sun text-sun-foreground">
        <Leaf className="size-5" />
      </span>
      <span className="font-display text-xl font-semibold text-forest">
        От Полето
      </span>
    </Link>
  );
}

export function Stars({ value, count, size = "sm" }: { value: number; count?: number; size?: "sm" | "lg" }) {
  const s = size === "lg" ? "size-5" : "size-4";
  return (
    <span className="inline-flex items-center gap-1 text-sm" aria-label={`Оценка ${value} от 5`}>
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn(s, i <= Math.round(value) ? "fill-sun text-sun" : "text-border")} />
        ))}
      </span>
      <span className="font-semibold text-forest">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-muted-foreground">({count})</span>}
    </span>
  );
}

export function Price({ value, unit, large }: { value: number; unit: string; large?: boolean }) {
  return (
    <div>
      <span className={cn("font-bold text-forest", large ? "text-3xl" : "text-lg")}>{eur(value)}</span>
      <span className="text-sm text-muted-foreground"> / {unit}</span>
      <div className="text-xs text-muted-foreground">≈ {bgn(value)}</div>
    </div>
  );
}

const icons: Record<DeliveryMethod, typeof Truck> = { delivery: Truck, pickup: MapPin, courier: Package };

export function DeliveryTags({ methods, compact }: { methods: DeliveryMethod[]; compact?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {methods.map((m) => {
        const I = icons[m];
        return (
          <span key={m} className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            <I className="size-3.5" />
            {!compact && deliveryLabels[m]}
          </span>
        );
      })}
    </div>
  );
}

export function SectionHeading({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
        <h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="card-soft flex flex-col items-center px-5 py-12 text-center sm:px-6 sm:py-16">
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-cream text-primary">{icon}</div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function AlertDot({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return <span className={cn("inline-block size-2 shrink-0 rounded-full bg-destructive", className)} aria-label={`${count} нови`} />;
}

function pageItems(page: number, pages: number) {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);
  const items: Array<number | "gap"> = [1];
  if (start > 2) items.push("gap");
  for (let number = start; number <= end; number += 1) items.push(number);
  if (end < pages - 1) items.push("gap");
  items.push(pages);
  return items;
}

export function PageNav({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  if (pages <= 1) return null;
  const go = (next: number) => {
    onPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Страници">
      <Button variant="outline" disabled={page <= 1} onClick={() => go(page - 1)}><ChevronLeft /> Назад</Button>
      {pageItems(page, pages).map((item, index) => item === "gap" ? (
        <span key={`gap-${index}`} className="px-1 text-muted-foreground" aria-hidden>…</span>
      ) : (
        <Button key={item} size="icon" variant={item === page ? "default" : "outline"} aria-current={item === page ? "page" : undefined} aria-label={`Страница ${item}`} onClick={() => go(item)}>{item}</Button>
      ))}
      <Button variant="outline" disabled={page >= pages} onClick={() => go(page + 1)}>Напред <ChevronRight /></Button>
    </nav>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="bg-cream py-7 sm:py-10 md:py-14">
      <div className="container-page">
        {children}
        <h1 className="text-3xl font-semibold sm:text-4xl md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-base text-muted-foreground sm:mt-3 sm:text-lg">{subtitle}</p>}
      </div>
    </div>
  );
}
