// Shapes mirror the planned Rails REST API (snake_case kept out of UI via mapping in api.ts).
export type DeliveryMethod = "delivery" | "pickup" | "courier";

export interface Category {
  slug: string;
  name: string;
  image: string;
  count: number;
}

export interface Producer {
  id: string;
  name: string;
  location: string;
  region: string;
  description: string;
  story: string;
  avatar: string;
  cover: string;
  rating: number;
  reviewsCount: number;
  categories: string[];
  delivery: DeliveryMethod[];
  verified: boolean;
  phone: string;
  email: string;
  website?: string;
  pickupInfo: string;
}

export interface Product {
  id: string;
  name: string;
  producerId: string;
  category: string;
  price: number; // EUR
  unit: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  delivery: DeliveryMethod[];
  available: boolean;
  description: string;
  createdAt: string;
  status?: "active" | "draft";
}

export interface Review {
  id: string;
  producerId: string;
  author: string;
  rating: number;
  date: string;
  text: string;
}

export interface Message {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  with: string;
  avatar: string;
  productId: string;
  unread: number;
  messages: Message[];
}

export interface ProductFilters {
  q?: string;
  category?: string;
  location?: string;
  producer?: string;
  delivery?: DeliveryMethod[];
  minRating?: number;
  maxPrice?: number;
  sort?: "popular" | "rating" | "price_asc" | "price_desc" | "newest";
  page?: number;
}
