import { ItemView, Menu, setIcon, WorkspaceLeaf } from "obsidian";
import type DayspanPlugin from "../main";
import {
  differenceInCalendarDays,
  formatDateSpan,
  formatLocalizedDate,
} from "./date-utils";
import { durationUnit } from "./i18n";
import { DayspanRecord } from "./model";
import { DayspanSectionKind } from "./settings";

export const DAYSPAN_VIEW_TYPE = "dayspan-view";

interface CountedRecord {
  record: DayspanRecord;
  difference: number;
}

export class DayspanView extends ItemView {
  private refreshVersion = 0;
  private resizeObserver: ResizeObserver | null = null;

  constructor(leaf: WorkspaceLeaf, private plugin: DayspanPlugin) {
    super(leaf);
  }

  getViewType(): string {
    return DAYSPAN_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Dayspan";
  }

  getIcon(): string {
    return "calendar-range";
  }

  async onOpen(): Promise<void> {
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(([entry]) => {
      this.updateResponsiveState(entry?.contentRect.width ?? this.contentEl.clientWidth);
    });
    this.resizeObserver.observe(this.contentEl);
    this.updateResponsiveState(this.contentEl.clientWidth);
    await this.refresh();
  }

  async onClose(): Promise<void> {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  async refresh(): Promise<void> {
    const refreshVersion = ++this.refreshVersion;
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass("dayspan-view");
    root.setCssProps({
      "--dayspan-future-color": this.plugin.settings.futureColor,
      "--dayspan-past-color": this.plugin.settings.pastColor,
    });

    const header = root.createDiv("dayspan-header");
    const heading = header.createDiv("dayspan-heading");
    heading.createEl("h2", { text: "Dayspan" });
    heading.createEl("p", {
      cls: "dayspan-tagline",
      text: this.plugin.t("view.tagline"),
    });

    const actions = header.createDiv("dayspan-header-actions");
    this.iconButton(actions, "refresh-cw", this.plugin.t("view.refresh"), () => void this.refresh());
    this.iconButton(actions, "plus", this.plugin.t("command.registerManually"), () => this.plugin.openManualEntry());

    const records = await this.plugin.loadRecords();
    if (refreshVersion !== this.refreshVersion) return;

    const today = this.plugin.todayKey();
    const counted = records.map((record) => ({
      record,
      difference: differenceInCalendarDays(record.date, today),
    }));

    if (!counted.length) {
      const empty = root.createDiv("dayspan-empty");
      setIcon(empty.createDiv("dayspan-empty-icon"), "calendar-range");
      empty.createEl("h3", { text: this.plugin.t("view.emptyTitle") });
      empty.createEl("p", {
        text: this.plugin.t("view.emptyDescription"),
      });
      const button = empty.createEl("button", {
        text: this.plugin.t("command.registerManually"),
        cls: "mod-cta",
      });
      button.addEventListener("click", () => this.plugin.openManualEntry());
      return;
    }

    const future = counted
      .filter((item) => item.difference > 0)
      .sort((a, b) => a.difference - b.difference || a.record.date.localeCompare(b.record.date));
    const todayRecords = counted.filter((item) => item.difference === 0);
    const past = counted
      .filter((item) => item.difference < 0)
      .sort((a, b) => Math.abs(a.difference) - Math.abs(b.difference));

    const sections: Record<
      DayspanSectionKind,
      { icon: string; title: string; items: CountedRecord[] }
    > = {
      future: { icon: "calendar-clock", title: this.plugin.t("section.future"), items: future },
      today: { icon: "sun", title: this.plugin.t("section.today"), items: todayRecords },
      past: { icon: "history", title: this.plugin.t("section.past"), items: past },
    };

    for (const kind of this.plugin.settings.sectionOrder) {
      const section = sections[kind];
      this.renderSection(root, section.icon, section.title, kind, section.items);
    }
  }

  private renderSection(
    root: HTMLElement,
    icon: string,
    title: string,
    kind: DayspanSectionKind,
    items: CountedRecord[]
  ): void {
    if (!items.length) return;
    const section = root.createEl("section", {
      cls: `dayspan-section dayspan-section--${kind}`,
    });
    const heading = section.createDiv("dayspan-section-heading");
    setIcon(heading.createSpan("dayspan-section-icon"), icon);
    heading.createSpan({
      text: this.plugin.t("section.heading", { title, count: items.length }),
    });
    heading.createDiv("dayspan-section-line");

    const list = section.createDiv("dayspan-list");
    for (const item of items) this.renderCard(list, item);
  }

  private renderCard(list: HTMLElement, item: CountedRecord): void {
    const { record, difference } = item;
    const card = list.createDiv("dayspan-card");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", this.plugin.t("view.openRecord", { title: record.title }));
    card.addEventListener("click", () => void this.plugin.openRecordSource(record));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        void this.plugin.openRecordSource(record);
      }
    });
    card.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      const menu = new Menu();
      menu.addItem((menuItem) =>
        menuItem.setTitle(this.plugin.t("action.edit")).setIcon("pencil").onClick(() => this.plugin.openEditEntry(record))
      );
      menu.addItem((menuItem) =>
        menuItem.setTitle(this.plugin.t("action.openRecord")).setIcon("file-text").onClick(() => void this.plugin.openRecordFile(record))
      );
      menu.addSeparator();
      menu.addItem((menuItem) =>
        menuItem.setTitle(this.plugin.t("action.delete")).setIcon("trash-2").onClick(() => void this.plugin.deleteRecord(record))
      );
      menu.showAtMouseEvent(event);
    });

    const accent = card.createDiv("dayspan-card-accent");
    accent.setText(record.title.slice(0, 1));

    const content = card.createDiv("dayspan-card-content");
    content.createEl("h3", { text: record.title });
    content.createDiv({
      text: formatLocalizedDate(record.date, this.plugin.locale()),
      cls: "dayspan-card-date",
    });
    if (record.excerpt) {
      content.createDiv({ text: record.excerpt.replace(/\s+/g, " "), cls: "dayspan-card-excerpt" });
    }

    const count = card.createDiv("dayspan-count");
    if (difference === 0) {
      count.createSpan({ text: "0", cls: "dayspan-count-number" });
      count.createSpan({ text: this.plugin.t("section.today"), cls: "dayspan-count-unit" });
    } else {
      const parts = formatDateSpan(record.date, this.plugin.todayKey(), record.displayMode);
      if (parts.length > 1) count.addClass("dayspan-count--compound");
      for (const part of parts) {
        const segment = count.createSpan("dayspan-count-segment");
        segment.createSpan({ text: String(part.value), cls: "dayspan-count-number" });
        segment.createSpan({
          text: durationUnit(this.plugin.locale(), part.unit, part.value),
          cls: "dayspan-count-unit",
        });
      }
    }

    const more = this.iconButton(card, "ellipsis", this.plugin.t("action.actions"), () => undefined);
    more.addEventListener("click", (event) => {
      event.stopPropagation();
      const menu = new Menu();
      menu.addItem((menuItem) =>
        menuItem.setTitle(this.plugin.t("action.edit")).setIcon("pencil").onClick(() => this.plugin.openEditEntry(record))
      );
      menu.addItem((menuItem) =>
        menuItem.setTitle(this.plugin.t("action.openRecord")).setIcon("file-text").onClick(() => void this.plugin.openRecordFile(record))
      );
      if (record.sourcePath) {
        menu.addItem((menuItem) =>
          menuItem.setTitle(this.plugin.t("action.openSource")).setIcon("external-link").onClick(() => void this.plugin.openRecordSource(record))
        );
      }
      menu.addSeparator();
      menu.addItem((menuItem) =>
        menuItem.setTitle(this.plugin.t("action.delete")).setIcon("trash-2").onClick(() => void this.plugin.deleteRecord(record))
      );
      const mouse = event as MouseEvent;
      menu.showAtPosition({ x: mouse.clientX, y: mouse.clientY });
    });
  }

  private iconButton(
    parent: HTMLElement,
    icon: string,
    label: string,
    onClick: () => void
  ): HTMLButtonElement {
    const button = parent.createEl("button", {
      cls: "clickable-icon dayspan-icon-button",
      attr: { "aria-label": label },
    });
    setIcon(button, icon);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      onClick();
    });
    return button;
  }

  private updateResponsiveState(width: number): void {
    this.contentEl.classList.toggle("dayspan-is-narrow", width <= 600);
    this.contentEl.classList.toggle("dayspan-is-extra-narrow", width <= 440);
  }
}
