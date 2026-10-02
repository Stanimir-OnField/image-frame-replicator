import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { locations } from "@/lib/mock-data";

export function SearchBar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/products", search: { q: q || undefined, location: loc || undefined } });
      }}
      className="flex flex-col gap-2 rounded-3xl bg-background p-2 shadow-[var(--shadow-lift)] md:flex-row md:items-center md:rounded-full"
    >
      <label className="flex flex-1 items-center gap-3 rounded-full px-4 py-2">
        <Search className="size-5 shrink-0 text-primary" />
        <span className="flex flex-1 flex-col">
          <span className="text-xs font-semibold text-forest">Какво търсиш?</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Домати, мед, сирене..." className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground" />
        </span>
      </label>
      <div className="hidden h-10 w-px bg-border md:block" />
      <label className="flex flex-1 items-center gap-3 rounded-full px-4 py-2">
        <MapPin className="size-5 shrink-0 text-primary" />
        <span className="flex flex-1 flex-col">
          <span className="text-xs font-semibold text-forest">Къде?</span>
          <select value={loc} onChange={(e) => setLoc(e.target.value)} className="w-full bg-transparent text-base text-foreground outline-none">
            <option value="">Цяла България</option>
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </span>
      </label>
      <Button type="submit" size="lg" className="md:px-10">Намери</Button>
    </form>
  );
}
