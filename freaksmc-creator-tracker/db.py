"""SQLite data layer for the FreaksMC creator-outreach tracker.

One small module that owns the database: schema creation, the list of valid
ticket statuses, settings (commission rate + affiliate-code pattern), the
affiliate-code generator, and basic CRUD helpers. Everything here is plain
stdlib sqlite3 so the tool stays dependency-light.
"""

import json
import os
import re
import sqlite3
from datetime import date, datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "creators.db")
SETTINGS_PATH = os.path.join(BASE_DIR, "settings.json")

# The pipeline stages a partnership ticket can be in. Order matters: it drives
# the dashboard funnel and the status dropdown.
STATUSES = ["Sent", "Replied", "Negotiating", "Live", "Dead"]

# Statuses that mean the creator actually responded to us.
RESPONDED_STATUSES = {"Replied", "Negotiating", "Live"}

DEFAULT_SETTINGS = {
    "default_rate": 5.0,   # per-signup commission used when a creator has no own rate
    "currency": "$",
    "code_prefix": "",     # affiliate code = PREFIX + HANDLE + SUFFIX (all upper, alnum)
    "code_suffix": "10",
}

# The editable columns of a creator record, in canonical order. Reused by the
# form, the Excel export/import, and the table view so there is one source of
# truth for the field list.
FIELDS = [
    "name",
    "youtube_link",
    "subscriber_count",
    "niche",
    "discord_link",
    "discord_username",
    "contact_date",
    "status",
    "affiliate_code",
    "signups",
    "rate",
    "notes",
]


# --------------------------------------------------------------------------- #
# Settings
# --------------------------------------------------------------------------- #
def load_settings():
    """Read settings.json, filling in any missing keys with defaults."""
    settings = dict(DEFAULT_SETTINGS)
    if os.path.exists(SETTINGS_PATH):
        try:
            with open(SETTINGS_PATH, "r", encoding="utf-8") as fh:
                settings.update(json.load(fh))
        except (json.JSONDecodeError, OSError):
            pass
    # Coerce types defensively.
    try:
        settings["default_rate"] = float(settings.get("default_rate", 5.0))
    except (TypeError, ValueError):
        settings["default_rate"] = 5.0
    return settings


def save_settings(settings):
    """Persist the supplied settings dict (merged over current values)."""
    current = load_settings()
    current.update(settings)
    with open(SETTINGS_PATH, "w", encoding="utf-8") as fh:
        json.dump(current, fh, indent=2)
    return current


# --------------------------------------------------------------------------- #
# Affiliate code generation
# --------------------------------------------------------------------------- #
def generate_affiliate_code(handle, settings=None):
    """Build an affiliate code from a creator handle/name.

    Pattern (configurable in settings.json): PREFIX + HANDLE + SUFFIX, where
    HANDLE is the handle uppercased with everything except A-Z/0-9 stripped.
    A leading '@' or a full YouTube URL is reduced to just the handle first.
    """
    settings = settings or load_settings()
    handle = (handle or "").strip()

    # If they pasted a YouTube URL, pull the @handle or last path segment.
    url_match = re.search(r"youtube\.com/(?:@?([\w.\-]+))", handle, re.IGNORECASE)
    if url_match:
        handle = url_match.group(1)
    handle = handle.lstrip("@")

    core = re.sub(r"[^A-Za-z0-9]", "", handle).upper()
    if not core:
        return ""
    prefix = re.sub(r"[^A-Za-z0-9]", "", str(settings.get("code_prefix", ""))).upper()
    suffix = re.sub(r"[^A-Za-z0-9]", "", str(settings.get("code_suffix", ""))).upper()
    return f"{prefix}{core}{suffix}"


# --------------------------------------------------------------------------- #
# Connection / schema
# --------------------------------------------------------------------------- #
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create the creators table if it does not yet exist."""
    conn = get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS creators (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            name             TEXT NOT NULL,
            youtube_link     TEXT DEFAULT '',
            subscriber_count INTEGER DEFAULT 0,
            niche            TEXT DEFAULT '',
            discord_link     TEXT DEFAULT '',
            discord_username TEXT DEFAULT '',
            contact_date     TEXT DEFAULT '',
            status           TEXT DEFAULT 'Sent',
            affiliate_code   TEXT DEFAULT '',
            signups          INTEGER DEFAULT 0,
            rate             REAL,
            notes            TEXT DEFAULT '',
            created_at       TEXT DEFAULT '',
            updated_at       TEXT DEFAULT ''
        )
        """
    )
    conn.commit()
    conn.close()


# --------------------------------------------------------------------------- #
# Field coercion
# --------------------------------------------------------------------------- #
def _to_int(value, default=0):
    if value in (None, ""):
        return default
    try:
        # Tolerate "12,000" and "12000.0".
        return int(float(str(value).replace(",", "").strip()))
    except (TypeError, ValueError):
        return default


def _to_rate(value):
    """Per-creator rate is optional; blank means 'use the global default'."""
    if value in (None, ""):
        return None
    try:
        return float(str(value).replace(",", "").strip())
    except (TypeError, ValueError):
        return None


