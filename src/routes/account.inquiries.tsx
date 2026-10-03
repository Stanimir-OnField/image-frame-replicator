import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PanelTitle } from "@/components/site/PanelLayout";
import { producers, products } from "@/lib/mock-data";

const items = [
  { id: "i1", productId: "rozovi-domati", status: "Отговорено", date: "29 септ.", text: "Имате ли 10 кг за събота?" },
  { id: "i2", productId: "akatsiev-med", status: "Изчаква отговор", date: "27 септ.", text: "Изпращате ли до Варна?" },
];

export const Route = createFileRoute("/account/inquiries")({
  component: () => (
    <>
      <PanelTitle title="Моите запитвания" />
      <div className="space-y-4">
        {items.map((i) => {
          const p = products.find((x) => x.id === i.productId)!;
          const pr = producers.find((x) => x.id === p.producerId)!;
          return (
            <div key={i.id} className="card-soft flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <img src={p.images[0]} alt="" className="size-16 rounded-xl object-cover" />
              <div className="flex-1"><p className="font-semibold text-forest">{p.name}</p><p className="text-sm text-muted-foreground">{pr.name} · {i.date}</p><p className="mt-1">„{i.text}“</p></div>
              <span className={i.status === "Отговорено" ? "rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary" : "rounded-full bg-sun/30 px-3 py-1 text-xs font-semibold text-sun-foreground"}>{i.status}</span>
              <Button asChild variant="outline"><Link to="/account/messages">Отвори</Link></Button>
            </div>
          );
        })}
      </div>
    </>
  ),
});
