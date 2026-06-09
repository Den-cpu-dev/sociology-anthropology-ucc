#!/usr/bin/env python3
"""
Simple PDF text extraction using pdfplumber (better than PyPDF2 for complex PDFs)
"""

import csv
import re
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("Installing pdfplumber...")
    import subprocess

    subprocess.check_call(["pip", "install", "pdfplumber"])
    import pdfplumber

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"

DEFAULT_PASSWORD = "Soasa2026!"


def extract_text_from_pdf(pdf_path):
    """Extract text from PDF using pdfplumber."""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"Reading {pdf_path.name}: {len(pdf.pages)} pages")
            for i, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
                    print(f"  Page {i}: {len(page_text)} characters")
                else:
                    print(f"  Page {i}: No text (might be image)")
        return text
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return None


def parse_student_data(text, level, year_code):
    """Parse student data from text."""
    students = []

    # Pattern to match index numbers
    index_pattern = r"[A-Z]{2}/[A-Z]{3}/\d{2}/\d{4}"

    lines = text.split("\n")

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        # Find index numbers in the line
        index_matches = re.findall(index_pattern, line)

        for index_num in index_matches:
            # Only process matching year code
            if f"/{year_code}/" not in index_num:
                continue

            # Extract name by removing index number
            name_part = re.sub(index_pattern, "", line).strip()

            # Clean up common prefixes
            name_part = re.sub(r"^\d+[\.\)]\s*", "", name_part).strip()
            name_part = re.sub(r"^[\-,:\|]\s*", "", name_part).strip()
            name_part = " ".join(name_part.split())

            # If name is too short, try next line
            if len(name_part) < 3 and i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if not re.search(index_pattern, next_line):
                    potential_name = re.sub(r"^\d+[\.\)]\s*", "", next_line).strip()
                    potential_name = " ".join(potential_name.split())
                    if len(potential_name) > len(name_part):
                        name_part = potential_name

            # Validate name length
            if 3 <= len(name_part) <= 100:
                students.append(
                    {
                        "index_number": index_num,
                        "full_name": name_part,
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


def write_csv(students, output_path, level):
    """Write students to CSV."""
    if not students:
        print(f"⚠️  No students found for Level {level}")
        return False

    students = remove_duplicates(students)
    students.sort(key=lambda x: x["index_number"])

    with open(output_path, "w", newline="", encoding="utf-8") as csvfile:
        fieldnames = ["index_number", "full_name", "level", "password"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(students)

    print(f"✅ Created {output_path.name}: {len(students)} students")
    return True


def main():
    print("=" * 70)
    print("SOASA Student Data Extraction (pdfplumber)")
    print("=" * 70)
    print()

    L200_PDF = DATA_DIR / "L200.pdf"
    L300_PDF = DATA_DIR / "L300.pdf"
    L200_CSV = DATA_DIR / "l200-students.csv"
    L300_CSV = DATA_DIR / "l300-students.csv"

    if not L200_PDF.exists():
        print(f"❌ File not found: {L200_PDF}")
        return

    if not L300_PDF.exists():
        print(f"❌ File not found: {L300_PDF}")
        return

    # Process L200
    print("\n📄 Processing L200.pdf (Level 200, Year 24)...")
    l200_text = extract_text_from_pdf(L200_PDF)

    if l200_text and len(l200_text.strip()) > 100:
        print(f"\n📝 Extracted {len(l200_text)} characters from L200.pdf")
        l200_students = parse_student_data(l200_text, 200, "24")

        if l200_students:
            write_csv(l200_students, L200_CSV, 200)
            print("\n📋 Sample L200 students (first 5):")
            for student in l200_students[:5]:
                print(f"   {student['index_number']} - {student['full_name']}")
            if len(l200_students) > 5:
                print(f"   ... and {len(l200_students) - 5} more")
        else:
            print("⚠️  No valid L200 students found in extracted text")
            print("\n🔍 First 500 characters of extracted text:")
            print(l200_text[:500])
    else:
        print("⚠️  PDF might be image-based (scanned). Try OCR or manual entry.")

    # Process L300
    print("\n📄 Processing L300.pdf (Level 300, Year 23)...")
    l300_text = extract_text_from_pdf(L300_PDF)

    if l300_text and len(l300_text.strip()) > 100:
        print(f"\n📝 Extracted {len(l300_text)} characters from L300.pdf")
        l300_students = parse_student_data(l300_text, 300, "23")

        if l300_students:
            write_csv(l300_students, L300_CSV, 300)
            print("\n📋 Sample L300 students (first 5):")
            for student in l300_students[:5]:
                print(f"   {student['index_number']} - {student['full_name']}")
            if len(l300_students) > 5:
                print(f"   ... and {len(l300_students) - 5} more")
        else:
            print("⚠️  No valid L300 students found in extracted text")
            print("\n🔍 First 500 characters of extracted text:")
            print(l300_text[:500])
    else:
        print("⚠️  PDF might be image-based (scanned). Try OCR or manual entry.")

    print("\n" + "=" * 70)
    print("✅ Extraction complete!")
    print("=" * 70)


if __name__ == "__main__":
    main()
