import { Star, Truck, MapPin, Package, Leaf } from "lucide-react";
import { Link } from "@tanstack/react-router";
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
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
        <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="card-soft flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-cream text-primary">{icon}</div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="bg-cream py-10 md:py-14">
      <div className="container-page">
        {children}
        <h1 className="text-4xl font-semibold md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
