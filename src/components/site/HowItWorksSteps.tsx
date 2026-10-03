import { Search, Users, MessageCircle } from "lucide-react";

export const steps = [
  { icon: Search, title: "Намери продукт", text: "Търси по продукт, категория или населено място." },
  { icon: Users, title: "Избери производител", text: "Разгледай профила, историята и отзивите на стопанина." },
  { icon: MessageCircle, title: "Свържи се директно", text: "Пиши на производителя и се уговорете за доставка или вземане." },
];

export function HowItWorksSteps() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {steps.map((s, i) => (
        <div key={s.title} className="card-soft relative p-5 sm:p-7">
          <span className="absolute right-6 top-5 font-display text-5xl font-semibold text-sun/60">{i + 1}</span>
          <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-accent text-primary"><s.icon className="size-7" /></div>
          <h3 className="text-xl font-semibold">{s.title}</h3>
          <p className="mt-2 text-muted-foreground">{s.text}</p>
        </div>
      ))}
    </div>
  );
}

