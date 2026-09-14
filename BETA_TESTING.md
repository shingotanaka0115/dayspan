# Dayspan beta testing guide

[English](BETA_TESTING.md) | [日本語](BETA_TESTING.ja.md)

Thank you for testing Dayspan. You do not need to complete every check. Testing the parts closest to your normal workflow is already helpful.

> [!CAUTION]
> This is beta software. Start in a test vault or a backed-up vault. Before sharing screenshots, check that they do not contain private notes or personal information.

## Install with BRAT

1. Open **Settings → Community plugins** in Obsidian.
2. Turn off Restricted mode if it is enabled.
3. Select **Browse**, search for `BRAT`, then install and enable it.
4. Open the Command palette and run **BRAT: Add a beta plugin for testing**.
5. Enter this repository:

   ```text
   shingotanaka0115/dayspan
   ```

6. Open **Settings → Community plugins** and enable **Dayspan**.
7. Confirm that the Dayspan version is `0.1.4` or later.
8. Open Dayspan from its ribbon icon or run **Open list** from the Command palette.

You can also enter the same repository with **Add beta plugin** in BRAT's settings.

## Minimum recommended checks

These checks usually take 10–15 minutes.

### 1. Installation and launch

- [ ] BRAT installs Dayspan without an error.
- [ ] Dayspan can be enabled.
- [ ] The list opens without a broken layout.

### 2. Register selected text

- [ ] Text can be selected in a Markdown note.
- [ ] **Add selected text** in the Command palette creates a record.
- [ ] In editing view, **Add to Dayspan** in the context menu also works.
- [ ] One registration does not show a duplicate card.
- [ ] The source Markdown note is not modified.

### 3. Dayspan record and source link

- [ ] Selecting a card opens its Dayspan record first instead of jumping directly to the source note.
- [ ] The record's `source` property links to the source note.
- [ ] Selecting the `source` link opens the source note.
- [ ] The card is still present after returning to Dayspan.

### 4. Manual records and duration formats

- [ ] **Add manually** creates a record for a past or future date.
- [ ] The record appears under **Today**, **Days elapsed**, or **Days remaining** as appropriate.
- [ ] Days, months, years, months and days, and years/months/days formats can be selected.
- [ ] Changes made in the edit dialog appear in the list.

### 5. List controls and layout

- [ ] Each section can be collapsed and expanded.
- [ ] Section order can be changed in settings.
- [ ] Past and future colors can be changed.
- [ ] Text and duration values do not overlap in a narrow pane.

### 6. Restart and mobile, when available

- [ ] Records remain after restarting Obsidian.
- [ ] Collapsed sections and settings remain after restarting.
- [ ] On mobile, the list, registration, Dayspan record, and `source` link work.
- [ ] When using Obsidian Sync, iCloud, or another supported setup, records reach the other device.

## Report your result

If everything works, your environment and a short “all checks passed” message are enough. If you find a problem or usability concern, open a [GitHub Issue](https://github.com/shingotanaka0115/dayspan/issues/new) with this template:

```markdown
## Result

- [ ] Worked correctly
- [ ] Found a bug
- [ ] Have a usability concern or suggestion

## Environment

- Device:
- OS and version:
- Obsidian version:
- Dayspan version:
- Obsidian display language:
- Theme, or "Default":
- Sync method, if any:

## Checks completed


## What happened


## Expected behavior


## Steps to reproduce

1.
2.
3.

## Screenshots

Remove or hide private notes and personal information before attaching screenshots.
```

## Update the beta

Run **BRAT: Check for updates to all beta plugins and UPDATE** from the Command palette. If an old interface or behavior remains after updating, disable and re-enable Dayspan or restart Obsidian.

## Finish testing

1. Disable Dayspan under **Settings → Community plugins**.
2. Uninstall Dayspan.
3. Remove Dayspan from BRAT's managed beta plugins.

Uninstalling Dayspan does not automatically delete the Markdown record files it created in your vault. Review and delete those files manually only if you no longer need them.
