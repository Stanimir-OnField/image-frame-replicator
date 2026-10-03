import type { ReactNode } from "react";
import { images } from "@/lib/mock-data";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="container-page grid min-h-[calc(100dvh-4rem)] items-center gap-10 py-6 sm:py-10 lg:grid-cols-2">
      <div className="card-soft mx-auto w-full max-w-md p-5 sm:p-8">
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      <img src={images.hero} alt="" className="hidden h-[600px] w-full rounded-3xl object-cover lg:block" />
    </div>
  );
}
