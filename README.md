# Dayspan

[English](README.md) | [日本語](README.ja.md)

Make the span between a chosen date and today visible in Obsidian.

Dayspan lets you intentionally save meaningful moments from your Markdown notes and see how much time has passed since them or remains until them. It does not automatically analyze your vault: you choose what becomes a record.

> [!NOTE]
> Dayspan is currently preparing for its first public beta and is not yet available in the Obsidian Community Plugins directory.
> The current beta interface is Japanese. English interface localization is planned before the Community Plugins submission.

## Features

- Register selected text from Markdown editing or reading view.
- Add milestones and future dates manually.
- Automatically group records into **Until**, **Today**, and **Since** sections.
- Choose a display format for each record:
  - Days
  - Months
  - Years
  - Months and days
  - Years, months, and days
- Reorder the three sections.
- Customize colors for future and past records.
- Open the original source note from a saved record.
- Store every record as a readable Markdown file in your vault.
- Use the plugin on desktop and mobile.

Month and year calculations use calendar boundaries rather than fixed 30-day or 365-day approximations.

## Usage

1. Select text in a Markdown note.
2. Open the Command palette and run **選択した文章を登録** (Register selected text). In editing view, you can also use **Dayspanに登録** (Add to Dayspan) from the context menu.
3. Confirm the title, reference date, and display format.
4. Open Dayspan from the ribbon calendar icon or run **一覧を開く** (Open list) from the Command palette.

You can also use **手動で登録** (Register manually) to add birthdays, age milestones, anniversaries, or future deadlines without selecting text.

## Data and privacy

Dayspan works locally and offline.

- It does not connect to external services.
- It does not collect telemetry or analytics.
- It does not display advertisements.
- It does not modify the selected source note.
- It stores records as Markdown files inside the vault.
- It stores plugin preferences in Obsidian's standard plugin data file.

The default record folder for new installations is `Dayspan`. You can change it in the plugin settings.

## Installation

### Manual installation during beta

1. Download `main.js`, `manifest.json`, and `styles.css` from a GitHub release.
2. Create `<vault>/.obsidian/plugins/dayspan/`.
3. Copy the three files into that folder.
4. Reload Obsidian and enable **Dayspan** under **Settings → Community plugins**.

Installation through the Community Plugins directory will be added after the initial review is complete.

## Development

Requirements: Node.js 20 or later and npm.

```bash
npm install
npm run dev
```

Before committing or releasing:

```bash
npm run check
```

Release assets are `main.js`, `manifest.json`, and `styles.css`. Local `data.json` and generated `main.js` are intentionally excluded from source control.

## Contributing

Bug reports and improvement proposals are welcome through GitHub Issues. Please open an issue before starting a substantial change so the direction can be discussed first.

## License

[MIT](LICENSE) © 2026 Shingo Tanaka