def clean_record(data):
    """Normalise an incoming dict of raw form/Excel values into typed fields."""
    rec = {}
    rec["name"] = (data.get("name") or "").strip()
    rec["youtube_link"] = (data.get("youtube_link") or "").strip()
    rec["subscriber_count"] = _to_int(data.get("subscriber_count"))
    rec["niche"] = (data.get("niche") or "").strip()
    rec["discord_link"] = (data.get("discord_link") or "").strip()
    rec["discord_username"] = (data.get("discord_username") or "").strip()
    rec["contact_date"] = (data.get("contact_date") or "").strip()
    status = (data.get("status") or "Sent").strip()
    rec["status"] = status if status in STATUSES else "Sent"
    rec["affiliate_code"] = (data.get("affiliate_code") or "").strip().upper()
    rec["signups"] = _to_int(data.get("signups"))
    rec["rate"] = _to_rate(data.get("rate"))
    rec["notes"] = (data.get("notes") or "").strip()
    return rec


# --------------------------------------------------------------------------- #
# CRUD
# --------------------------------------------------------------------------- #
def create_creator(data):
    rec = clean_record(data)
    now = datetime.now().isoformat(timespec="seconds")
    if not rec["contact_date"]:
        rec["contact_date"] = date.today().isoformat()
    if not rec["affiliate_code"]:
        rec["affiliate_code"] = generate_affiliate_code(
            rec["youtube_link"] or rec["name"]
        )
    conn = get_db()
    cols = FIELDS + ["created_at", "updated_at"]
    values = [rec[f] for f in FIELDS] + [now, now]
    placeholders = ", ".join("?" for _ in cols)
    conn.execute(
        f"INSERT INTO creators ({', '.join(cols)}) VALUES ({placeholders})", values
    )
    conn.commit()
    new_id = conn.execute("SELECT last_insert_rowid() AS id").fetchone()["id"]
    conn.close()
    return new_id


def update_creator(creator_id, data):
    rec = clean_record(data)
    now = datetime.now().isoformat(timespec="seconds")
    conn = get_db()
    assignments = ", ".join(f"{f} = ?" for f in FIELDS) + ", updated_at = ?"
    values = [rec[f] for f in FIELDS] + [now, creator_id]
    conn.execute(f"UPDATE creators SET {assignments} WHERE id = ?", values)
    conn.commit()
    conn.close()


def delete_creator(creator_id):
    conn = get_db()
    conn.execute("DELETE FROM creators WHERE id = ?", (creator_id,))
    conn.commit()
    conn.close()


def get_creator(creator_id):
    conn = get_db()
    row = conn.execute("SELECT * FROM creators WHERE id = ?", (creator_id,)).fetchone()
    conn.close()
    return row


def list_creators(status=None, min_subs=None, max_subs=None, sort="contact_date",
                  direction="desc"):
    """Return creator rows with optional status/subscriber filters and sorting."""
    sortable = set(FIELDS) | {"id", "created_at", "updated_at", "commission"}
    if sort not in sortable:
        sort = "contact_date"
    direction = "ASC" if str(direction).lower() == "asc" else "DESC"

    where = []
    params = []
    if status and status in STATUSES:
        where.append("status = ?")
        params.append(status)
    if min_subs not in (None, ""):
        where.append("subscriber_count >= ?")
        params.append(_to_int(min_subs))
    if max_subs not in (None, ""):
        where.append("subscriber_count <= ?")
        params.append(_to_int(max_subs))
    clause = ("WHERE " + " AND ".join(where)) if where else ""

    conn = get_db()
    rows = conn.execute(
        f"SELECT * FROM creators {clause}", params
    ).fetchall()
    conn.close()

    default_rate = load_settings()["default_rate"]
    records = []
    for row in rows:
        rec = dict(row)
        rate = rec["rate"] if rec["rate"] is not None else default_rate
        rec["effective_rate"] = rate
        rec["commission"] = (rec["signups"] or 0) * rate
        records.append(rec)

    # Sort in Python so the computed "commission" column is sortable too.
    reverse = direction == "DESC"
    records.sort(key=lambda r: _sort_key(r.get(sort)), reverse=reverse)
    return records


def _sort_key(value):
    """Sort numbers as numbers and everything else as lowercase strings."""
    if isinstance(value, (int, float)):
        return (0, value)
    return (1, str(value or "").lower())


def compute_summary(records=None):
    """Roll the pipeline up into the dashboard metrics."""
    if records is None:
        records = list_creators()
    total = len(records)
    responded = sum(1 for r in records if r["status"] in RESPONDED_STATUSES)
    live = sum(1 for r in records if r["status"] == "Live")
    dead = sum(1 for r in records if r["status"] == "Dead")
    total_signups = sum(r["signups"] or 0 for r in records)
    total_commission = sum(r["commission"] for r in records)

    by_status = {s: 0 for s in STATUSES}
    for r in records:
        by_status[r["status"]] = by_status.get(r["status"], 0) + 1

    return {
        "total": total,
        "responded": responded,
        "live": live,
        "dead": dead,
        "response_rate": (responded / total * 100) if total else 0.0,
        "conversion_rate": (live / total * 100) if total else 0.0,
        "total_signups": total_signups,
        "total_commission": total_commission,
        "by_status": by_status,
    }
