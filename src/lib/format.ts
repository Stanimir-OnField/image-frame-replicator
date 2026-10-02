import type { DeliveryMethod } from "./types";

export const BGN_RATE = 1.95583;
export const eur = (n: number) => `€${n.toFixed(2)}`;
export const bgn = (n: number) => `${(n * BGN_RATE).toFixed(2)} лв.`;

export const deliveryLabels: Record<DeliveryMethod, string> = {
  delivery: "Доставка",
  pickup: "Вземане от място",
  courier: "Куриер",
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("bg-BG", { day: "numeric", month: "long", year: "numeric" });
