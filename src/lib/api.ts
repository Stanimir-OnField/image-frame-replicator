import { queryOptions } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { images } from "./mock-data";
import type {
  Category,
  Conversation,
  DashboardOverview,
  DeliveryMethod,
  Message,
  MessageAttachment,
  Producer,
  Product,
  ProducerFilters,
  ProductFilters,
  Review,
  SessionUser,
} from "./types";

/**
 * Data access layer. Screens talk only to these query options and commands;
 * responses from the Rails API are mapped into the UI types here.
 */
export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:3000/api/v1";

const TOKEN_KEY = "ot_poleto_token";
let memoryToken: string | null | undefined;
const tokenListeners = new Set<() => void>();

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getToken() {
  if (memoryToken === undefined) {
    memoryToken = typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
  }
  return memoryToken;
}

export function setToken(next: string | null) {
  memoryToken = next;
  if (typeof window !== "undefined") {
    if (next) window.localStorage.setItem(TOKEN_KEY, next);
    else window.localStorage.removeItem(TOKEN_KEY);
  }
  tokenListeners.forEach((listener) => listener());
}

function subscribeToken(listener: () => void) {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
}

export function useAuthToken() {
  return useSyncExternalStore(subscribeToken, getToken, () => null);
}

const categoryFallback: Record<string, string> = {
  plodove: images.hero,
  zelenchutsi: images.vegetables,
  mlechni: images.cheese,
  meso: images.farm,
  yaitsa: images.eggs,
  med: images.honey,
  hlyab: images.bread,
  vino: images.bread,
  domashni: images.tomatoes,
};

function picture(url: string | null | undefined, fallback: string) {
  return url || fallback;
}

interface RawCategory {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  count: number;
}
interface RawProducer {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  story: string | null;
  avatar: string | null;
  cover: string | null;
  rating: number;
  reviews_count: number;
  categories: string[];
  category_names: string[];
  delivery: DeliveryMethod[];
  verified: boolean;
  phone: string | null;
  email: string | null;
  website: string | null;
  pickup_info: string | null;
}
interface RawProduct {
  id: string;
  slug: string;
  name: string;
  producer_id: string;
  producer_slug: string;
  producer_name: string;
  producer_location: string | null;
  category_id: string;
  category_slug: string;
  category_name: string;
  price: number;
  unit: string;
  quantity: number | null;
  images: string[];
  rating: number;
  reviews_count: number;
  delivery: DeliveryMethod[];
  available: boolean;
  description: string | null;
  created_at: string;
  status: "active" | "draft";
  views_count: number;
}
interface RawReview {
  id: string;
  producer_slug?: string;
  producer_name?: string;
  author_name: string | null;
  rating: number;
  body: string;
  created_at: string;
  reply_body: string | null;
}
interface RawUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  role: "customer" | "producer";
  producer_slug: string | null;
  notify_messages: boolean;
  notify_news: boolean;
}
interface RawConversation {
  id: string;
  with: string;
  avatar: string | null;
  product_slug: string | null;
  product_name: string | null;
  product_image: string | null;
  unread: number;
  has_older_messages?: boolean;
  messages: RawMessage[];
}
interface RawMessageAttachment {
  id: string;
  filename: string;
  content_type: string;
  byte_size: number;
  kind: "image" | "file";
  url: string;
  download_url?: string;
}
interface RawMessage {
  id: string;
  from_me: boolean;
  text: string;
  created_at: string;
  edited_at?: string | null;
  deleted?: boolean;
  attachments?: RawMessageAttachment[];
}
interface RawPage<T = RawProduct> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
interface AuthPayload {
  token: string;
  user: RawUser;
}

export function mapCategory(raw: RawCategory): Category {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    image: picture(raw.image, categoryFallback[raw.slug] ?? images.vegetables),
    count: raw.count,
  };
}

export function mapProducer(raw: RawProducer): Producer {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    location: raw.location ?? "",
    region: raw.region ?? "",
    latitude: raw.latitude,
    longitude: raw.longitude,
    description: raw.description ?? "",
    story: raw.story ?? "",
    avatar: picture(raw.avatar, images.vegetables),
    cover: picture(raw.cover, images.farm),
    rating: raw.rating,
    reviewsCount: raw.reviews_count,
    categories: raw.categories,
    categoryNames: raw.category_names,
    delivery: raw.delivery,
    verified: raw.verified,
    phone: raw.phone ?? "",
    email: raw.email ?? "",
    ...(raw.website ? { website: raw.website } : {}),
    pickupInfo: raw.pickup_info ?? "",
  };
}

