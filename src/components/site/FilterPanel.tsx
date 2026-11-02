import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function searchCoordinate(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function searchNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

export function searchFlag(value: unknown) {
  return value === true || value === "true" || value === "1" || value === 1 ? true : undefined;
}

export function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border-b border-border pb-5">
      <h2 className="text-sm font-semibold text-forest">{title}</h2>
      {children}
    </section>
  );
}

export function FilterAside({ children }: { children: ReactNode }) {
  return (
    <aside className="hidden lg:block">
      <div className="card-soft sticky top-24 max-h-[calc(100vh-7rem)] space-y-5 overflow-y-auto p-6">
        <h2 className="text-lg font-semibold text-forest">Филтри</h2>
        {children}
      </div>
    </aside>
  );
}

export function FilterDrawer({ children }: { children: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline" className="lg:hidden"><SlidersHorizontal /> Филтри</Button></SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader><SheetTitle>Филтри</SheetTitle></SheetHeader>
        <div className="space-y-5 px-4 pb-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
