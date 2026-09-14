import assert from "node:assert/strict";
import test from "node:test";
import {
  differenceInCalendarDays,
  formatDateSpan,
  normalizeDisplayMode,
  parseDateKey,
  toDateKey,
} from "../src/date-utils";
import { normalizeSectionOrder } from "../src/settings";

test("基準日と今日が同じなら0日", () => {
  assert.equal(differenceInCalendarDays("2026-09-11", "2026-09-11"), 0);
});

test("未来は正、過去は負の日数になる", () => {
  assert.equal(differenceInCalendarDays("2026-09-12", "2026-09-11"), 1);
  assert.equal(differenceInCalendarDays("2026-09-01", "2026-09-11"), -10);
});

test("うるう年をカレンダー日として数える", () => {
  assert.equal(differenceInCalendarDays("2024-03-01", "2024-02-28"), 2);
});

test("存在しない日付は受け付けない", () => {
  assert.equal(parseDateKey("2026-02-29"), null);
  assert.equal(parseDateKey("2026-9-1"), null);
});

test("ローカル日付をYYYY-MM-DDにする", () => {
  assert.equal(toDateKey(new Date(2026, 8, 5, 23, 30)), "2026-09-05");
});

test("表示形式がない既存データは日数表示になる", () => {
  assert.equal(normalizeDisplayMode(undefined), "days");
  assert.equal(normalizeDisplayMode("unknown"), "days");
  assert.equal(normalizeDisplayMode("years"), "years");
});

test("日数・月数・年数を選んだ形式で返す", () => {
  assert.deepEqual(formatDateSpan("2019-10-23", "2026-09-11", "days"), [
    { value: 2515, unit: "日" },
  ]);
  assert.deepEqual(formatDateSpan("2026-01-03", "2026-09-11", "months"), [
    { value: 8, unit: "ヶ月" },
  ]);
  assert.deepEqual(formatDateSpan("2019-10-23", "2026-09-11", "years"), [
    { value: 6, unit: "年" },
  ]);
});

test("月＋日は完了した暦月と残りの日数で返す", () => {
  assert.deepEqual(formatDateSpan("2026-01-03", "2026-09-11", "months-days"), [
    { value: 8, unit: "ヶ月" },
    { value: 8, unit: "日" },
  ]);
  assert.deepEqual(formatDateSpan("2024-01-31", "2024-02-29", "months-days"), [
    { value: 1, unit: "ヶ月" },
    { value: 0, unit: "日" },
  ]);
});

test("年＋月＋日は完了した暦年・暦月と残りの日数で返す", () => {
  assert.deepEqual(
    formatDateSpan("2019-10-23", "2026-09-11", "years-months-days"),
    [
      { value: 6, unit: "年" },
      { value: 10, unit: "ヶ月" },
      { value: 19, unit: "日" },
    ]
  );
  assert.deepEqual(
    formatDateSpan("2024-02-29", "2025-02-28", "years-months-days"),
    [
      { value: 1, unit: "年" },
      { value: 0, unit: "ヶ月" },
      { value: 0, unit: "日" },
    ]
  );
});

test("未来と過去で表示期間の値は変わらない", () => {
  assert.deepEqual(
    formatDateSpan("2026-09-11", "2026-01-03", "months-days"),
    formatDateSpan("2026-01-03", "2026-09-11", "months-days")
  );
});

test("セクションの並び順を保存値から復元する", () => {
  assert.deepEqual(normalizeSectionOrder(["past", "future", "today"]), [
    "past",
    "future",
    "today",
  ]);
});

test("古い設定や不正な並び順には不足項目を補う", () => {
  assert.deepEqual(normalizeSectionOrder(undefined), ["future", "today", "past"]);
  assert.deepEqual(normalizeSectionOrder(["past", "past", "unknown"]), [
    "past",
    "future",
    "today",
  ]);
});
