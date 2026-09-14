import { App, Modal, Setting } from "obsidian";
import {
  DEFAULT_DISPLAY_MODE,
  normalizeDisplayMode,
  parseDateKey,
} from "./date-utils";
import { DayspanDraft } from "./model";

export class DayspanEntryModal extends Modal {
  private draft: DayspanDraft;
  private errorEl?: HTMLElement;

  constructor(
    app: App,
    initial: DayspanDraft,
    private heading: string,
    private submitLabel: string,
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
      .setName("名前")
      .setDesc("一覧に表示する名前です")
      .addText((text) => {
        text.setValue(this.draft.title).onChange((value) => {
          this.draft.title = value;
        });
        window.setTimeout(() => text.inputEl.focus(), 30);
      });

    new Setting(contentEl)
      .setName("基準日")
      .setDesc("今日との日数を数える日です")
      .addText((text) => {
        text.inputEl.type = "date";
        text.setValue(this.draft.date).onChange((value) => {
          this.draft.date = value;
        });
      });

    new Setting(contentEl)
      .setName("表示形式")
      .setDesc("この記録を一覧でどの単位にするか選びます")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("days", "日数（例：251日）")
          .addOption("months", "月数（例：8ヶ月）")
          .addOption("years", "年数（例：6年）")
          .addOption("months-days", "月＋日（例：8ヶ月8日）")
          .addOption("years-months-days", "年＋月＋日（例：6年10ヶ月19日）")
          .setValue(this.draft.displayMode ?? DEFAULT_DISPLAY_MODE)
          .onChange((value) => {
            this.draft.displayMode = normalizeDisplayMode(value);
          });
      });

    const excerptWrap = contentEl.createDiv("dayspan-modal-field");
    excerptWrap.createEl("label", { text: "残しておく文章" });
    excerptWrap.createDiv({
      text: "選択した文章はここに複製されます。元ノートは変更しません。",
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
      contentEl.createDiv({
        text: `元ノート: ${this.draft.sourcePath}${this.draft.sourceLine ? `（${this.draft.sourceLine}行目）` : ""}`,
        cls: "dayspan-modal-source",
      });
    }

    this.errorEl = contentEl.createDiv("dayspan-modal-error");

    const actions = contentEl.createDiv("dayspan-modal-actions");
    const cancel = actions.createEl("button", { text: "キャンセル" });
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
      this.showError("名前を入力してください");
      return;
    }
    if (!parseDateKey(this.draft.date)) {
      this.showError("基準日を YYYY-MM-DD 形式で入力してください");
      return;
    }

    button.disabled = true;
    try {
      await this.onSubmit({ ...this.draft, title });
      this.close();
    } catch (error) {
      button.disabled = false;
      this.showError(error instanceof Error ? error.message : "保存できませんでした");
    }
  }

  private showError(message: string): void {
    if (this.errorEl) this.errorEl.setText(message);
  }
}
