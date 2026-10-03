import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PanelTitle } from "@/components/site/PanelLayout";

export const Route = createFileRoute("/account/settings")({ component: Settings });

function Settings() {
  return (
    <>
      <PanelTitle title="Настройки" />
      <div className="space-y-6">
        <div className="card-soft space-y-4 p-4 sm:p-6">
          <h2 className="text-xl font-semibold">Смяна на парола</h2>
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="p1">Текуща парола</Label><Input id="p1" type="password" /></div><div className="space-y-1.5"><Label htmlFor="p2">Нова парола</Label><Input id="p2" type="password" /></div></div>
          <Button className="w-full sm:w-auto" onClick={() => toast.success("Паролата е сменена")}>Запази</Button>
        </div>
        <div className="card-soft space-y-4 p-4 sm:p-6">
          <h2 className="text-xl font-semibold">Известия</h2>
          {["Нови съобщения по имейл", "Нови запитвания по имейл", "Новини и сезонни предложения"].map((l, i) => (
            <label key={l} className="grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-4"><span>{l}</span><Switch defaultChecked={i < 2} /></label>
          ))}
        </div>
        <div className="card-soft border-destructive/30 p-4 sm:p-6">
          <h2 className="text-xl font-semibold">Изтриване на профила</h2>
          <p className="mt-1 text-muted-foreground">Това действие е необратимо.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive" className="mt-4">Изтрий профила</Button></AlertDialogTrigger>
            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Сигурни ли сте?</AlertDialogTitle><AlertDialogDescription>Всички ваши данни ще бъдат изтрити завинаги.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Отказ</AlertDialogCancel><AlertDialogAction onClick={() => toast("Заявката е изпратена")}>Изтрий</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
}
