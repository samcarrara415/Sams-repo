"""FreaksMC creator-outreach tracker — Flask web UI.

Run with `python app.py` (or `./run.sh`) and open http://127.0.0.1:5000.
All data lives in a local SQLite file next to this script; commission is
computed on the fly from each creator's per-signup rate (falling back to the
global default in settings.json).
"""

import io

from flask import (
    Flask,
    flash,
    redirect,
    render_template,
    request,
    send_file,
    url_for,
)

import db
import excel

app = Flask(__name__)
app.secret_key = "freaksmc-local-tool"  # only used for flash messages on localhost

db.init_db()


@app.route("/")
def index():
    status = request.args.get("status", "")
    min_subs = request.args.get("min_subs", "")
    max_subs = request.args.get("max_subs", "")
    sort = request.args.get("sort", "contact_date")
    direction = request.args.get("direction", "desc")

    records = db.list_creators(
        status=status or None,
        min_subs=min_subs or None,
        max_subs=max_subs or None,
        sort=sort,
        direction=direction,
    )
    summary = db.compute_summary()  # whole-pipeline summary, not just the filtered view
    settings = db.load_settings()
    return render_template(
        "index.html",
        records=records,
        summary=summary,
        settings=settings,
        statuses=db.STATUSES,
        filters={
            "status": status,
            "min_subs": min_subs,
            "max_subs": max_subs,
            "sort": sort,
            "direction": direction,
        },
    )


@app.route("/creator/new", methods=["GET", "POST"])
def new_creator():
    if request.method == "POST":
        if not (request.form.get("name") or "").strip():
            flash("Creator name is required.", "error")
        else:
            db.create_creator(request.form.to_dict())
            flash("Creator added.", "success")
            return redirect(url_for("index"))
    return render_template(
        "form.html",
        creator=None,
        statuses=db.STATUSES,
        settings=db.load_settings(),
    )


@app.route("/creator/<int:creator_id>/edit", methods=["GET", "POST"])
def edit_creator(creator_id):
    creator = db.get_creator(creator_id)
    if creator is None:
        flash("Creator not found.", "error")
        return redirect(url_for("index"))
    if request.method == "POST":
        if not (request.form.get("name") or "").strip():
            flash("Creator name is required.", "error")
        else:
            db.update_creator(creator_id, request.form.to_dict())
            flash("Creator updated.", "success")
            return redirect(url_for("index"))
    return render_template(
        "form.html",
        creator=creator,
        statuses=db.STATUSES,
        settings=db.load_settings(),
    )


@app.route("/creator/<int:creator_id>/delete", methods=["POST"])
def remove_creator(creator_id):
    db.delete_creator(creator_id)
    flash("Creator deleted.", "success")
    return redirect(url_for("index"))


@app.route("/generate-code")
def generate_code():
    """Tiny JSON endpoint the form uses for the live 'auto-generate' button."""
    handle = request.args.get("handle", "")
    return {"code": db.generate_affiliate_code(handle)}


@app.route("/settings", methods=["GET", "POST"])
def settings_page():
    if request.method == "POST":
        db.save_settings(
            {
                "default_rate": request.form.get("default_rate", 5.0),
                "currency": request.form.get("currency", "$").strip() or "$",
                "code_prefix": request.form.get("code_prefix", "").strip(),
                "code_suffix": request.form.get("code_suffix", "").strip(),
            }
        )
        flash("Settings saved.", "success")
        return redirect(url_for("settings_page"))
    return render_template("settings.html", settings=db.load_settings())


@app.route("/export")
def export_xlsx():
    data = excel.export_to_bytes()
    return send_file(
        io.BytesIO(data),
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name="freaksmc_creators.xlsx",
    )


@app.route("/import", methods=["POST"])
def import_xlsx():
    file = request.files.get("file")
    if not file or not file.filename:
        flash("Choose an .xlsx file to import.", "error")
        return redirect(url_for("index"))
    if not file.filename.lower().endswith(".xlsx"):
        flash("Import must be an .xlsx file.", "error")
        return redirect(url_for("index"))
    try:
        imported, skipped = excel.import_from_filestream(file.stream)
    except Exception as exc:  # surface parse errors to the user instead of a 500
        flash(f"Could not import file: {exc}", "error")
        return redirect(url_for("index"))
    flash(f"Imported {imported} creator(s); skipped {skipped} row(s).", "success")
    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
