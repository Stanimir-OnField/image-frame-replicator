import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import {
  ArrowLeft,
  Check,
  Download,
  FileText,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  conversationsQuery,
  deleteMessage,
  olderMessages,
  sendMessage,
  updateMessage,
} from "@/lib/api";
import { chatDayLabel, messageClock, sameChatDay } from "@/lib/format";
import {
  addChatFiles,
  CHAT_FILE_ACCEPT,
  chatFileKind,
  downloadAttachment,
  formatFileSize,
  MAX_CHAT_TEXT,
  messagePreview,
} from "@/lib/chat-attachments";
import { clearOpenUnread } from "@/lib/inbox";
import type { Conversation, Message, MessageAttachment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AttachmentPreview } from "./AttachmentPreview";
import { ChatInfo } from "./ChatInfo";
import { EmptyState } from "./bits";
import { EmojiKeyboard, MobileEmojiPanel } from "./EmojiKeyboard";

export function Messenger({
  scope,
  conversationId,
}: {
  scope: "customer" | "producer";
  conversationId?: string;
}) {
  const queryClient = useQueryClient();
  const q = useQuery(conversationsQuery(scope));
  const [activeId, setActiveId] = useState<string | null>(conversationId ?? null);
  const [text, setText] = useState("");
  const [pending, setPending] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ file: File; url: string | null }[]>([]);
  const [sending, setSending] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [preview, setPreview] = useState<MessageAttachment | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Message | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [mediaRevision, setMediaRevision] = useState(0);
  const threadRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const restoreScroll = useRef<number | null>(null);
  const selectionRef = useRef({ start: 0, end: 0 });

  useEffect(() => {
    setActiveId(conversationId ?? null);
  }, [conversationId]);

  useEffect(() => {
    setPreview(null);
    setInfoOpen(false);
    setEditing(null);
    setDeleteTarget(null);
  }, [activeId]);

  useEffect(() => {
    const next = pending.map((file) => ({
      file,
      url: chatFileKind(file) === "image" ? URL.createObjectURL(file) : null,
    }));
    setPreviews(next);
    return () => {
      next.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
  }, [pending]);

  const activeThread = q.data?.find((conversation) => conversation.id === activeId);
  const newestId = activeThread?.messages.at(-1)?.id ?? null;
  const loadedCount = activeThread?.messages.length ?? 0;

  useEffect(() => {
    const current = q.data?.find((conversation) => conversation.id === conversationId);
    if (!current?.unread || !conversationId) return;
    clearOpenUnread(queryClient, conversationId);
  }, [conversationId, q.data, queryClient]);

  useLayoutEffect(() => {
    const thread = threadRef.current;
    if (!thread || restoreScroll.current == null) return;
    thread.scrollTop = thread.scrollHeight - restoreScroll.current;
    restoreScroll.current = null;
  }, [loadedCount, activeId]);

  useEffect(() => {
    if (restoreScroll.current != null) return;
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [activeId, newestId, emojiOpen, previews.length]);

  useEffect(() => {
    const shell = shellRef.current;
    const viewport = window.visualViewport;
    if (!activeId || !shell || !viewport) return;
    const query = window.matchMedia("(max-width: 1023px)");
    const previousOverflow = document.body.style.overflow;
    const sync = () => {
      if (!query.matches) {
        shell.style.bottom = "";
        document.body.style.overflow = previousOverflow;
        return;
      }
      document.body.style.overflow = "hidden";
      const overlap = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      shell.style.bottom = `${overlap}px`;
    };
    sync();
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);
    query.addEventListener("change", sync);
    return () => {
      shell.style.bottom = "";
      document.body.style.overflow = previousOverflow;
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
      query.removeEventListener("change", sync);
    };
  }, [activeId]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "44px";
    if ((input.selectionStart ?? input.value.length) === input.value.length) {
      input.scrollTop = input.scrollHeight;
    }
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [text, activeId]);

  if (q.isLoading)
    return <Skeleton className="h-[calc(100dvh-15rem)] min-h-[22rem] rounded-2xl lg:h-[600px]" />;
  const convs = q.data ?? [];
  if (q.isError)
    return (
      <EmptyState
        icon={<MessageCircle />}
        title="Съобщенията не се заредиха"
        text="Опитай отново след малко."
      />
    );
  if (!convs.length)
    return (
      <EmptyState
        icon={<MessageCircle />}
        title="Няма съобщения"
        text="Когато някой ти пише, разговорът ще се появи тук."
      />
    );
  const active = convs.find((c) => c.id === activeId);
  const hintId = active ? `chat-limits-${active.id}` : undefined;

  async function loadOlder() {
    if (!active?.hasOlderMessages || loadingOlder || active.messages.length === 0) return;
    const thread = threadRef.current;
    restoreScroll.current = (thread?.scrollHeight ?? 0) - (thread?.scrollTop ?? 0);
    setLoadingOlder(true);
    try {
      const page = await olderMessages(active.id, active.messages[0].id);
      queryClient.setQueryData<Conversation[]>(["conversations", scope], (current) =>
        current?.map((conversation) => {
          if (conversation.id !== active.id) return conversation;
          const known = new Set(conversation.messages.map((message) => message.id));
          const older = page.messages.filter((message) => !known.has(message.id));
          return {
            ...conversation,
            hasOlderMessages: page.hasOlderMessages,
            messages: [...older, ...conversation.messages],
          };
        }),
      );
    } catch (error) {
      restoreScroll.current = null;
      toast.error(error instanceof Error ? error.message : "По-старите съобщения не се заредиха");
    } finally {
      setLoadingOlder(false);
    }
  }

  async function saveAttachment(file: MessageAttachment) {
    if (savingId) return;
    setSavingId(file.id);
    try {
      await downloadAttachment(file);
    } catch {
      toast.error("Файлът не можа да се изтегли.");
    } finally {
      setSavingId(null);
    }
  }

  function addFiles(list: FileList | File[] | null) {
    if (editing || !list?.length) return;
    const result = addChatFiles(pending, Array.from(list));
    setPending(result.files);
    if (result.error) toast.error(result.error);
  }

  function hasFiles(event: DragEvent) {
    return Array.from(event.dataTransfer.types).includes("Files");
  }

  function rememberSelection(input: HTMLTextAreaElement) {
    selectionRef.current = {
      start: input.selectionStart ?? text.length,
      end: input.selectionEnd ?? text.length,
    };
  }

  function insertEmoji(emoji: string) {
    const input = inputRef.current;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const start = coarse ? selectionRef.current.start : (input?.selectionStart ?? text.length);
    const end = coarse ? selectionRef.current.end : (input?.selectionEnd ?? text.length);
    const next = text.slice(0, start) + emoji + text.slice(end);
    if (next.length > MAX_CHAT_TEXT) {
      toast.error("Съобщението е твърде дълго.");
      return;
    }
    const cursor = start + emoji.length;
    selectionRef.current = { start: cursor, end: cursor };
    setText(next);
    if (coarse) return;
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(cursor, cursor);
    });
  }

  function storeMessage(conversationId: string, message: Message) {
    for (const itemScope of ["customer", "producer"] as const) {
      queryClient.setQueryData<Conversation[]>(["conversations", itemScope], (current) =>
        current?.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: conversation.messages.map((item) =>
                  item.id === message.id ? message : item,
                ),
              }
            : conversation,
        ),
      );
    }
  }

  function startEdit(message: Message) {
    if (message.attachments?.length) return;
    setEditing(message);
    setText(message.text);
    setPending([]);
    setEmojiOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function cancelEdit() {
    setEditing(null);
    setText("");
  }

  async function confirmDelete() {
    if (!active || !deleteTarget || sending) return;
    const target = deleteTarget;
    setSending(true);
    try {
      const updated = await deleteMessage(active.id, target.id);
      storeMessage(active.id, updated);
      if (editing?.id === target.id) cancelEdit();
      if (preview && (target.attachments ?? []).some((file) => file.id === preview.id)) {
        setPreview(null);
      }
      setMediaRevision((current) => current + 1);
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Съобщението не е изтрито");
    } finally {
      setSending(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!active || sending) return;
    const body = text.trim();
    if (body.length > MAX_CHAT_TEXT) {
      toast.error("Съобщението е твърде дълго.");
      return;
    }
    if (editing) {
      if (!body || editing.attachments?.length) return;
      setSending(true);
      try {
        const updated = await updateMessage(active.id, editing.id, body);
        storeMessage(active.id, updated);
        setEditing(null);
        setText("");
        setEmojiOpen(false);
        await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Съобщението не е запазено");
      } finally {
        setSending(false);
      }
      return;
    }
    if (!body && pending.length === 0) return;
    const files = pending;
    setSending(true);
    setText("");
    setPending([]);
    setEmojiOpen(false);
    try {
      await sendMessage(active.id, { body, files });
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (error) {
      setText(body);
      setPending(files);
      toast.error(error instanceof Error ? error.message : "Съобщението не е изпратено");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      ref={shellRef}
      className={cn(
        "card-soft grid min-h-0 overflow-hidden",
        active
          ? "max-lg:fixed max-lg:inset-x-0 max-lg:top-16 max-lg:bottom-0 max-lg:z-30 max-lg:h-auto max-lg:grid-rows-[minmax(0,1fr)] max-lg:rounded-none max-lg:border-x-0 lg:h-[600px] lg:grid-cols-[300px_1fr]"
          : "h-[calc(100dvh-15rem)] min-h-[22rem] lg:h-[600px] lg:grid-cols-[300px_1fr]",
      )}
    >
      <ul
        className={cn(
          "overflow-y-auto overscroll-contain border-r border-border",
          active && "hidden lg:block",
        )}
      >
        {convs.map((c) => {
          const last = c.messages.at(-1);
          return (
            <li key={c.id}>
              <button
                onClick={() => {
                  setActiveId(c.id);
                  setPending([]);
                  setText("");
                  setEditing(null);
                  setEmojiOpen(false);
                  if (c.unread) clearOpenUnread(queryClient, c.id);
                }}
                className={cn(
                  "flex min-h-16 w-full cursor-pointer items-center gap-3 px-3 py-3 text-left transition hover:bg-cream sm:min-h-20 sm:p-4",
                  c.id === activeId && "bg-cream",
                )}
              >
                {c.avatar ? (
                  <img
                    src={c.avatar}
                    alt=""
                    className="size-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sun font-semibold text-sun-foreground">
                    {c.with[0]}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <p
                      className={cn("truncate", c.unread ? "font-bold text-forest" : "font-medium")}
                    >
                      {c.with}
                    </p>
                    <span className="text-xs text-muted-foreground">{last?.time}</span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {last ? messagePreview(last) : ""}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {c.unread}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {active ? (
        <div
          className="relative flex min-h-0 flex-col"
          onDragEnter={(event) => {
            if (!hasFiles(event) || editing) return;
            event.preventDefault();
            dragDepth.current += 1;
            setDragging(true);
          }}
          onDragOver={(event) => {
            if (!hasFiles(event)) return;
            event.preventDefault();
          }}
          onDragLeave={(event) => {
            if (!hasFiles(event)) return;
            dragDepth.current -= 1;
            if (dragDepth.current <= 0) {
              dragDepth.current = 0;
              setDragging(false);
            }
          }}
          onDrop={(event) => {
            if (!hasFiles(event)) return;
            event.preventDefault();
            dragDepth.current = 0;
            setDragging(false);
            if (!editing) addFiles(event.dataTransfer.files);
          }}
        >
          {dragging && (
            <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-background/85 text-sm font-medium text-forest">
              Пусни файловете тук
            </div>
          )}
          <div className="flex items-center gap-2 border-b border-border px-2 py-2 sm:gap-3 sm:p-4">
            <Button
              variant="ghost"
              size="icon"
              className="size-11 shrink-0 lg:hidden"
              onClick={() => {
                setActiveId(null);
                setEmojiOpen(false);
              }}
              aria-label="Назад"
            >
              <ArrowLeft />
            </Button>
            <button
              type="button"
              className="min-w-0 flex-1 cursor-pointer rounded-xl px-1 py-1 text-left"
              aria-label={`Информация за ${active.with}`}
              onClick={() => setInfoOpen(true)}
            >
              <p className="truncate font-semibold text-forest">{active.with}</p>
              {active.productName && (
                <p className="truncate text-xs text-muted-foreground">
                  Относно: {active.productName}
                </p>
              )}
            </button>
            {active.productImage && (
              <img src={active.productImage} alt="" className="size-10 rounded-lg object-cover" />
            )}
          </div>
          <div
            ref={threadRef}
            className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-cream/50 p-3 sm:p-4"
          >
            {active.hasOlderMessages && (
              <div className="flex justify-center">
                {loadingOlder ? (
                  <Loader2
                    className="size-5 animate-spin text-muted-foreground"
                    aria-label="Зареждане на по-стари съобщения"
                  />
                ) : (
                  <button
                    type="button"
                    className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-background hover:text-forest"
                    onClick={() => void loadOlder()}
                  >
                    Покажи по-стари съобщения
                  </button>
                )}
              </div>
            )}
            {active.messages.map((m, index) => {
              const previous = active.messages[index - 1];
              const showDay = !previous || !sameChatDay(previous.createdAt, m.createdAt);
              return (
                <div key={m.id} className="space-y-3">
                  {showDay && (
                    <div className="flex items-center gap-3 py-1">
                      <span className="h-px flex-1 bg-border" aria-hidden />
                      <time
                        dateTime={m.createdAt}
                        className="shrink-0 text-xs font-medium text-muted-foreground"
                      >
                        {chatDayLabel(m.createdAt)}
                      </time>
                      <span className="h-px flex-1 bg-border" aria-hidden />
                    </div>
                  )}
                  <div className={cn("flex items-center gap-1", m.fromMe && "justify-end")}>
                    {m.fromMe && !m.deleted && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label="Действия със съобщението"
                            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-background"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!m.attachments?.length && (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onSelect={() => startEdit(m)}
                            >
                              Редактирай
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onSelect={() => setDeleteTarget(m)}
                          >
                            Изтрий
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 sm:max-w-[75%] sm:px-4 sm:py-2.5",
                        m.deleted
                          ? "border border-dashed border-border bg-background text-muted-foreground"
                          : m.fromMe
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-background shadow-sm",
                      )}
                    >
                      {m.deleted ? (
                        <p className="italic">Съобщението е изтрито</p>
                      ) : m.text ? (
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      ) : null}
                      {!m.deleted &&
                        (m.attachments ?? []).map((file) =>
                          file.kind === "image" ? (
                            <div key={file.id} className="mt-2">
                              <button
                                type="button"
                                onClick={() => setPreview(file)}
                                className="block min-h-11 min-w-11 cursor-pointer rounded-xl"
                                aria-label={`Преглед на ${file.filename}`}
                              >
                                <img
                                  src={file.url}
                                  alt=""
                                  className="h-auto max-h-52 max-w-full rounded-xl"
                                />
                              </button>
                            </div>
                          ) : (
                            <div
                              key={file.id}
                              className={cn(
                                "mt-2 flex items-center gap-1 rounded-xl",
                                m.fromMe ? "bg-primary-foreground/15" : "bg-cream",
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => setPreview(file)}
                                className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-2 px-2.5 py-2 text-left text-sm"
                                aria-label={`Преглед на ${file.filename}`}
                              >
                                <FileText className="size-4 shrink-0" />
                                <span className="min-w-0 flex-1 break-all leading-snug">
                                  {file.filename}
                                </span>
                                <span
                                  className={cn(
                                    "shrink-0 text-xs",
                                    m.fromMe
                                      ? "text-primary-foreground/70"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {formatFileSize(file.byteSize)}
                                </span>
                              </button>
                              <button
                                type="button"
                                aria-label={`Изтегли ${file.filename}`}
                                className="mr-1 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full"
                                disabled={savingId === file.id}
                                onClick={() => void saveAttachment(file)}
                              >
                                {savingId === file.id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Download className="size-4" />
                                )}
                              </button>
                            </div>
                          ),
                        )}
                      <time
                        dateTime={m.createdAt}
                        className={cn(
                          "mt-1 block text-right text-xs",
                          m.deleted || !m.fromMe
                            ? "text-muted-foreground"
                            : "text-primary-foreground/70",
                        )}
                      >
                        {messageClock(m.createdAt)}
                      </time>
                      {m.editedAt && !m.deleted && (
                        <p
                          className={cn(
                            "text-right text-[11px] italic",
                            m.fromMe ? "text-primary-foreground/70" : "text-muted-foreground",
                          )}
                        >
                          Редактирано
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="shrink-0 border-t border-border">
            {previews.length > 0 && (
              <ul className="flex gap-3 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
                {previews.map(({ file, url }) => (
                  <li
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="relative shrink-0"
                  >
                    {url ? (
                      <img src={url} alt="" className="size-16 rounded-xl object-cover" />
                    ) : (
                      <span className="flex h-16 max-w-36 items-center gap-1.5 rounded-xl bg-cream px-2.5 text-xs">
                        <FileText className="size-4 shrink-0" />
                        <span className="line-clamp-2 break-all leading-snug">{file.name}</span>
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label={`Премахни ${file.name}`}
                      className="absolute -right-2 -top-2 grid size-11 cursor-pointer place-items-center"
                      onClick={() =>
                        setPending((current) => current.filter((item) => item !== file))
                      }
                    >
                      <span className="grid size-6 place-items-center rounded-full bg-forest text-background">
                        <X className="size-3.5" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {editing && (
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <Pencil className="size-4 shrink-0 text-primary" />
                <p className="min-w-0 flex-1 truncate text-sm">
                  <span className="font-medium text-forest">Редактиране</span>
                  {editing.text ? (
                    <span className="text-muted-foreground"> · {editing.text}</span>
                  ) : null}
                </p>
                <button
                  type="button"
                  aria-label="Откажи редактирането"
                  className="grid size-8 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-cream"
                  onClick={cancelEdit}
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
            <form className="px-2 py-1.5 lg:px-3" onSubmit={(event) => void submit(event)}>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept={CHAT_FILE_ACCEPT}
                className="sr-only"
                aria-label="Избери файлове"
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
              <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
                <Textarea
                  ref={inputRef}
                  value={text}
                  rows={1}
                  maxLength={MAX_CHAT_TEXT}
                  enterKeyHint="send"
                  onChange={(event) => {
                    setText(event.target.value);
                    rememberSelection(event.target);
                  }}
                  onSelect={(event) => rememberSelection(event.currentTarget)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  onFocus={() => {
                    if (window.matchMedia("(max-width: 1023px)").matches) setEmojiOpen(false);
                  }}
                  placeholder="Съобщение..."
                  className="h-11 max-h-11 min-h-11! w-full resize-none overflow-y-auto rounded-none border-0 bg-transparent px-3 py-2.5 text-base shadow-none focus-visible:ring-0 lg:text-sm"
                  aria-label="Съобщение"
                  aria-describedby={hintId}
                  disabled={sending}
                />
                <div className="sticky bottom-0 z-10 flex items-center justify-between bg-background">
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Прикачи файл"
                      className="ml-2 size-8 shrink-0 p-0 lg:size-7"
                      disabled={sending || Boolean(editing)}
                      onClick={() => fileRef.current?.click()}
                    >
                      <Paperclip />
                    </Button>
                    <EmojiKeyboard
                      open={emojiOpen}
                      onOpenChange={setEmojiOpen}
                      onPick={insertEmoji}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="icon"
                    aria-label={editing ? "Запази" : "Изпрати"}
                    className="mb-2.5 mr-2 size-8 shrink-0 p-0 lg:size-7"
                    disabled={
                      sending || (editing ? !text.trim() : !text.trim() && pending.length === 0)
                    }
                  >
                    {editing ? <Check /> : <Send />}
                  </Button>
                </div>
              </div>
            </form>
            <p
              id={hintId}
              className={cn(
                "px-3 text-[11px] leading-snug text-muted-foreground sm:text-xs",
                emojiOpen ? "sr-only" : "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
              )}
            >
              <span className="block">Снимки до 5 MB — JPG, PNG, WEBP, GIF.</span>
              <span className="block">
                Файлове до 10 MB — PDF, DOC, DOCX, XLS, XLSX, TXT, CSV. До 5 файла.
              </span>
            </p>
            {emojiOpen && <MobileEmojiPanel onPick={insertEmoji} />}
          </div>
          {infoOpen && (
            <ChatInfo
              conversation={active}
              revision={mediaRevision}
              savingId={savingId}
              onClose={() => setInfoOpen(false)}
              onDownload={(file) => void saveAttachment(file)}
            />
          )}
        </div>
      ) : (
        <div className="hidden place-items-center text-muted-foreground lg:grid">
          Избери разговор
        </div>
      )}
      <AttachmentPreview
        file={preview}
        saving={savingId === preview?.id}
        onClose={() => setPreview(null)}
        onDownload={(file) => void saveAttachment(file)}
      />
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изтриване на съобщение</AlertDialogTitle>
            <AlertDialogDescription>
              Съобщението ще остане в разговора като изтрито.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Откажи</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>Изтрий</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
