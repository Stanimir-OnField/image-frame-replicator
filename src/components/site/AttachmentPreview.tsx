import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, FileText, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatFileSize } from "@/lib/chat-attachments";
import type { MessageAttachment } from "@/lib/types";
import { cn } from "@/lib/utils";

function previewKind(file: MessageAttachment) {
  if (file.kind === "image") return "image";
  const type = file.contentType.toLowerCase();
  const name = file.filename.toLowerCase();
  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    type.startsWith("text/") ||
    type === "application/csv" ||
    name.endsWith(".txt") ||
    name.endsWith(".csv")
  ) {
    return "text";
  }
  return "other";
}

export function AttachmentPreview({
  file,
  saving,
  onClose,
  onDownload,
  hasPrevious = false,
  hasNext = false,
  onStep,
}: {
  file: MessageAttachment | null;
  saving: boolean;
  onClose: () => void;
  onDownload: (file: MessageAttachment) => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onStep?: (delta: -1 | 1) => void;
}) {
  const [shown, setShown] = useState<MessageAttachment | null>(null);
  if (file && file !== shown) setShown(file);
  const current = file ?? shown;
  const kind = current ? previewKind(current) : null;
  const image = kind === "image";

  useEffect(() => {
    if (!file || !onStep) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && hasPrevious) onStep(-1);
      if (event.key === "ArrowRight" && hasNext) onStep(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [file, hasNext, hasPrevious, onStep]);
  return (
    <Dialog open={file !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideClose
        className={cn(
          image
            ? "inset-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-black p-0 text-white shadow-none sm:rounded-none"
            : "max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-3xl gap-3 overflow-y-auto p-4 pt-14 sm:p-6 sm:pt-14",
        )}
      >
        <DialogHeader className={cn("text-left", image ? "sr-only" : undefined)}>
          <DialogTitle className={image ? undefined : "truncate text-base"}>
            {current?.filename ?? "Файл"}
          </DialogTitle>
          <DialogDescription>{current ? formatFileSize(current.byteSize) : ""}</DialogDescription>
        </DialogHeader>
        {current && !image && (hasPrevious || hasNext) && (
          <div className="flex items-center justify-between">
            {hasPrevious ? (
              <StepButton direction="previous" onStep={onStep} />
            ) : (
              <span className="size-11" />
            )}
            {hasNext ? (
              <StepButton direction="next" onStep={onStep} />
            ) : (
              <span className="size-11" />
            )}
          </div>
        )}
        {current && (
          <div className="absolute top-3 right-3 z-10 flex items-center justify-end gap-1">
            <button
              type="button"
              aria-label={`Изтегли ${current.filename}`}
              disabled={saving}
              onClick={() => onDownload(current)}
              className={cn(
                "grid size-9 cursor-pointer place-items-center rounded-full disabled:opacity-50",
                image ? "text-white hover:bg-white/15" : "text-foreground hover:bg-accent",
              )}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
            </button>
            <DialogClose
              className={cn(
                "grid size-9 cursor-pointer place-items-center rounded-full",
                image ? "text-white hover:bg-white/15" : "text-foreground hover:bg-accent",
              )}
            >
              <X className="size-4" />
              <span className="sr-only">Затвори</span>
            </DialogClose>
          </div>
        )}
        {current && image && hasPrevious && (
          <StepButton direction="previous" image onStep={onStep} />
        )}
        {current && image && hasNext && <StepButton direction="next" image onStep={onStep} />}
        {current && kind === "image" && (
          <div
            className={cn(
              "absolute inset-0 overflow-hidden pt-14 pb-4",
              hasPrevious || hasNext ? "px-14" : "px-4",
            )}
          >
            <img
              src={current.url}
              alt={current.filename}
              className="h-full w-full object-contain"
            />
          </div>
        )}
        {current && kind === "pdf" && <PdfPreview url={current.url} title={current.filename} />}
        {current && kind === "text" && <TextPreview url={current.url} />}
        {current && kind === "other" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center text-sm text-muted-foreground">
            <FileText className="size-10" />
            <p>Този файл не може да се покаже в браузъра.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StepButton({
  direction,
  image = false,
  onStep,
}: {
  direction: "previous" | "next";
  image?: boolean;
  onStep?: (delta: -1 | 1) => void;
}) {
  const previous = direction === "previous";
  return (
    <button
      type="button"
      aria-label={previous ? "Предишна" : "Следваща"}
      onClick={() => onStep?.(previous ? -1 : 1)}
      className={cn(
        "grid size-11 cursor-pointer place-items-center rounded-full",
        image
          ? "absolute top-1/2 z-10 -translate-y-1/2 bg-black/45 text-white hover:bg-black/70"
          : "bg-accent text-foreground hover:bg-accent/80",
        image && (previous ? "left-3" : "right-3"),
      )}
    >
      {previous ? <ChevronLeft className="size-6" /> : <ChevronRight className="size-6" />}
    </button>
  );
}

function PdfPreview({ url, title }: { url: string; title: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    let objectUrl: string | null = null;
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("preview failed");
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch((error: unknown) => {
        if (cancelled || (error instanceof DOMException && error.name === "AbortError")) return;
        setFailed(true);
      });
    return () => {
      cancelled = true;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (failed) {
    return <p className="text-sm text-muted-foreground">Файлът не може да се покаже.</p>;
  }
  if (!src) return <p className="text-sm text-muted-foreground">Зареждане…</p>;
  return <iframe title={title} src={src} className="h-[70dvh] w-full rounded-lg bg-background" />;
}

function TextPreview({ url }: { url: string }) {
  const [body, setBody] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("preview failed");
        return response.text();
      })
      .then((text) => {
        if (cancelled) return;
        setBody(text.length > 20_000 ? `${text.slice(0, 20_000)}\n…` : text);
      })
      .catch((error: unknown) => {
        if (cancelled || (error instanceof DOMException && error.name === "AbortError")) return;
        setFailed(true);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url]);

  if (failed) {
    return <p className="text-sm text-muted-foreground">Файлът не може да се покаже.</p>;
  }
  if (body === null) return <p className="text-sm text-muted-foreground">Зареждане…</p>;
  return (
    <pre className="max-h-[70dvh] overflow-auto rounded-lg bg-cream p-3 text-sm break-words whitespace-pre-wrap">
      {body}
    </pre>
  );
}
