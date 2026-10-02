import { Link } from "@tanstack/react-router";
import { Menu, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./bits";

const nav = [
  { to: "/", label: "Начало" },
  { to: "/producers", label: "Производители" },
  { to: "/products", label: "Продукти" },
  { to: "/categories", label: "Категории" },
  { to: "/how-it-works", label: "Как работи?" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
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
          <Button asChild variant="ghost" size="icon" aria-label="Моят профил"><Link to="/account"><User /></Link></Button>
          <Button asChild variant="ghost" size="icon" aria-label="Любими"><Link to="/account/favorites"><Heart /></Link></Button>
          <Button asChild variant="ghost"><Link to="/login">Вход</Link></Button>
          <Button asChild variant="outline"><Link to="/register">Регистрация</Link></Button>
          <Button asChild variant="sun"><Link to="/register" search={{ type: "producer" }}>Стани производител</Link></Button>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Отвори менюто"><Menu className="size-6" /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader><SheetTitle className="text-left"><Logo /></SheetTitle></SheetHeader>
            <nav className="mt-4 flex flex-col gap-1 px-4">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} className="rounded-xl px-3 py-3 text-base font-medium hover:bg-cream" activeOptions={{ exact: n.to === "/" }} activeProps={{ className: "bg-cream text-forest" }}>{n.label}</Link>
              ))}
              <Link to="/account" className="rounded-xl px-3 py-3 text-base font-medium hover:bg-cream">Моят профил</Link>
              <Link to="/dashboard" className="rounded-xl px-3 py-3 text-base font-medium hover:bg-cream">Табло на производител</Link>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline"><Link to="/login">Вход</Link></Button>
                <Button asChild><Link to="/register">Регистрация</Link></Button>
                <Button asChild variant="sun"><Link to="/register" search={{ type: "producer" }}>Стани производител</Link></Button>
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
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
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
