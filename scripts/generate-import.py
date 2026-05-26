import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "prompt-zero-export.csv"
SQL_PATH = ROOT / "scripts" / "import.sql"
USER_EMAIL = "ruben@8signal.com"


def sql_str(value):
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def main():
    rows = []
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for r in reader:
            answers = [
                r.get("Q1: What am I actually trying to accomplish?", "") or "",
                r.get("Q2: Why does this matter?", "") or "",
                r.get("Q3: What does done look like?", "") or "",
                r.get("Q4: What does wrong look like?", "") or "",
                r.get("Q5: What do I already know?", "") or "",
                r.get("Q6: What are the pieces?", "") or "",
                r.get("Q7: What is the hard part?", "") or "",
            ]
            try:
                answered_count = int(r.get("Answered Count") or 0)
            except ValueError:
                answered_count = sum(1 for a in answers if a.strip())

            rows.append({
                "title": r.get("Title") or None,
                "created_at": r.get("Date") or None,
                "time_spent": r.get("Time Spent") or None,
                "answered_count": answered_count,
                "answers": answers,
            })

    lines = []
    lines.append("-- Prompt Zero CSV import")
    lines.append(f"-- Source: prompt-zero-export.csv")
    lines.append(f"-- Rows: {len(rows)}")
    lines.append(f"-- Target user: {USER_EMAIL}")
    lines.append("")
    lines.append("DO $$")
    lines.append("DECLARE")
    lines.append("  target_user_id UUID;")
    lines.append("BEGIN")
    lines.append(f"  SELECT id INTO target_user_id FROM auth.users WHERE email = {sql_str(USER_EMAIL)} LIMIT 1;")
    lines.append("  IF target_user_id IS NULL THEN")
    lines.append(f"    RAISE EXCEPTION 'No auth.users row found for email {USER_EMAIL}';")
    lines.append("  END IF;")
    lines.append("")
    lines.append("  INSERT INTO brain_dumps (user_id, title, answers, time_spent, answered_count, created_at) VALUES")

    value_rows = []
    for r in rows:
        answers_json = json.dumps(r["answers"], ensure_ascii=False)
        value_rows.append(
            "  (target_user_id, "
            f"{sql_str(r['title'])}, "
            f"{sql_str(answers_json)}::jsonb, "
            f"{sql_str(r['time_spent'])}, "
            f"{r['answered_count']}, "
            f"{sql_str(r['created_at'])}::timestamptz)"
        )

    lines.append(",\n".join(value_rows) + ";")
    lines.append("END $$;")
    lines.append("")

    SQL_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(rows)} rows to {SQL_PATH}")


if __name__ == "__main__":
    main()
