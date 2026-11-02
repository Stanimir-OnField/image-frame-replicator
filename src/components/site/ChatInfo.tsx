import { useEffect, useRef, useState } from "react";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AttachmentPreview } from "./AttachmentPreview";
import { conversationAttachments } from "@/lib/api";
import { formatFileSize } from "@/lib/chat-attachments";
import type { Conversation, MessageAttachment } from "@/lib/types";

type Page = { items: MessageAttachment[]; hasMore: boolean; cursor: string | null };

export function ChatInfo({
  conversation,
  revision = 0,
  onClose,
  savingId,
  onDownload,
}: {
  conversation: Conversation;
  revision?: number;
  onClose: () => void;
  savingId: string | null;
  onDownload: (file: MessageAttachment) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<Page | null>(null);
  const [imagesExpanded, setImagesExpanded] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [files, setFiles] = useState<Page | null>(null);
  const [filesExpanded, setFilesExpanded] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const loading = useRef<"image" | "file" | null>(null);
  const [gallery, setGallery] = useState<{ kind: "image" | "file"; index: number } | null>(null);

  useEffect(() => {
    setGallery(null);
    let cancelled = false;
    const load = (kind: "image" | "file") =>
      conversationAttachments(conversation.id, kind)
        .then((page) => {
          if (cancelled) return;
          const next = toPage(page);
          if (kind === "image") setImages(next);
          else setFiles(next);
        })
        .catch(() => {
          if (cancelled) return;
          const empty = { items: [], hasMore: false, cursor: null };
          if (kind === "image") setImages(empty);
          else setFiles(empty);
          toast.error(kind === "image" ? "Снимките не се заредиха." : "Файловете не се заредиха.");
        });
    void load("image");
    void load("file");
    return () => {
      cancelled = true;
    };
  }, [conversation.id, revision]);

  async function loadMore(kind: "image" | "file") {
    const page = kind === "image" ? images : files;
    if (!page?.cursor || !page.hasMore || loading.current) return 0;
    loading.current = kind;
    if (kind === "image") setImagesLoading(true);
    else setFilesLoading(true);
    try {
      const next = toPage(await conversationAttachments(conversation.id, kind, page.cursor));
      const merged = mergePages(page, next);
      if (kind === "image") setImages(merged);
      else setFiles(merged);
      return merged.items.length - page.items.length;
    } catch {
      toast.error(kind === "image" ? "Снимките не се заредиха." : "Файловете не се заредиха.");
      return 0;
    } finally {
      loading.current = null;
      if (kind === "image") setImagesLoading(false);
      else setFilesLoading(false);
    }
  }

  function openGallery(kind: "image" | "file", file: MessageAttachment) {
    const items = (kind === "image" ? images : files)?.items ?? [];
    const index = items.findIndex((item) => item.id === file.id);
    setGallery({ kind, index: Math.max(0, index) });
  }

  async function stepGallery(delta: -1 | 1) {
    if (!gallery) return;
    const page = gallery.kind === "image" ? images : files;
    if (!page) return;
    const next = gallery.index + delta;
    if (next < 0) return;
    if (next >= page.items.length) {
      if (delta !== 1 || !page.hasMore) return;
      const added = await loadMore(gallery.kind);
      if (added > 0) setGallery({ kind: gallery.kind, index: page.items.length });
      return;
    }
    setGallery({ kind: gallery.kind, index: next });
  }

  const galleryPage = gallery?.kind === "image" ? images : gallery?.kind === "file" ? files : null;
  const galleryFile = gallery && galleryPage ? (galleryPage.items[gallery.index] ?? null) : null;

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const kind = entry.target.getAttribute("data-sentinel");
          if (kind === "image" || kind === "file") void loadMore(kind);
        }
      },
      { root, rootMargin: "240px" },
    );
    root.querySelectorAll<HTMLElement>("[data-sentinel]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [images, imagesExpanded, files, filesExpanded]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border px-2 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-11 shrink-0"
          onClick={onClose}
          aria-label="Назад"
        >
          <ArrowLeft />
        </Button>
        <p className="font-semibold text-forest">Информация</p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col items-center px-4 py-6 text-center">
          {conversation.avatar ? (
            <img src={conversation.avatar} alt="" className="size-24 rounded-full object-cover" />
          ) : (
            <span className="grid size-24 place-items-center rounded-full bg-sun text-3xl font-semibold text-sun-foreground">
              {conversation.with[0]}
            </span>
          )}
          <h2 className="mt-3 text-xl font-semibold text-forest">{conversation.with}</h2>
          {conversation.productName && (
            <p className="mt-1 text-sm text-muted-foreground">
              Относно: {conversation.productName}
            </p>
          )}
          {conversation.productImage && (
            <img
              src={conversation.productImage}
              alt=""
              className="mt-3 size-16 rounded-xl object-cover"
            />
          )}
        </div>
        <section className="border-t border-border px-4 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-forest">Медия</h3>
            {images?.hasMore && !imagesExpanded && (
              <button
                type="button"
                className="cursor-pointer text-sm font-medium text-primary"
                onClick={() => setImagesExpanded(true)}
              >
                Виж всички
              </button>
            )}
          </div>
          {images === null ? (
            <Loader2
              className="size-5 animate-spin text-muted-foreground"
              aria-label="Зареждане на снимки"
            />
          ) : images.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Няма изпратени снимки.</p>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {(imagesExpanded ? images.items : images.items.slice(0, 6)).map((file) => (
                <button
                  key={file.id}
                  type="button"
                  className="aspect-square cursor-pointer overflow-hidden rounded-md bg-cream"
                  aria-label={`Преглед на ${file.filename}`}
                  onClick={() => openGallery("image", file)}
                >
                  <img src={file.url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {imagesExpanded && (
            <ListStatus loading={imagesLoading} hasMore={Boolean(images?.hasMore)} kind="image" />
          )}
        </section>
        <section className="border-t border-border px-4 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-forest">Файлове</h3>
            {files?.hasMore && !filesExpanded && (
              <button
                type="button"
                className="cursor-pointer text-sm font-medium text-primary"
                onClick={() => setFilesExpanded(true)}
              >
                Виж всички
              </button>
            )}
          </div>
          {files === null ? (
            <Loader2
              className="size-5 animate-spin text-muted-foreground"
              aria-label="Зареждане на файлове"
            />
          ) : files.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Няма изпратени файлове.</p>
          ) : (
            <ul className="space-y-2">
              {(filesExpanded ? files.items : files.items.slice(0, 6)).map((file) => (
                <li key={file.id}>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-2 rounded-xl bg-cream px-3 py-2 text-left text-sm"
                    onClick={() => openGallery("file", file)}
                  >
                    <FileText className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 break-all">{file.filename}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatFileSize(file.byteSize)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {filesExpanded && (
            <ListStatus loading={filesLoading} hasMore={Boolean(files?.hasMore)} kind="file" />
          )}
        </section>
      </div>
      <AttachmentPreview
        file={galleryFile}
        saving={savingId === galleryFile?.id}
        onClose={() => setGallery(null)}
        onDownload={onDownload}
        hasPrevious={Boolean(gallery && gallery.index > 0)}
        hasNext={Boolean(
          galleryPage &&
          gallery &&
          (gallery.index < galleryPage.items.length - 1 || galleryPage.hasMore),
        )}
        onStep={(delta) => void stepGallery(delta)}
      />
    </div>
  );
}

function ListStatus({
  loading,
  hasMore,
  kind,
}: {
  loading: boolean;
  hasMore: boolean;
  kind: "image" | "file";
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-3">
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Зареждане" />
      </div>
    );
  }
  if (!hasMore) return null;
  return <div data-sentinel={kind} className="h-8" />;
}

function toPage(page: { attachments: MessageAttachment[]; hasMore: boolean }): Page {
  return {
    items: page.attachments,
    hasMore: page.hasMore && page.attachments.length > 0,
    cursor: page.attachments.at(-1)?.id ?? null,
  };
}

function mergePages(current: Page, next: Page): Page {
  const known = new Set(current.items.map((file) => file.id));
  return {
    items: [...current.items, ...next.items.filter((file) => !known.has(file.id))],
    hasMore: next.hasMore,
    cursor: next.cursor ?? current.cursor,
  };
}
