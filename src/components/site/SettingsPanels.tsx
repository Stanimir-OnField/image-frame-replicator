import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deleteAccount, meQuery, updateNotifications, updatePassword, useAuthToken } from "@/lib/api";

const notices = [
  { key: "notifyMessages", label: "Нови съобщения по имейл" },
  { key: "notifyNews", label: "Новини и сезонни предложения" },
] as const;

export function SettingsPanels() {
  const token = useAuthToken();
  const me = useQuery({ ...meQuery(), enabled: !!token });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = me.data;

  return (
    <div className="space-y-6">
      <form className="card-soft space-y-4 p-4 sm:p-6" onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
          await updatePassword(String(data.get("current")), String(data.get("next")));
          toast.success("Паролата е сменена");
          event.currentTarget.reset();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Паролата не е сменена");
        }
      }}>
        <h2 className="text-xl font-semibold">Смяна на парола</h2>
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="p1">Текуща парола</Label><Input id="p1" name="current" type="password" required /></div><div className="space-y-1.5"><Label htmlFor="p2">Нова парола</Label><Input id="p2" name="next" type="password" required minLength={8} /></div></div>
        <Button type="submit" className="w-full sm:w-auto">Запази</Button>
      </form>
      <div className="card-soft space-y-4 p-4 sm:p-6">
        <h2 className="text-xl font-semibold">Известия</h2>
        {notices.map((notice) => (
          <label key={notice.key} className="grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <span>{notice.label}</span>
            <Switch checked={user?.[notice.key] ?? false} disabled={!user} onCheckedChange={async (checked) => {
              try {
                const next = await updateNotifications({ [notice.key]: checked });
                queryClient.setQueryData(["me"], next);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Настройката не е запазена");
              }
            }} />
          </label>
        ))}
      </div>
      <div className="card-soft border-destructive/30 p-4 sm:p-6">
        <h2 className="text-xl font-semibold">Изтриване на профила</h2>
        <p className="mt-1 text-muted-foreground">Това действие е необратимо.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="destructive" className="mt-4">Изтрий профила</Button></AlertDialogTrigger>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Сигурни ли сте?</AlertDialogTitle><AlertDialogDescription>Всички ваши данни ще бъдат изтрити завинаги.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Отказ</AlertDialogCancel><AlertDialogAction onClick={async () => {
              try {
                await deleteAccount();
                queryClient.clear();
                toast("Профилът е изтрит");
                await navigate({ to: "/" });
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Профилът не е изтрит");
              }
            }}>Изтрий</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
