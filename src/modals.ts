import { App, Modal, Setting } from "obsidian";
import {
  DEFAULT_DISPLAY_MODE,
  normalizeDisplayMode,
  parseDateKey,
} from "./date-utils";
import { Translator } from "./i18n";
import { DayspanDraft } from "./model";

export class DayspanEntryModal extends Modal {
  private draft: DayspanDraft;
  private errorEl?: HTMLElement;

  constructor(
    app: App,
    initial: DayspanDraft,
    private heading: string,
    private submitLabel: string,
    private t: Translator,
    private onSubmit: (draft: DayspanDraft) => Promise<void>
  ) {
    super(app);
    this.draft = {
      ...initial,
      displayMode: initial.displayMode ?? DEFAULT_DISPLAY_MODE,
    };
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    this.titleEl.setText(this.heading);
    this.modalEl.addClass("dayspan-entry-modal");

    new Setting(contentEl)
      .setName(this.t("modal.name"))
      .setDesc(this.t("modal.nameDesc"))
      .addText((text) => {
        text.setValue(this.draft.title).onChange((value) => {
          this.draft.title = value;
        });
        window.setTimeout(() => text.inputEl.focus(), 30);
      });

    new Setting(contentEl)
      .setName(this.t("modal.date"))
      .setDesc(this.t("modal.dateDesc"))
      .addText((text) => {
        text.inputEl.type = "date";
        text.setValue(this.draft.date).onChange((value) => {
          this.draft.date = value;
        });
      });

    new Setting(contentEl)
      .setName(this.t("modal.display"))
      .setDesc(this.t("modal.displayDesc"))
      .addDropdown((dropdown) => {
        dropdown
          .addOption("days", this.t("modal.displayDays"))
          .addOption("months", this.t("modal.displayMonths"))
          .addOption("years", this.t("modal.displayYears"))
          .addOption("months-days", this.t("modal.displayMonthsDays"))
          .addOption("years-months-days", this.t("modal.displayYearsMonthsDays"))
          .setValue(this.draft.displayMode ?? DEFAULT_DISPLAY_MODE)
          .onChange((value) => {
            this.draft.displayMode = normalizeDisplayMode(value);
          });
      });

    const excerptWrap = contentEl.createDiv("dayspan-modal-field");
    excerptWrap.createEl("label", { text: this.t("modal.excerpt") });
    excerptWrap.createDiv({
      text: this.t("modal.excerptDesc"),
      cls: "setting-item-description",
    });
    const excerpt = excerptWrap.createEl("textarea", {
      cls: "dayspan-modal-textarea",
    });
    excerpt.value = this.draft.excerpt;
    excerpt.addEventListener("input", () => {
      this.draft.excerpt = excerpt.value;
    });

    if (this.draft.sourcePath) {
      const line = this.draft.sourceLine
        ? this.t("modal.sourceLine", { line: this.draft.sourceLine })
        : "";
      contentEl.createDiv({
        text: this.t("modal.source", { path: this.draft.sourcePath, line }),
        cls: "dayspan-modal-source",
      });
    }

    this.errorEl = contentEl.createDiv("dayspan-modal-error");

    const actions = contentEl.createDiv("dayspan-modal-actions");
    const cancel = actions.createEl("button", { text: this.t("action.cancel") });
    cancel.addEventListener("click", () => this.close());
    const submit = actions.createEl("button", {
      text: this.submitLabel,
      cls: "mod-cta",
    });
    submit.addEventListener("click", () => void this.submit(submit));
  }

  private async submit(button: HTMLButtonElement): Promise<void> {
    const title = this.draft.title.trim();
    if (!title) {
      this.showError(this.t("error.nameRequired"));
      return;
    }
    if (!parseDateKey(this.draft.date)) {
      this.showError(this.t("error.dateInvalid"));
      return;
    }

    button.disabled = true;
    try {
      await this.onSubmit({ ...this.draft, title });
      this.close();
    } catch (error) {
      button.disabled = false;
      this.showError(error instanceof Error ? error.message : this.t("error.saveFailed"));
    }
  }

  private showError(message: string): void {
    if (this.errorEl) this.errorEl.setText(message);
  }
}
