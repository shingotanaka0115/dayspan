const WIKILINK_PATTERN = /^\[\[([^|\]]+)(?:\|[^\]]*)?\]\]$/;

export function formatSourceReference(sourcePath: string): string {
  const path = sourcePath.trim();
  return path ? `[[${path}]]` : "";
}

export function parseSourceReference(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const reference = value.trim();
  if (!reference) return undefined;

  const wikilink = WIKILINK_PATTERN.exec(reference);
  return wikilink?.[1]?.trim() || reference;
}

export function isLinkedSourceReference(value: unknown): boolean {
  return typeof value === "string" && WIKILINK_PATTERN.test(value.trim());
}