export function mapProduct(raw: RawProduct): Product {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    producerId: raw.producer_id,
    producerSlug: raw.producer_slug,
    producerName: raw.producer_name,
    producerLocation: raw.producer_location ?? "",
    categoryId: raw.category_id,
    category: raw.category_slug,
    categoryName: raw.category_name,
    price: raw.price,
    unit: raw.unit,
    quantity: raw.quantity,
    images: raw.images.length ? raw.images : [images.vegetables],
    rating: raw.rating,
    reviewsCount: raw.reviews_count,
    delivery: raw.delivery,
    available: raw.available,
    description: raw.description ?? "",
    createdAt: raw.created_at,
    status: raw.status,
    viewsCount: raw.views_count,
  };
}

export function mapReview(raw: RawReview, producerId?: string): Review {
  return {
    id: raw.id,
    producerId: raw.producer_slug ?? producerId ?? "",
    author: raw.author_name ?? "Клиент",
    rating: raw.rating,
    date: raw.created_at,
    text: raw.body,
    ...(raw.producer_name ? { producerName: raw.producer_name } : {}),
    ...(raw.reply_body ? { reply: raw.reply_body } : {}),
  };
}

function mapUser(raw: RawUser): SessionUser {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone ?? "",
    city: raw.city ?? "",
    role: raw.role,
    producerId: raw.producer_slug ?? undefined,
    notifyMessages: raw.notify_messages,
    notifyNews: raw.notify_news,
  };
}

export function mapAttachments(raw: unknown): MessageAttachment[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const file = item as Partial<RawMessageAttachment>;
    if (typeof file.url !== "string" || typeof file.filename !== "string") return [];
    return [
      {
        id: String(file.id ?? file.url),
        filename: file.filename,
        contentType: file.content_type ?? "",
        byteSize: Number(file.byte_size) || 0,
        kind: file.kind === "image" ? ("image" as const) : ("file" as const),
        url: file.url,
        downloadUrl: typeof file.download_url === "string" ? file.download_url : file.url,
      },
    ];
  });
}

export function messageTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString())
    return date.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("bg-BG", { day: "numeric", month: "short" });
}

export function mapMessage(message: RawMessage): Message {
  return {
    id: message.id,
    fromMe: message.from_me,
    text: message.deleted ? "" : message.text,
    time: messageTime(message.created_at),
    createdAt: message.created_at,
    editedAt: message.deleted ? null : (message.edited_at ?? null),
    deleted: Boolean(message.deleted),
    attachments: message.deleted ? [] : mapAttachments(message.attachments),
  };
}

function mapConversation(raw: RawConversation): Conversation {
  return {
    id: raw.id,
    with: raw.with,
    avatar: raw.avatar,
    productId: raw.product_slug ?? undefined,
    productName: raw.product_name ?? undefined,
    productImage: raw.product_image,
    unread: raw.unread,
    hasOlderMessages: Boolean(raw.has_older_messages),
    messages: raw.messages.map(mapMessage),
  };
}

export function conversationAttachments(
  conversationId: string,
  kind: "image" | "file",
  before?: string,
) {
  const params = new URLSearchParams({ kind });
  if (before) params.set("before", before);
  return request<{ attachments: RawMessageAttachment[]; has_more: boolean }>(
    `/conversations/${conversationId}/attachments?${params.toString()}`,
  ).then((page) => ({
    attachments: mapAttachments(page.attachments),
    hasMore: page.has_more,
  }));
}

export function olderMessages(conversationId: string, beforeId: string) {
  return request<{ messages: RawMessage[]; has_older_messages: boolean }>(
    `/conversations/${conversationId}/messages?before=${encodeURIComponent(beforeId)}`,
  ).then((page) => ({
    messages: page.messages.map(mapMessage),
    hasOlderMessages: page.has_older_messages,
  }));
}

