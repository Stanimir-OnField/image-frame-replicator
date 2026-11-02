// Shapes mirror the planned Rails REST API (snake_case kept out of UI via mapping in api.ts).
export type DeliveryMethod = "delivery" | "pickup" | "courier";

export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string;
  count: number;
}

export interface Producer {
  id: string;
  slug: string;
  name: string;
  location: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  story: string;
  avatar: string;
  cover: string;
  rating: number;
  reviewsCount: number;
  categories: string[];
  categoryNames: string[];
  delivery: DeliveryMethod[];
  verified: boolean;
  phone: string;
  email: string;
  website?: string;
  pickupInfo: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  producerId: string;
  producerSlug: string;
  producerName: string;
  producerLocation: string;
  categoryId: string;
  category: string;
  categoryName: string;
  price: number; // EUR
  unit: string;
  quantity?: number | null;
  images: string[];
  rating: number;
  reviewsCount: number;
  delivery: DeliveryMethod[];
  available: boolean;
  description: string;
  createdAt: string;
  status?: "active" | "draft";
  viewsCount: number;
}

export interface Review {
  id: string;
  producerId: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  reply?: string | null;
  producerName?: string;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  contentType: string;
  byteSize: number;
  kind: "image" | "file";
  url: string;
  downloadUrl: string;
}

export interface Message {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
  createdAt: string;
  editedAt?: string | null;
  deleted?: boolean;
  attachments?: MessageAttachment[];
}

export interface Conversation {
  id: string;
  with: string;
  avatar: string | null;
  productId?: string | undefined;
  productName?: string | undefined;
  productImage?: string | null | undefined;
  unread: number;
  hasOlderMessages: boolean;
  messages: Message[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: "customer" | "producer";
  producerId?: string | undefined;
  notifyMessages: boolean;
  notifyNews: boolean;
}

export interface DashboardOverview {
  activeProducts: number;
  unreadMessages: number;
  reviewsCount: number;
  profileViews: number;
  recentConversations: Conversation[];
  topProducts: Product[];
}

export interface ProductFilters {
  q?: string | undefined;
  category?: string | undefined;
  location?: string | undefined;
  producer?: string | undefined;
  delivery?: DeliveryMethod[] | undefined;
  minRating?: number | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  available?: boolean | undefined;
  verified?: boolean | undefined;
  lat?: number | undefined;
  lng?: number | undefined;
  radius?: number | undefined;
  sort?: "popular" | "rating" | "price_asc" | "price_desc" | "newest" | undefined;
  page?: number | undefined;
}

export interface ProducerFilters {
  q?: string | undefined;
  category?: string | undefined;
  location?: string | undefined;
  delivery?: DeliveryMethod[] | undefined;
  minRating?: number | undefined;
  verified?: boolean | undefined;
  sort?: "popular" | "rating" | "name" | undefined;
  page?: number | undefined;
  perPage?: number | undefined;
}
