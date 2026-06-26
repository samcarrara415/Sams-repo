# FreaksMC Creator Tracker

A small, locally-run tool for managing the micro-YouTuber partnership pipeline
for **FreaksMC** (Minecraft server hosting). Track outreach from first Discord
ticket through to a live, commission-earning partnership — all in a local
SQLite database with a clean web dashboard.

It's a solo internal tool: no auth, no cloud, no accounts. Everything lives in
`creators.db` next to the app.

---

## Quick start

```bash
cd freaksmc-creator-tracker
./run.sh
```

Then open **http://127.0.0.1:5000**.

`run.sh` creates a virtualenv, installs the two dependencies (Flask + openpyxl),
and starts the server. To run it manually instead:

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Requires Python 3.8+.

---

## What you can track

Each creator record has:

| Field | Notes |
|-------|-------|
| Creator name | required |
| YouTube channel link | used to auto-generate the affiliate code |
| Subscriber count | filterable / sortable |
| Niche | Survival SMP, Skyblock, PvP, … (free text with suggestions) |
| Discord server link | |
| Discord username | |
| Contact date | defaults to today |
| Ticket status | Sent → Replied → Negotiating → Live, or Dead |
| Affiliate code | auto-generated, editable |
| Signups generated | |
| Per-signup rate | optional; blank uses the global default |
| Commission owed | **auto-calculated**: `signups × rate` |
| Notes | free text |

---

## Features

### Dashboard
Top-of-page summary across the whole pipeline:
- **Total outreached**
- **Response rate** — replied / outreached (Replied, Negotiating, Live all count as a response)
- **Live conversion rate** — live partnerships / outreached
- **Total signups**
- **Total commission owed**

Plus a per-status funnel (how many tickets sit in each stage).

### Filter & sort
Filter by ticket status and by min/max subscriber count; sort by contact date,
name, subscribers, status, signups, or commission.

### Commission (per-creator rate)
Commission owed is computed live as `signups × rate`. Each creator can carry its
**own per-signup rate**; if left blank, the **global default rate** from Settings
is used (ships at **$5.00**). Change the default any time on the Settings page —
existing records using the default update automatically.

### Affiliate codes (HANDLE + suffix)
Codes are generated as **`PREFIX + HANDLE + SUFFIX`**, uppercased with spaces and
symbols stripped. The handle is taken from the YouTube link (an `@handle` or URL
is detected automatically) or the creator name.

- Default pattern: `HANDLE` + suffix `10` → e.g. `STEVEBUILDS10`
- Set the prefix and suffix on the **Settings** page.
- On the add/edit form, leave the code blank to auto-generate on save, or click
  **Generate** to preview it. You can always override it manually.

### Export / import Excel
- **Export .xlsx** — downloads `freaksmc_creators.xlsx` with a formatted
  *Creators* sheet (including computed commission) and a *Summary* sheet.
- **Import** — upload an `.xlsx` to bulk-add rows. Columns are matched by header
  name, so a file produced by Export re-imports cleanly. Rows without a creator
  name are skipped. (Import **adds** rows; it doesn't update existing ones.)

---

## Configuration

Settings live in `settings.json` and are editable from the **Settings** page:

```json
{
  "default_rate": 5.0,
  "currency": "$",
  "code_prefix": "",
  "code_suffix": "10"
}
```

| Key | Meaning |
|-----|---------|
| `default_rate` | per-signup commission when a creator has no own rate |
| `currency` | symbol shown in the UI and export |
| `code_prefix` | text before the handle in affiliate codes |
| `code_suffix` | text after the handle in affiliate codes |

---

## Files

```
app.py            Flask routes / web server
db.py             SQLite layer, settings, commission + code logic
excel.py          .xlsx export & import
settings.json     editable configuration
templates/        dashboard, add/edit form, settings pages
static/style.css  styling
run.sh            one-command launcher
creators.db       your data (created on first run; not committed)
```

## Backups

Your data is the single file `creators.db`. Copy it somewhere safe, or use
**Export .xlsx** for a portable snapshot.
