import { useState, type ReactNode } from "react";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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

export function searchList(value: unknown): string[] | undefined {
  const raw = Array.isArray(value) ? value : value === undefined || value === null || value === "" ? [] : [value];
  const list = raw
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim());
  const unique = [...new Set(list)];
  return unique.length ? unique : undefined;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  allLabel,
  ariaLabel,
  className,
  searchPlaceholder = "Търси...",
}: {
  value?: string | string[] | undefined;
  onValueChange: (value: string[] | undefined) => void;
  options: { value: string; label: string }[];
  allLabel: string;
  ariaLabel: string;
  className?: string;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = searchList(value) ?? [];
  const summary = selected
    .map((item) => options.find((option) => option.value === item)?.label ?? item)
    .join(", ");
  const toggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    onValueChange(next.length ? next : undefined);
  };
  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn(
            "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-input bg-transparent px-3 text-left text-sm shadow-sm",
            className,
          )}
        >
          <span className="truncate">{summary || allLabel}</span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="z-[60] w-[var(--radix-popover-trigger-width)] min-w-56 p-0"
      >
        <Command
          filter={(item, search) => {
            const needle = search.trim().toLocaleLowerCase("bg");
            if (!needle) return 1;
            return item.toLocaleLowerCase("bg").includes(needle) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>Няма резултати</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value={allLabel}
                onSelect={() => {
                  onValueChange(undefined);
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <Check className={cn("size-4", selected.length ? "opacity-0" : "opacity-100")} />
                {allLabel}
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  onSelect={() => toggle(option.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "size-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
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

export function ListingFilters({
  query,
  onQuery,
  placeholder,
  children,
  onClear,
}: {
  query: string;
  onQuery: (value: string) => void;
  placeholder: string;
  children?: ReactNode;
  onClear?: () => void;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Input
        key={query}
        defaultValue={query}
        placeholder={placeholder}
        aria-label="Търсене"
        className="h-11 rounded-xl sm:max-w-xs"
        onBlur={(event) => onQuery(event.target.value.trim())}
        onKeyDown={(event) => {
          if (event.key === "Enter") (event.target as HTMLInputElement).blur();
        }}
      />
      {children}
      {onClear && (
        <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={onClear}>
          Изчисти
        </Button>
      )}
    </div>
  );
}

export function FilterDrawer({ children }: { children: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal /> Филтри
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Филтри</SheetTitle>
        </SheetHeader>
        <div className="space-y-5 px-4 pb-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
