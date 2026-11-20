import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/site/FilterPanel";
import { locationsQuery } from "@/lib/api";

export function SearchBar() {
  const navigate = useNavigate();
  const locations = useQuery(locationsQuery());
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState<string[]>([]);
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/products", search: { q: q || undefined, location: loc.length ? loc : undefined } });
      }}
      className="flex flex-col gap-1 rounded-2xl bg-background p-2 shadow-[var(--shadow-lift)] sm:rounded-3xl md:flex-row md:items-center md:rounded-full"
    >
      <label className="flex flex-1 items-center gap-3 rounded-full px-4 py-2">
        <Search className="size-5 shrink-0 text-primary" />
        <span className="flex flex-1 flex-col">
          <span className="text-xs font-semibold text-forest">Какво търсиш?</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Домати, мед, сирене..."
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
        </span>
      </label>
      <div className="hidden h-10 w-px bg-border md:block" />
      <label className="flex flex-1 items-center gap-3 rounded-full px-4 py-2">
        <MapPin className="size-5 shrink-0 text-primary" />
        <span className="flex flex-1 flex-col">
          <span className="text-xs font-semibold text-forest">Къде?</span>
          <SearchableSelect
            ariaLabel="Къде?"
            allLabel="Цяла България"
            value={loc}
            onValueChange={(value) => setLoc(value ?? [])}
            options={(locations.data ?? []).map((location) => ({
              value: location,
              label: location,
            }))}
            className="h-auto rounded-none border-0 px-0 py-0 text-base shadow-none"
          />
        </span>
      </label>
      <Button type="submit" size="lg" className="w-full md:w-auto md:px-10">
        Намери
      </Button>
    </form>
  );
}
