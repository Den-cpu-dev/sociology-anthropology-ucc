#!/usr/bin/env python3
"""
Extract student data from L200.pdf and L300.pdf using OCR (pdf2image + pytesseract).
Handles scanned PDFs or image-based PDFs.
"""

import csv
import re
from pathlib import Path

# Try to import required libraries
try:
    import pytesseract
    from pdf2image import convert_from_path
    from PIL import Image
except ImportError as e:
    print(f"❌ Missing required library: {e}")
    print("\nTo install dependencies, run:")
    print("  pip install pdf2image pytesseract pillow")
    print("\nYou also need Poppler for Windows:")
    print(
        "  1. Download from: https://github.com/oschwartz10612/poppler-windows/releases"
    )
    print("  2. Extract and add 'bin' folder to PATH")
    print("\nAnd Tesseract OCR:")
    print("  1. Download from: https://github.com/UB-Mannheim/tesseract/wiki")
    print("  2. Install and add to PATH")
    exit(1)

# Paths
DESKTOP = Path(r"C:\Users\kosne\OneDrive\Desktop")
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"

L200_PDF = DESKTOP / "L200.pdf"
L300_PDF = DESKTOP / "L300.pdf"
L200_CSV = DATA_DIR / "l200-students.csv"
L300_CSV = DATA_DIR / "l300-students.csv"

DEFAULT_PASSWORD = "Soasa2026!"


def extract_text_with_ocr(pdf_path):
    """Extract text from PDF using OCR."""
    try:
        print(f"Converting {pdf_path.name} to images...")
        images = convert_from_path(pdf_path, dpi=300)
        print(f"  Found {len(images)} pages, running OCR...")

        full_text = ""
        for i, image in enumerate(images, 1):
            print(f"  Processing page {i}/{len(images)}...")
            text = pytesseract.image_to_string(image)
            full_text += text + "\n"

        return full_text
    except Exception as e:
        print(f"❌ Error processing {pdf_path}: {e}")
        return None


def parse_student_data(text, level, year_code):
    """Parse student data from OCR text."""
    students = []
    index_pattern = r"[A-Z]{2}/[A-Z]{3}/\d{2}/\d{4}"

    lines = text.split("\n")

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        index_matches = re.findall(index_pattern, line)

        for index_num in index_matches:
            name_part = re.sub(index_pattern, "", line).strip()
            name_part = re.sub(r"^\d+[\.\)]\s*", "", name_part).strip()
            name_part = re.sub(r"^[\-,]\s*", "", name_part).strip()
            name_part = " ".join(name_part.split())

            if len(name_part) < 3 and i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if not re.search(index_pattern, next_line):
                    name_part = re.sub(r"^\d+[\.\)]\s*", "", next_line).strip()
                    name_part = " ".join(name_part.split())

            if len(name_part) < 3 or len(name_part) > 100:
                continue

            name_part = name_part.replace(",", "").strip()

            if f"/{year_code}/" in index_num:
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
    """Remove duplicates."""
    seen = set()
    unique = []
    for student in students:
        if student["index_number"] not in seen:
            seen.add(student["index_number"])
            unique.append(student)
    return unique


def write_csv(students, output_path, level):
    """Write to CSV."""
    if not students:
        print(f"⚠️  No students found for Level {level}")
        return False

    students = remove_duplicates(students)
    students.sort(key=lambda x: x["index_number"])

    with open(output_path, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(
            csvfile, fieldnames=["index_number", "full_name", "level", "password"]
        )
        writer.writeheader()
        writer.writerows(students)

    print(f"✅ Created {output_path.name}: {len(students)} students")
    return True


def main():
    print("=" * 60)
    print("SOASA Student Data Extraction with OCR")
    print("=" * 60)

    if not L200_PDF.exists():
        print(f"❌ File not found: {L200_PDF}")
        return

    if not L300_PDF.exists():
        print(f"❌ File not found: {L300_PDF}")
        return

    DATA_DIR.mkdir(exist_ok=True)

    # Process L200
    print("\n📄 Processing L200.pdf...")
    l200_text = extract_text_with_ocr(L200_PDF)
    if l200_text:
        l200_students = parse_student_data(l200_text, 200, "24")
        write_csv(l200_students, L200_CSV, 200)
        if l200_students:
            print("\n📋 Sample L200:")
            for s in l200_students[:5]:
                print(f"   {s['index_number']} - {s['full_name']}")

    # Process L300
    print("\n📄 Processing L300.pdf...")
    l300_text = extract_text_with_ocr(L300_PDF)
    if l300_text:
        l300_students = parse_student_data(l300_text, 300, "23")
        write_csv(l300_students, L300_CSV, 300)
        if l300_students:
            print("\n📋 Sample L300:")
            for s in l300_students[:5]:
                print(f"   {s['index_number']} - {s['full_name']}")

    print("\n" + "=" * 60)
    print("✅ Complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
