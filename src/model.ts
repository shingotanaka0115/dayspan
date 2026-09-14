import { parseYaml, stringifyYaml, TFile } from "obsidian";
import {
  DEFAULT_DISPLAY_MODE,
  DayspanDisplayMode,
  normalizeDisplayMode,
  parseDateKey,
} from "./date-utils";

export interface DayspanRecord {
  file: TFile;
  title: string;
  date: string;
  displayMode: DayspanDisplayMode;
  excerpt: string;
  sourcePath?: string;
  sourceLine?: number;
  created: string;
}

export interface DayspanDraft {
  title: string;
  date: string;
  displayMode?: DayspanDisplayMode;
  excerpt: string;
  sourcePath?: string;
  sourceLine?: number;
  created?: string;
}

export function serializeRecord(draft: DayspanDraft): string {
  const frontmatter: Record<string, string | number> = {
    type: "dayspan",
    title: draft.title.trim(),
    date: draft.date,
    display: draft.displayMode ?? DEFAULT_DISPLAY_MODE,
    created: draft.created ?? new Date().toISOString(),
  };

  if (draft.sourcePath) frontmatter.source = draft.sourcePath;
  if (typeof draft.sourceLine === "number") frontmatter.sourceLine = draft.sourceLine;

  const yaml = stringifyYaml(frontmatter).replace(/\s+$/, "");
  const body = draft.excerpt.trim();
  return `---\n${yaml}\n---\n${body ? `\n${body}\n` : ""}`;
}

export function parseRecord(file: TFile, content: string): DayspanRecord | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(content);
  if (!match || match[1] === undefined || match[2] === undefined) return null;

  let data: Record<string, unknown>;
  try {
    data = parseYaml(match[1]) as Record<string, unknown>;
  } catch {
    return null;
  }

  if (data.type !== "dayspan") return null;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const date =
    data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : typeof data.date === "string"
        ? data.date
        : "";
  if (!title || !parseDateKey(date)) return null;

  const sourceLine = Number(data.sourceLine);
  return {
    file,
    title,
    date,
    displayMode: normalizeDisplayMode(data.display),
    excerpt: match[2].trim(),
    sourcePath: typeof data.source === "string" ? data.source : undefined,
    sourceLine: Number.isInteger(sourceLine) && sourceLine > 0 ? sourceLine : undefined,
    created: typeof data.created === "string" ? data.created : "",
  };
}

export function makeTitleFromSelection(
  selection: string,
  fallback = "新しい記録"
): string {
  const firstLine = selection
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) ?? fallback;

  const plain = firstLine
    .replace(/^#{1,6}\s+/, "")
    .replace(/^[-*+>]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .replace(/!?(\[([^\]]+)\])\([^)]*\)/g, "$2")
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target: string, alias?: string) => alias ?? target)
    .replace(/[*_~`=]/g, "")
    .trim();

  return plain.length > 48 ? `${plain.slice(0, 47)}…` : plain || fallback;
}

export function sanitizeFileName(title: string, fallback = "記録"): string {
  const sanitized = title
    .replace(/[\\/:*?"<>|#^]/g, " ")
    .replaceAll("[", " ")
    .replaceAll("]", " ")
    .replace(/\s+/g, " ")
    .replace(/^\.+|\.+$/g, "")
    .trim();
  return (sanitized || fallback).slice(0, 60);
}
