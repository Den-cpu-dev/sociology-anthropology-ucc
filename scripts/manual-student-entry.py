#!/usr/bin/env python3
"""
Simple manual entry tool for student data.
Paste data from PDF and this script will format it into CSV.
"""

import csv
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"

DEFAULT_PASSWORD = "Soasa2026!"


def parse_pasted_text(text, level, year_code):
    """
    Parse student data from pasted text.
    Handles formats like:
    - SS/BSS/24/0001 Student Name
    - 1. Student Name SS/BSS/24/0001
    - Student Name SS/BSS/24/0001
    """
    students = []
    index_pattern = r"[A-Z]{2}/[A-Z]{3}/\d{2}/\d{4}"

    lines = text.strip().split("\n")

    for line in lines:
        line = line.strip()
        if not line or len(line) < 10:
            continue

        # Find all index numbers in the line
        matches = list(re.finditer(index_pattern, line))

        for match in matches:
            index_num = match.group()

            # Only process if it matches the expected year
            if f"/{year_code}/" not in index_num:
                continue

            # Extract name (everything except the index number)
            name = re.sub(index_pattern, "", line).strip()

            # Clean up common prefixes
            name = re.sub(r"^\d+[\.\)]\s*", "", name).strip()  # Remove "1. " or "1) "
            name = re.sub(r"^[-,]\s*", "", name).strip()  # Remove leading dash/comma
            name = " ".join(name.split())  # Normalize whitespace

            # Skip if name is too short or too long
            if 3 <= len(name) <= 100:
                students.append(
                    {
                        "index_number": index_num,
                        "full_name": name,
                        "level": str(level),
                        "password": DEFAULT_PASSWORD,
                    }
                )

    return students


def remove_duplicates(students):
    """Remove duplicate entries."""
    seen = set()
    unique = []
    for student in students:
        if student["index_number"] not in seen:
            seen.add(student["index_number"])
            unique.append(student)
    return unique


def save_csv(students, filename):
    """Save students to CSV file."""
    if not students:
        print("⚠️  No valid students found!")
        return False

    students = remove_duplicates(students)
    students.sort(key=lambda x: x["index_number"])

    output_path = DATA_DIR / filename

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f, fieldnames=["index_number", "full_name", "level", "password"]
        )
        writer.writeheader()
        writer.writerows(students)

    print(f"\n✅ Saved {len(students)} students to {filename}")
    print(f"📁 Location: {output_path}")
    return True


def main():
    print("=" * 70)
    print("SOASA Manual Student Data Entry")
    print("=" * 70)
    print("\nThis tool helps you create CSV files from copied PDF text.")
    print("Simply paste the student list and it will be formatted automatically.\n")

    DATA_DIR.mkdir(exist_ok=True)

    # Process L200
    print("\n" + "=" * 70)
    print("LEVEL 200 STUDENTS (Year 24 intake: SS/BSS/24/xxxx)")
    print("=" * 70)
    print("\nPaste the L200 student list below (Ctrl+V, then press Enter twice):")
    print("Format examples:")
    print("  - SS/BSS/24/0001 Ama Mensah")
    print("  - 1. Kwame Asante SS/BSS/24/0002")
    print("\nPaste here:")

    l200_lines = []
    while True:
        try:
            line = input()
            if not line.strip():
                if l200_lines:  # Empty line after data = done
                    break
                continue
            l200_lines.append(line)
        except EOFError:
            break

    if l200_lines:
        l200_text = "\n".join(l200_lines)
        l200_students = parse_pasted_text(l200_text, 200, "24")

        if l200_students:
            print(f"\n📊 Found {len(l200_students)} L200 students")
            print("\n📋 Sample (first 5):")
            for student in l200_students[:5]:
                print(f"   {student['index_number']} - {student['full_name']}")
            if len(l200_students) > 5:
                print(f"   ... and {len(l200_students) - 5} more")

            save_csv(l200_students, "l200-students.csv")
        else:
            print("⚠️  No L200 students found. Check the format.")

    # Process L300
    print("\n" + "=" * 70)
    print("LEVEL 300 STUDENTS (Year 23 intake: SS/BSS/23/xxxx)")
    print("=" * 70)
    print("\nPaste the L300 student list below (Ctrl+V, then press Enter twice):")

    l300_lines = []
    while True:
        try:
            line = input()
            if not line.strip():
                if l300_lines:
                    break
                continue
            l300_lines.append(line)
        except EOFError:
            break

    if l300_lines:
        l300_text = "\n".join(l300_lines)
        l300_students = parse_pasted_text(l300_text, 300, "23")

        if l300_students:
            print(f"\n📊 Found {len(l300_students)} L300 students")
            print("\n📋 Sample (first 5):")
            for student in l300_students[:5]:
                print(f"   {student['index_number']} - {student['full_name']}")
            if len(l300_students) > 5:
                print(f"   ... and {len(l300_students) - 5} more")

            save_csv(l300_students, "l300-students.csv")
        else:
            print("⚠️  No L300 students found. Check the format.")

    print("\n" + "=" * 70)
    print("✅ Done! Your CSV files are ready in the data/ folder.")
    print("=" * 70)


if __name__ == "__main__":
    main()
