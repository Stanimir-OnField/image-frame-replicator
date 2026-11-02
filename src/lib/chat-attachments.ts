import type { MessageAttachment } from "./types";

export const MAX_CHAT_ATTACHMENTS = 5;
export const MAX_CHAT_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_CHAT_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_CHAT_TEXT = 2000;

export const CHAT_ATTACHMENT_HINT =
  "Снимки до 5 MB (JPG, PNG, WEBP, GIF). Други файлове до 10 MB (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV). До 5 файла на съобщение.";

export const CHAT_FILE_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".pdf",
  ".txt",
  ".csv",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
].join(",");

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const FILE_EXTENSIONS = new Set(["pdf", "txt", "csv", "doc", "docx", "xls", "xlsx"]);
const IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const FILE_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/csv",
  "application/msword",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

function extensionOf(name: string) {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

export function chatFileKind(file: File): "image" | "file" | null {
  const extension = extensionOf(file.name);
  const type = file.type.toLowerCase();
  const untyped = type === "" || type === "application/octet-stream";
  if (IMAGE_EXTENSIONS.has(extension) && (untyped || IMAGE_TYPES.has(type))) return "image";
  if (!FILE_EXTENSIONS.has(extension)) return null;
  if (untyped) return "file";
  if ((extension === "csv" || extension === "txt") && type === "text/plain") return "file";
  if ((extension === "docx" || extension === "xlsx") && type === "application/zip") return "file";
  return FILE_TYPES.has(type) ? "file" : null;
}

export function chatFileError(file: File): string | null {
  const name = file.name || "файл";
  if (file.size <= 0) return `„${name}“ е празен.`;
  const kind = chatFileKind(file);
  if (!kind) return `„${name}“ е с непозволен формат.`;
  const limit = kind === "image" ? MAX_CHAT_IMAGE_BYTES : MAX_CHAT_FILE_BYTES;
  if (file.size > limit)
    return kind === "image" ? `Снимката „${name}“ е над 5 MB.` : `Файлът „${name}“ е над 10 MB.`;
  return null;
}

function sameFile(left: File, right: File) {
  return (
    left.name === right.name && left.size === right.size && left.lastModified === right.lastModified
  );
}

export function addChatFiles(
  current: File[],
  incoming: Iterable<File>,
): { files: File[]; error: string | null } {
  const files = [...current];
  let error: string | null = null;
  for (const file of incoming) {
    if (files.length >= MAX_CHAT_ATTACHMENTS) {
      error ??= `Можеш да прикачиш до ${MAX_CHAT_ATTACHMENTS} файла.`;
      break;
    }
    if (files.some((existing) => sameFile(existing, file))) continue;
    const problem = chatFileError(file);
    if (problem) {
      error ??= problem;
      continue;
    }
    files.push(file);
  }
  return { files, error };
}

export function messagePreview(message: {
  text: string;
  deleted?: boolean | undefined;
  attachments?: MessageAttachment[] | undefined;
}) {
  if (message.deleted) return "Съобщението е изтрито";
  const text = message.text.trim();
  if (text) return text;
  const attachments = message.attachments ?? [];
  if (!attachments.length) return "";
  if (attachments.every((file) => file.kind === "image"))
    return attachments.length === 1 ? "Снимка" : `${attachments.length} снимки`;
  const first = attachments[0];
  if (attachments.length === 1) return first?.filename ?? "Файл";
  return `${attachments.length} файла`;
}

export async function downloadAttachment(
  file: Pick<MessageAttachment, "url" | "downloadUrl" | "filename">,
) {
  const response = await fetch(file.downloadUrl || file.url);
  if (!response.ok) throw new Error("download failed");
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = file.filename || "file";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const megabytes = bytes / (1024 * 1024);
  const rounded =
    megabytes >= 10 ? Math.round(megabytes).toString() : megabytes.toFixed(1).replace(".", ",");
  return `${rounded} MB`;
}
