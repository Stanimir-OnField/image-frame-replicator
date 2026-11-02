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

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function messageClock(iso: string) {
  return new Date(iso).toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" });
}

export function chatDayLabel(iso: string, now = new Date()) {
  const date = new Date(iso);
  const start = startOfDay(date);
  const today = startOfDay(now);
  const day = 24 * 60 * 60 * 1000;
  if (start === today) return "Днес";
  if (start === today - day) return "Вчера";
  if (today - start < 7 * day && today - start > 0) {
    const weekday = date.toLocaleDateString("bg-BG", { weekday: "long" });
    return weekday.charAt(0).toLocaleUpperCase("bg-BG") + weekday.slice(1);
  }
  return date.toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "long",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  });
}

export function sameChatDay(left: string, right: string) {
  return startOfDay(new Date(left)) === startOfDay(new Date(right));
}
