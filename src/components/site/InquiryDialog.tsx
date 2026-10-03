import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function InquiryDialog({ to, product, children }: { to: string; product?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(`Здравейте, интересувам се от ${product ? `„${product}“` : "вашите продукти"}. Бихте ли ми казали...`);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl sm:w-full">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-forest">Изпрати запитване</DialogTitle>
          <DialogDescription>До {to}. Производителят обикновено отговаря до няколко часа.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim().length < 10) { toast.error("Моля, напишете малко повече в съобщението."); return; }
            setOpen(false);
            toast.success("Запитването е изпратено!", { description: `${to} ще ви отговори скоро.` });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="iq-name">Име</Label><Input id="iq-name" required placeholder="Вашето име" /></div>
            <div className="space-y-1.5"><Label htmlFor="iq-phone">Телефон</Label><Input id="iq-phone" placeholder="+359 ..." /></div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="iq-msg">Съобщение</Label>
            <Textarea id="iq-msg" rows={5} value={text} onChange={(e) => setText(e.target.value)} />
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
