import { useEffect, useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const GROUPS = [
  {
    id: "faces",
    label: "Усмивки",
    icon: "😊",
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "😂",
      "🤣",
      "🙂",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "😙",
      "😋",
      "😛",
      "😜",
      "🤪",
      "😝",
      "🤗",
      "🤭",
      "🤫",
      "🤔",
      "😐",
      "😑",
      "😏",
      "😒",
      "🙄",
      "😬",
      "😌",
      "😔",
      "😪",
      "🤤",
      "😴",
      "😷",
      "🤒",
      "😎",
      "🤓",
      "🥳",
      "😕",
      "😮",
      "😲",
      "😳",
      "🥺",
      "😢",
      "😭",
      "😱",
      "😤",
      "😡",
      "🤯",
    ],
  },
  {
    id: "hands",
    label: "Жестове",
    icon: "👍",
    emojis: [
      "👍",
      "👎",
      "👌",
      "✌️",
      "🤞",
      "🤟",
      "🤘",
      "👏",
      "🙌",
      "👐",
      "🤲",
      "🤝",
      "🙏",
      "👋",
      "💪",
      "✊",
      "👊",
      "👈",
      "👉",
      "👆",
      "👇",
      "☝️",
      "✋",
      "🖐️",
      "🖖",
    ],
  },
  {
    id: "hearts",
    label: "Сърца",
    icon: "❤️",
    emojis: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "♥️",
    ],
  },
  {
    id: "food",
    label: "Храна",
    icon: "🍅",
    emojis: [
      "🍅",
      "🥒",
      "🥕",
      "🌽",
      "🥦",
      "🥬",
      "🧄",
      "🧅",
      "🥔",
      "🍆",
      "🥑",
      "🍎",
      "🍐",
      "🍊",
      "🍋",
      "🍌",
      "🍉",
      "🍇",
      "🍓",
      "🍒",
      "🍑",
      "🍯",
      "🧀",
      "🥚",
      "🍞",
      "🥖",
      "🥛",
      "☕",
      "🍷",
      "🥗",
    ],
  },
  {
    id: "nature",
    label: "Природа",
    icon: "🌻",
    emojis: [
      "🌻",
      "🌼",
      "🌷",
      "🌹",
      "🌱",
      "🌿",
      "🍀",
      "🌳",
      "🌲",
      "🌾",
      "☀️",
      "🌤️",
      "⛅",
      "🌧️",
      "🌈",
      "⭐",
      "✨",
      "🔥",
      "💧",
      "🐝",
      "🐔",
      "🐄",
      "🐑",
      "🐐",
      "🐖",
    ],
  },
  {
    id: "marks",
    label: "Символи",
    icon: "✅",
    emojis: [
      "✅",
      "❌",
      "⭐",
      "💯",
      "🎉",
      "🎁",
      "📦",
      "🛒",
      "📍",
      "📞",
      "✉️",
      "💬",
      "🕒",
      "📅",
      "💰",
      "🔔",
      "❓",
      "❗",
      "♻️",
      "🟢",
      "🟡",
      "🔴",
    ],
  },
] as const;

function useWideScreen() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const apply = () => setWide(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  return wide;
}

function EmojiGrid({ dense, onPick }: { dense?: boolean; onPick: (emoji: string) => void }) {
  const [group, setGroup] = useState<(typeof GROUPS)[number]["id"]>("faces");
  const current = GROUPS.find((item) => item.id === group) ?? GROUPS[0];

  return (
    <>
      <div
        className={cn(
          "flex gap-1 overflow-x-auto [scrollbar-width:none]",
          dense ? "mb-2" : "px-2 pt-2",
        )}
        role="tablist"
        aria-label="Групи емоджи"
      >
        {GROUPS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === current.id}
            aria-label={item.label}
            className={cn(
              "grid shrink-0 cursor-pointer place-items-center rounded-xl hover:bg-cream",
              dense ? "size-8 text-base" : "size-11 text-xl",
              item.id === current.id && "bg-cream",
            )}
            onClick={() => setGroup(item.id)}
          >
            {item.icon}
          </button>
        ))}
      </div>
      <div
        className={cn(
          "grid overflow-y-auto",
          dense
            ? "max-h-52 grid-cols-8 gap-0.5"
            : "max-h-[34dvh] grid-cols-6 gap-0.5 px-1.5 pb-2 min-[380px]:grid-cols-7 min-[460px]:grid-cols-8",
        )}
        role="tabpanel"
        aria-label={current.label}
      >
        {current.emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={cn(
              "grid cursor-pointer place-items-center rounded-xl hover:bg-cream",
              dense ? "size-8 text-lg" : "size-11 text-2xl",
            )}
            aria-label={emoji}
            onClick={() => onPick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}

export function MobileEmojiPanel({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <div className="border-t border-border bg-background pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
      <EmojiGrid onPick={onPick} />
    </div>
  );
}

export function EmojiKeyboard({
  open,
  onOpenChange,
  onPick,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (emoji: string) => void;
  className?: string;
}) {
  const wide = useWideScreen();
  const button = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Емоджи"
      aria-expanded={open}
      className={cn("size-8 shrink-0 p-0 lg:size-7", className)}
      onClick={(event) => {
        if (wide) return;
        event.preventDefault();
        onOpenChange(!open);
      }}
    >
      <Smile />
    </Button>
  );

  if (!wide) return button;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{button}</PopoverTrigger>
      <PopoverContent align="start" side="top" className="w-[22rem] p-2">
        <EmojiGrid dense onPick={onPick} />
      </PopoverContent>
    </Popover>
  );
}
