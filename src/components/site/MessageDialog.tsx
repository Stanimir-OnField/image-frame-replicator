import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { cloneElement, isValidElement, useEffect, useState, type MouseEvent, type ReactElement, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { meQuery, startConversation, useAuthToken } from "@/lib/api";

export function MessageDialog({ to, producerId, productId, product, children }: { to: string; producerId: string; productId?: string; product?: string; children: ReactNode }) {
  const token = useAuthToken();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const me = useQuery({ ...meQuery(), enabled: !!token });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [text, setText] = useState(`Здравейте, интересувам се от ${product ? `„${product}“` : "вашите продукти"}. Бихте ли ми казали...`);

  useEffect(() => {
    if (!me.data) return;
    setName((current) => current || me.data.name);
    setPhone((current) => current || me.data.phone);
  }, [me.data]);

  if (!token && isValidElement(children)) {
    return cloneElement(children as ReactElement<{ onClick?: (event: MouseEvent) => void }>, {
      onClick: (event: MouseEvent) => {
        event.preventDefault();
        toast.error("Влез, за да пишеш на производителя");
        void navigate({ to: "/login" });
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl sm:w-full">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-forest">Изпрати съобщение</DialogTitle>
          <DialogDescription>До {to}. Производителят обикновено отговаря до няколко часа.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (text.trim().length < 10) { toast.error("Моля, напишете малко повече в съобщението."); return; }
            try {
              const created = await startConversation({ producerId, productId, name, phone, body: text });
              setOpen(false);
              await queryClient.invalidateQueries({ queryKey: ["conversations"] });
              toast.success("Съобщението е изпратено!", { description: `${to} ще ви отговори в съобщенията.` });
              void navigate({ to: "/account/messages", search: { conversation: created.id } });
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Неуспешно изпращане");
            }
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="iq-name">Име</Label><Input id="iq-name" required placeholder="Вашето име" value={name} onChange={(event) => setName(event.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="iq-phone">Телефон</Label><Input id="iq-phone" placeholder="+359 ..." value={phone} onChange={(event) => setPhone(event.target.value)} /></div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="iq-msg">Съобщение</Label>
            <Textarea id="iq-msg" rows={5} value={text} onChange={(event) => setText(event.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Отказ</Button>
            <Button type="submit">Изпрати</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
