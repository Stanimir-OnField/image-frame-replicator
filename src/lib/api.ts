import { queryOptions } from "@tanstack/react-query";
import { categories, conversations, producers, products, reviews } from "./mock-data";
import type { ProductFilters } from "./types";

/**
 * Data access layer. Today every call resolves mock data; later swap the body of
 * `request` for `fetch(`${API_BASE_URL}${path}`)` against the Rails REST API.
 */
export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:3000/api/v1";
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

async function request<T>(_path: string, resolver: () => T): Promise<T> {
  await delay();
  return resolver();
}

export const PAGE_SIZE = 9;

export function filterProducts(f: ProductFilters) {
  let list = products.filter((p) => {
    const prod = producers.find((x) => x.id === p.producerId)!;
    if (f.q && !`${p.name} ${prod.name}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    if (f.category && p.category !== f.category) return false;
    if (f.location && prod.region !== f.location) return false;
    if (f.producer && p.producerId !== f.producer) return false;
    if (f.minRating && p.rating < f.minRating) return false;
    if (f.maxPrice && p.price > f.maxPrice) return false;
    if (f.delivery?.length && !f.delivery.some((d) => p.delivery.includes(d))) return false;
    return true;
  });
  const s = f.sort ?? "popular";
  list = [...list].sort((a, b) =>
    s === "rating" ? b.rating - a.rating
    : s === "price_asc" ? a.price - b.price
    : s === "price_desc" ? b.price - a.price
    : s === "newest" ? b.createdAt.localeCompare(a.createdAt)
    : b.reviewsCount - a.reviewsCount,
  );
  const page = f.page ?? 1;
  return { items: list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: list.length, page, pages: Math.max(1, Math.ceil(list.length / PAGE_SIZE)) };
}

export const categoriesQuery = () => queryOptions({ queryKey: ["categories"], queryFn: () => request("/categories", () => categories) });
export const producersQuery = () => queryOptions({ queryKey: ["producers"], queryFn: () => request("/producers", () => producers) });
export const producerQuery = (id: string) => queryOptions({
  queryKey: ["producer", id],
  queryFn: () => request(`/producers/${id}`, () => {
    const producer = producers.find((p) => p.id === id);
    if (!producer) return null;
    return { producer, products: products.filter((p) => p.producerId === id), reviews: reviews.filter((r) => r.producerId === id) };
  }),
});
export const productsQuery = (f: ProductFilters) => queryOptions({ queryKey: ["products", f], queryFn: () => request("/products", () => filterProducts(f)) });
export const productQuery = (id: string) => queryOptions({
  queryKey: ["product", id],
  queryFn: () => request(`/products/${id}`, () => {
    const product = products.find((p) => p.id === id);
    if (!product) return null;
    return {
      product,
      producer: producers.find((p) => p.id === product.producerId)!,
      similar: products.filter((p) => p.category === product.category && p.id !== id).concat(products.filter((p) => p.category !== product.category)).slice(0, 4),
    };
  }),
});
export const conversationsQuery = () => queryOptions({ queryKey: ["conversations"], queryFn: () => request("/conversations", () => conversations) });