function errorMessage(status: number, data: { error?: string }) {
  if (data.error && /[А-Яа-я]/.test(data.error)) return data.error;
  if (status === 401) return "Влез в профила си, за да продължиш.";
  if (status === 403) return "Нямаш достъп до това действие.";
  if (status === 404) return "Не е намерено.";
  if (status === 422) return "Проверете въведените данни.";
  return "Нещо се обърка. Опитай отново.";
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "Няма връзка със сървъра. Опитай отново.");
  }
  if (response.status === 204) return undefined as T;
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    if (response.status === 401 && path !== "/session" && path !== "/registration") setToken(null);
    throw new ApiError(response.status, errorMessage(response.status, data));
  }
  return data as T;
}

async function requestOrNull<T>(path: string): Promise<T | null> {
  try {
    return await request<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

function pageSearch(filters: {
  q?: string | undefined;
  page?: number | undefined;
  perPage?: number | undefined;
}) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  if (filters.perPage) params.set("per_page", String(filters.perPage));
  const query = params.toString();
  return query ? `?${query}` : "";
}

function catalogSearch(filters: ProductFilters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.location) params.set("region", filters.location);
  if (filters.producer) params.set("producer", filters.producer);
  filters.delivery?.forEach((method) => params.append("delivery[]", method));
  if (filters.minRating) params.set("min_rating", String(filters.minRating));
  if (filters.minPrice !== undefined) params.set("min_price", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("max_price", String(filters.maxPrice));
  if (filters.available) params.set("available", "1");
  if (filters.verified) params.set("verified", "1");
  if (filters.lat !== undefined && filters.lng !== undefined && filters.radius !== undefined) {
    params.set("lat", String(filters.lat));
    params.set("lng", String(filters.lng));
    params.set("radius", String(filters.radius));
  }
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

async function storeSession(payload: AuthPayload) {
  setToken(payload.token);
  return mapUser(payload.user);
}

export function login(email: string, password: string) {
  return request<AuthPayload>("/session", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }).then(storeSession);
}

export function register(input: {
  role: "customer" | "producer";
  name: string;
  email: string;
  password: string;
  location?: string;
  phone?: string;
}) {
  return request<AuthPayload>("/registration", {
    method: "POST",
    body: JSON.stringify(input),
  }).then(storeSession);
}

export async function logout() {
  try {
    await request("/session", { method: "DELETE" });
  } finally {
    setToken(null);
  }
}

export function requestPasswordReset(email: string) {
  return request("/password_reset", { method: "POST", body: JSON.stringify({ email }) });
}

export function resetPassword(token: string, password: string) {
  return request("/password_reset", { method: "PATCH", body: JSON.stringify({ token, password }) });
}

export function updateProfile(
  input: Partial<Pick<SessionUser, "name" | "email" | "phone" | "city">>,
) {
  return request<RawUser>("/me", { method: "PATCH", body: JSON.stringify(input) }).then(mapUser);
}

export function updatePassword(currentPassword: string, password: string) {
  return request("/password", {
    method: "PATCH",
    body: JSON.stringify({ current_password: currentPassword, password }),
  });
}

export function updateNotifications(input: { notifyMessages?: boolean; notifyNews?: boolean }) {
  return request<RawUser>("/notification_preferences", {
    method: "PATCH",
    body: JSON.stringify({
      notify_messages: input.notifyMessages,
      notify_news: input.notifyNews,
    }),
  }).then(mapUser);
}

export function deleteAccount() {
  return request("/me", { method: "DELETE" }).finally(() => setToken(null));
}

export function startConversation(input: {
  producerId: string;
  productId?: string | undefined;
  name: string;
  phone: string;
  body: string;
}) {
  return request<{ id: string }>("/conversations", {
    method: "POST",
    body: JSON.stringify({
      producer_slug: input.producerId,
      product_slug: input.productId,
      name: input.name,
      phone: input.phone,
      body: input.body,
    }),
  });
}

export function createReview(producerId: string, input: { rating: number; body: string }) {
  return request(`/producers/${producerId}/reviews`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function replyToReview(reviewId: string, body: string) {
  return request(`/dashboard/reviews/${reviewId}/reply`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function sendMessage(conversationId: string, input: { body: string; files?: File[] }) {
  const body = new FormData();
  body.set("body", input.body);
  input.files?.forEach((file) => body.append("files[]", file));
  return request(`/conversations/${conversationId}/messages`, { method: "POST", body });
}

export function updateMessage(conversationId: string, messageId: string, body: string) {
  return request<RawMessage>(`/conversations/${conversationId}/messages/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify({ body }),
  }).then(mapMessage);
}

export function deleteMessage(conversationId: string, messageId: string) {
  return request<RawMessage>(`/conversations/${conversationId}/messages/${messageId}`, {
    method: "DELETE",
  }).then(mapMessage);
}

export function markConversationRead(conversationId: string) {
  return request(`/conversations/${conversationId}/read`, { method: "POST" });
}

export function addFavorite(input: { type: "product" | "producer"; slug: string }) {
  return request("/favorites", { method: "POST", body: JSON.stringify(input) });
}

export function removeFavorite(input: { type: "product" | "producer"; slug: string }) {
  return request(`/favorites/${input.slug}?type=${input.type}`, { method: "DELETE" });
}

export interface ProductDraft {
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  available: boolean;
  quantity: string;
  delivery: DeliveryMethod[];
  status?: "active" | "draft" | undefined;
  images: File[];
}

export function saveProduct(input: ProductDraft, slug?: string) {
  const body = new FormData();
  body.set("name", input.name);
  body.set("category_slug", input.category);
  body.set("price", String(input.price));
  body.set("unit", input.unit);
  body.set("description", input.description);
  body.set("available", String(input.available));
  body.set("quantity", input.quantity);
  if (input.status) body.set("status", input.status);
  input.delivery.forEach((method) => body.append("delivery[]", method));
  input.images.forEach((file) => body.append("images[]", file));
  const path = slug ? `/dashboard/products/${slug}` : "/dashboard/products";
  return request<RawProduct>(path, { method: slug ? "PATCH" : "POST", body }).then(mapProduct);
}

export function deleteProduct(slug: string) {
  return request(`/dashboard/products/${slug}`, { method: "DELETE" });
}

export function updateProducerProfile(input: {
  name: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  pickupInfo: string;
  story: string;
  latitude: string;
  longitude: string;
  avatar?: File | undefined;
  cover?: File | undefined;
}) {
  const body = new FormData();
  body.set("name", input.name);
  body.set("location", input.location);
  body.set("phone", input.phone);
  body.set("email", input.email);
  body.set("website", input.website);
  body.set("pickup_info", input.pickupInfo);
  body.set("story", input.story);
  body.set("latitude", input.latitude);
  body.set("longitude", input.longitude);
  if (input.avatar) body.set("avatar", input.avatar);
  if (input.cover) body.set("cover", input.cover);
  return request<RawProducer>("/dashboard/profile", { method: "PATCH", body }).then(mapProducer);
}

export const meQuery = () =>
  queryOptions({
    queryKey: ["me"],
    queryFn: () => request<RawUser>("/me").then(mapUser),
    retry: false,
  });

export type Notifications = {
  unreadMessages: number;
  unreadCustomerMessages: number;
  unreadProducerMessages: number;
};

export const notificationsQuery = () =>
  queryOptions({
    queryKey: ["notifications"],
    queryFn: () =>
      request<{
        unread_messages: number;
        unread_customer_messages: number;
        unread_producer_messages: number;
      }>("/notifications").then((data) => ({
        unreadMessages: data.unread_messages,
        unreadCustomerMessages: data.unread_customer_messages,
        unreadProducerMessages: data.unread_producer_messages,
      })),
    refetchInterval: 60_000,
  });
export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: () => request<RawCategory[]>("/categories").then((rows) => rows.map(mapCategory)),
  });
export const locationsQuery = () =>
  queryOptions({ queryKey: ["locations"], queryFn: () => request<string[]>("/locations") });
function producerSearch(filters: ProducerFilters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.location) params.set("region", filters.location);
  if (filters.category) params.set("category", filters.category);
  filters.delivery?.forEach((method) => params.append("delivery[]", method));
  if (filters.minRating) params.set("min_rating", String(filters.minRating));
  if (filters.verified) params.set("verified", "1");
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  if (filters.perPage) params.set("per_page", String(filters.perPage));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const producersQuery = (filters: ProducerFilters = {}) =>
  queryOptions({
    queryKey: ["producers", filters],
    queryFn: () =>
      request<RawPage<RawProducer>>(`/producers${producerSearch(filters)}`).then((page) => ({
        ...page,
        items: page.items.map(mapProducer),
      })),
  });
export const producerQuery = (id: string) =>
  queryOptions({
    queryKey: ["producer", id],
    queryFn: async () => {
      const data = await requestOrNull<{
        producer: RawProducer;
        products: RawProduct[];
        reviews: RawReview[];
        review_distribution: number[];
      }>(`/producers/${id}`);
      if (!data) return null;
      return {
        producer: mapProducer(data.producer),
        products: data.products.map(mapProduct),
        reviews: data.reviews.map((review) => mapReview(review, data.producer.slug)),
        reviewDistribution: data.review_distribution,
      };
    },
  });
export const productsQuery = (filters: ProductFilters) =>
  queryOptions({
    queryKey: ["products", filters],
    queryFn: () =>
      request<RawPage>(`/products${catalogSearch(filters)}`).then((page) => ({
        ...page,
        items: page.items.map(mapProduct),
      })),
  });
export const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: async () => {
      const data = await requestOrNull<{
        product: RawProduct;
        producer: RawProducer;
        similar: RawProduct[];
      }>(`/products/${id}`);
      if (!data) return null;
      return {
        product: mapProduct(data.product),
        producer: mapProducer(data.producer),
        similar: data.similar.map(mapProduct),
      };
    },
  });
export const favoritesQuery = (page?: number) =>
  queryOptions({
    queryKey: ["favorites", page ?? 1],
    queryFn: () =>
      request<{
        ids: string[];
        products: RawProduct[];
        total: number;
        page: number;
        pages: number;
      }>(`/favorites${pageSearch({ page })}`).then((data) => ({
        ids: data.ids,
        products: data.products.map(mapProduct),
        total: data.total,
        page: data.page,
        pages: data.pages,
      })),
  });
export const conversationsQuery = (scope: "customer" | "producer") =>
  queryOptions({
    queryKey: ["conversations", scope],
    queryFn: () =>
      request<RawConversation[]>(`/conversations?scope=${scope}`).then((rows) =>
        rows.map(mapConversation),
      ),
  });
export const accountReviewsQuery = (page?: number) =>
  queryOptions({
    queryKey: ["account", "reviews", page ?? 1],
    queryFn: () =>
      request<RawPage<RawReview>>(`/account/reviews${pageSearch({ page })}`).then((data) => ({
        ...data,
        items: data.items.map((review) => mapReview(review)),
      })),
  });
export const dashboardOverviewQuery = () =>
  queryOptions({
    queryKey: ["dashboard", "overview"],
    queryFn: async () => {
      const data = await request<{
        active_products: number;
        unread_messages: number;
        reviews_count: number;
        profile_views: number;
        recent_conversations: RawConversation[];
        top_products: RawProduct[];
      }>("/dashboard/overview");
      const overview: DashboardOverview = {
        activeProducts: data.active_products,
        unreadMessages: data.unread_messages,
        reviewsCount: data.reviews_count,
        profileViews: data.profile_views,
        recentConversations: data.recent_conversations.map(mapConversation),
        topProducts: data.top_products.map(mapProduct),
      };
      return overview;
    },
  });
export const dashboardProfileQuery = () =>
  queryOptions({
    queryKey: ["dashboard", "profile"],
    queryFn: () => request<RawProducer>("/dashboard/profile").then(mapProducer),
  });
export const myProductsQuery = (page?: number) =>
  queryOptions({
    queryKey: ["dashboard", "products", page ?? 1],
    queryFn: () =>
      request<RawPage>(`/dashboard/products${pageSearch({ page })}`).then((data) => ({
        ...data,
        items: data.items.map(mapProduct),
      })),
  });
export const myProductQuery = (slug: string) =>
  queryOptions({
    queryKey: ["dashboard", "products", slug],
    queryFn: () => request<RawProduct>(`/dashboard/products/${slug}`).then(mapProduct),
  });
export const dashboardReviewsQuery = (page?: number) =>
  queryOptions({
    queryKey: ["dashboard", "reviews", page ?? 1],
    queryFn: async () => {
      const data = await request<{
        rating: number;
        reviews_count: number;
        reviews: RawReview[];
        page: number;
        pages: number;
      }>(`/dashboard/reviews${pageSearch({ page })}`);
      return {
        rating: data.rating,
        reviewsCount: data.reviews_count,
        reviews: data.reviews.map((review) => mapReview(review)),
        page: data.page,
        pages: data.pages,
      };
    },
  });
