import { useSyncExternalStore } from "react";
import { toast } from "sonner";

// Client-side favorites until the Rails API provides /favorites.
const KEY = "favorites";
let state: string[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { state = JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { state = []; }
}
const empty: string[] = [];

export function useFavorites() {
  const list = useSyncExternalStore(
    (cb) => { load(); listeners.add(cb); cb(); return () => listeners.delete(cb); },
    () => state,
    () => empty,
  );
  const toggle = (id: string, label = "Продуктът") => {
    const has = state.includes(id);
    state = has ? state.filter((x) => x !== id) : [...state, id];
    localStorage.setItem(KEY, JSON.stringify(state));
    listeners.forEach((l) => l());
    toast.success(has ? `${label} е премахнат от любими` : `${label} е добавен в любими`);
  };
  return { list, has: (id: string) => list.includes(id), toggle };
}
