import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Menu, Heart, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { logout, meQuery, notificationsQuery, useAuthToken } from "@/lib/api";
import { AlertDot, Logo } from "./bits";

const nav = [
  { to: "/", label: "Начало" },
  { to: "/producers", label: "Производители" },
  { to: "/products", label: "Продукти" },
  { to: "/categories", label: "Категории" },
  { to: "/how-it-works", label: "Как работи?" },
] as const;

export function SiteHeader() {
  const token = useAuthToken();
  const me = useQuery({ ...meQuery(), enabled: !!token });
  const notes = useQuery({ ...notificationsQuery(), enabled: !!token });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signOut = async () => {
    await logout();
    queryClient.clear();
    await navigate({ to: "/" });
  };
  const home = me.data?.role === "producer" ? "/dashboard" : "/account";
  const attention = notes.data?.unreadMessages ?? 0;
  const inbox = me.data?.role === "producer" ? "/dashboard/messages" : "/account/messages";
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="container-page grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:flex lg:justify-between lg:gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Основна навигация">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-foreground transition hover:bg-cream"
              activeProps={{ className: "bg-cream text-forest font-semibold" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-1 lg:flex">
          {me.data && (
            <Button asChild variant="ghost" size="icon" aria-label={attention > 0 ? `Съобщения, ${attention} нови` : "Съобщения"}>
              <Link to={inbox} className="relative"><MessageCircle /><AlertDot count={attention} className="absolute right-1.5 top-1.5 ring-2 ring-background" /></Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="icon" aria-label="Моят профил"><Link to={home}><User /></Link></Button>
          <Button asChild variant="ghost" size="icon" aria-label="Любими"><Link to="/account/favorites"><Heart /></Link></Button>
          {me.data ? (
            <>
              <Button asChild variant="ghost"><Link to={home}>{me.data.name}</Link></Button>
              <Button variant="outline" onClick={() => void signOut()}>Изход</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost"><Link to="/login">Вход</Link></Button>
              <Button asChild variant="outline"><Link to="/register">Регистрация</Link></Button>
              <Button asChild variant="sun"><Link to="/register" search={{ type: "producer" }}>Стани производител</Link></Button>
            </>
          )}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative lg:hidden" aria-label={attention > 0 ? `Отвори менюто, ${attention} нови` : "Отвори менюто"}><Menu className="size-6" /><AlertDot count={attention} className="absolute right-1.5 top-1.5 ring-2 ring-background" /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(20rem,88vw)] overflow-y-auto">
            <SheetHeader><SheetTitle className="text-left"><Logo /></SheetTitle></SheetHeader>
            <nav className="mt-4 flex flex-col gap-1 px-4">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} className="rounded-xl px-3 py-3 text-base font-medium hover:bg-cream" activeOptions={{ exact: n.to === "/" }} activeProps={{ className: "bg-cream text-forest" }}>{n.label}</Link>
              ))}
              {me.data && <Link to={inbox} className="flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium hover:bg-cream">Съобщения<AlertDot count={attention} /></Link>}
              <Link to="/account" className="rounded-xl px-3 py-3 text-base font-medium hover:bg-cream">Моят профил</Link>
              <Link to="/dashboard" className="rounded-xl px-3 py-3 text-base font-medium hover:bg-cream">Табло на производител</Link>
              <div className="mt-4 flex flex-col gap-2">
                {me.data ? (
                  <Button variant="outline" onClick={() => void signOut()}>Изход</Button>
                ) : (
                  <>
                    <Button asChild variant="outline"><Link to="/login">Вход</Link></Button>
                    <Button asChild><Link to="/register">Регистрация</Link></Button>
                    <Button asChild variant="sun"><Link to="/register" search={{ type: "producer" }}>Стани производител</Link></Button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-forest text-primary-foreground">
      <div className="container-page grid gap-8 py-10 sm:py-14 md:grid-cols-4 md:gap-10">
        <div className="md:col-span-2">
          <p className="font-display text-2xl font-semibold">От Полето</p>
          <p className="mt-3 max-w-sm text-primary-foreground/75">Истинска храна, директно от българските ферми, мандри и пчелини. Без посредници.</p>
        </div>
        <div>
          <p className="mb-3 font-semibold">Разгледай</p>
          <ul className="space-y-2 text-primary-foreground/75">
            <li><Link to="/products" className="hover:text-sun">Продукти</Link></li>
            <li><Link to="/producers" className="hover:text-sun">Производители</Link></li>
            <li><Link to="/categories" className="hover:text-sun">Категории</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold">За производители</p>
          <ul className="space-y-2 text-primary-foreground/75">
            <li><Link to="/register" search={{ type: "producer" }} className="hover:text-sun">Стани производител</Link></li>
            <li><Link to="/dashboard" className="hover:text-sun">Табло</Link></li>
            <li><Link to="/how-it-works" className="hover:text-sun">Как работи?</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 py-5 text-center text-sm text-primary-foreground/60">© 2026 От Полето. Всички права запазени.</div>
    </footer>
  );
}
