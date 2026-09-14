export type DayspanSectionKind = "future" | "today" | "past";

export const DEFAULT_SECTION_ORDER: DayspanSectionKind[] = ["future", "today", "past"];

const SECTION_KINDS = new Set<DayspanSectionKind>(DEFAULT_SECTION_ORDER);

export function normalizeCollapsedSections(value: unknown): DayspanSectionKind[] {
  if (!Array.isArray(value)) return [];

  const normalized: DayspanSectionKind[] = [];
  for (const item of value) {
    if (typeof item === "string" && SECTION_KINDS.has(item as DayspanSectionKind)) {
      const kind = item as DayspanSectionKind;
      if (!normalized.includes(kind)) normalized.push(kind);
    }
  }
  return normalized;
}

export function normalizeSectionOrder(value: unknown): DayspanSectionKind[] {
  const normalized: DayspanSectionKind[] = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "string" && SECTION_KINDS.has(item as DayspanSectionKind)) {
        const kind = item as DayspanSectionKind;
        if (!normalized.includes(kind)) normalized.push(kind);
      }
    }
  }

  for (const kind of DEFAULT_SECTION_ORDER) {
    if (!normalized.includes(kind)) normalized.push(kind);
  }

  return normalized;
}
