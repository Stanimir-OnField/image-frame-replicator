import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PanelTitle } from "@/components/site/PanelLayout";
import { EmptyState } from "@/components/site/bits";
import { products } from "@/lib/mock-data";
import { eur } from "@/lib/format";

export const Route = createFileRoute("/dashboard/products/")({ component: MyProducts });

function MyProducts() {
  const [list, setList] = useState(() => products.filter((p) => p.producerId === "zelenata-dolina").map((p, i) => ({ ...p, status: i === 3 ? "draft" : "active" })));
  return (
    <>
      <PanelTitle title="Моите продукти" action={<Button asChild><Link to="/dashboard/products/new"><Plus /> Добави продукт</Link></Button>} />
      {list.length === 0 ? (
        <EmptyState icon={<Package />} title="Все още нямаш продукти" text="Добави първия си продукт, за да те намират клиенти." action={<Button asChild><Link to="/dashboard/products/new">+ Добави продукт</Link></Button>} />
      ) : (
        <div className="card-soft overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Продукт</TableHead><TableHead>Цена</TableHead><TableHead>Наличност</TableHead><TableHead>Статус</TableHead><TableHead className="text-right">Действия</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.map((p) => (
                <TableRow key={p.id}>
                  <TableCell><div className="flex items-center gap-3"><img src={p.images[0]} alt="" className="size-12 rounded-lg object-cover" /><span className="font-medium">{p.name}</span></div></TableCell>
                  <TableCell>{eur(p.price)} / {p.unit}</TableCell>
                  <TableCell>{p.available ? "Наличен" : "Изчерпан"}</TableCell>
                  <TableCell><span className={p.status === "active" ? "rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-primary" : "rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"}>{p.status === "active" ? "Активен" : "Чернова"}</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" aria-label="Редактирай" asChild><Link to="/dashboard/products/new"><Pencil /></Link></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Изтрий"><Trash2 className="text-destructive" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Изтриване на „{p.name}“?</AlertDialogTitle><AlertDialogDescription>Продуктът ще бъде премахнат от профила ви.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Отказ</AlertDialogCancel><AlertDialogAction onClick={() => { setList((l) => l.filter((x) => x.id !== p.id)); toast.success("Продуктът е изтрит"); }}>Изтрий</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
