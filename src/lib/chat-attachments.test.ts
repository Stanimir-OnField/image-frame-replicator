import { describe, expect, it } from "vitest";
import {
  addChatFiles,
  MAX_CHAT_FILE_BYTES,
  MAX_CHAT_IMAGE_BYTES,
  messagePreview,
} from "./chat-attachments";

function file(name: string, type: string, size = 12) {
  return new File([new Uint8Array(size)], name, { type });
}

describe("chat attachments", () => {
  it("accepts images and documents and skips duplicates", () => {
    const photo = file("tomato.png", "image/png");
    const result = addChatFiles([], [photo, photo, file("order.pdf", "application/pdf")]);
    expect(result.error).toBeNull();
    expect(result.files.map((item) => item.name)).toEqual(["tomato.png", "order.pdf"]);
  });

  it("rejects the wrong format, empty files, and files over the limit", () => {
    expect(addChatFiles([], [file("page.html", "text/html")]).error).toMatch(/непозволен формат/);
    expect(addChatFiles([], [file("empty.png", "image/png", 0)]).error).toMatch(/празен/);
    expect(
      addChatFiles([], [file("big.png", "image/png", MAX_CHAT_IMAGE_BYTES + 1)]).error,
    ).toMatch(/5 MB/);
    expect(
      addChatFiles([], [file("big.pdf", "application/pdf", MAX_CHAT_FILE_BYTES + 1)]).error,
    ).toMatch(/10 MB/);
  });

  it("keeps at most five files", () => {
    const incoming = Array.from({ length: 6 }, (_, index) =>
      file(`note-${index}.txt`, "text/plain"),
    );
    const result = addChatFiles([], incoming);
    expect(result.files).toHaveLength(5);
    expect(result.error).toMatch(/5 файла/);
  });

  it("previews a deleted message before its old text", () => {
    expect(messagePreview({ text: "Скрий това", deleted: true, attachments: [] })).toBe(
      "Съобщението е изтрито",
    );
  });

  it("previews text, a photo, or a filename", () => {
    expect(messagePreview({ text: "Здравей", attachments: [] })).toBe("Здравей");
    expect(
      messagePreview({
        text: "  ",
        attachments: [
          {
            id: "1",
            filename: "a.png",
            contentType: "image/png",
            byteSize: 10,
            kind: "image",
            url: "http://example.test/a.png",
            downloadUrl: "http://example.test/a.png?download=1",
          },
        ],
      }),
    ).toBe("Снимка");
    expect(
      messagePreview({
        text: "",
        attachments: [
          {
            id: "2",
            filename: "order.pdf",
            contentType: "application/pdf",
            byteSize: 10,
            kind: "file",
            url: "http://example.test/order.pdf",
            downloadUrl: "http://example.test/order.pdf?download=1",
          },
        ],
      }),
    ).toBe("order.pdf");
  });
});
