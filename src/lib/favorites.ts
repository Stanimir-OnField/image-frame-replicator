import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addFavorite, favoritesQuery, removeFavorite, useAuthToken } from "./api";

function target(id: string) {
  if (id.startsWith("producer:")) return { type: "producer" as const, slug: id.slice("producer:".length) };
  return { type: "product" as const, slug: id };
}

export function useFavorites(page?: number) {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const query = useQuery({ ...favoritesQuery(page), enabled: !!token });
  const list = query.data?.ids ?? [];

  const toggle = async (id: string, label = "Продуктът") => {
    if (!token) {
      toast.error("Влез, за да запазиш любими");
      return;
    }
    const has = list.includes(id);
    const favorite = target(id);
    try {
      if (has) await removeFavorite(favorite);
      else await addFavorite(favorite);
      await queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success(has ? `${label} е премахнат от любими` : `${label} е добавен в любими`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Неуспешна промяна");
    }
  };

  return {
    list,
    products: query.data?.products ?? [],
    page: query.data?.page ?? page ?? 1,
    pages: query.data?.pages ?? 1,
    isLoading: query.isLoading,
    has: (id: string) => list.includes(id),
    toggle,
  };
}
