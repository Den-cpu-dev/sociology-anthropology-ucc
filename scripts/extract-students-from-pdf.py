#!/usr/bin/env python3
"""
Extract student data from L200.pdf and L300.pdf and create CSV files.
Reads PDFs from Desktop and outputs to data/ folder.
"""

import re
import csv
import os
from pathlib import Path

# Try to import PyPDF2, if not available, provide instructions
try:
    import PyPDF2
except ImportError:
    print("PyPDF2 is not installed. Installing now...")
    import subprocess
    subprocess.check_call(["pip", "install", "PyPDF2"])
    import PyPDF2

# Paths
DESKTOP = Path(r"C:\Users\kosne\OneDrive\Desktop")
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"

L200_PDF = DESKTOP / "L200.pdf"
L300_PDF = DESKTOP / "L300.pdf"
L200_CSV = DATA_DIR / "l200-students.csv"
L300_CSV = DATA_DIR / "l300-students.csv"

# Default password for all students
DEFAULT_PASSWORD = "Soasa2026!"


def extract_text_from_pdf(pdf_path):
    """Extract all text from a PDF file."""
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            print(f"Reading {pdf_path.name}: {len(reader.pages)} pages")
            for page_num, page in enumerate(reader.pages, 1):
                page_text = page.extract_text()
                text += page_text + "\n"
                print(f"  Page {page_num}: {len(page_text)} characters")
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return None
    return text


def parse_student_data(text, level, year_code):
    """
    Parse student data from PDF text.
    Handles various formats:
    - SS/BSS/24/0001 Student Name
    - 1. Student Name SS/BSS/24/0001
    - Index: SS/BSS/24/0001, Name: Student Name
    """
    students = []

    # Pattern to match index numbers like SS/BSS/24/0001 or PS/ANT/24/0001
    index_pattern = r'[A-Z]{2}/[A-Z]{3}/\d{2}/\d{4}'

    # Split into lines
    lines = text.split('\n')

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        # Find index numbers in the line
        index_matches = re.findall(index_pattern, line)

        for index_num in index_matches:
            # Try to extract name from the same line
            # Remove the index number and clean up
            name_part = re.sub(index_pattern, '', line).strip()

            # Remove common prefixes like numbers, dots, commas
            name_part = re.sub(r'^\d+[\.\)]\s*', '', name_part).strip()
            name_part = re.sub(r'^[\-,]\s*', '', name_part).strip()

            # Remove extra whitespace
            name_part = ' '.join(name_part.split())

            # If name is empty or too short, try next line
            if len(name_part) < 3 and i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                # Only use next line if it doesn't contain an index number
                if not re.search(index_pattern, next_line):
                    name_part = re.sub(r'^\d+[\.\)]\s*', '', next_line).strip()
                    name_part = ' '.join(name_part.split())

            # Skip if name is still invalid
            if len(name_part) < 3 or len(name_part) > 100:
                continue

            # Clean up common issues
            name_part = name_part.replace(',', '').strip()

            # Verify the index number matches the expected year
            if f"/{year_code}/" in index_num:
                students.append({
                    'index_number': index_num,
                    'full_name': name_part,
                    'level': str(level),
                    'password': DEFAULT_PASSWORD
                })

    return students


def remove_duplicates(students):
    """Remove duplicate entries based on index number."""
    seen = set()
    unique = []
    for student in students:
        if student['index_number'] not in seen:
            seen.add(student['index_number'])
            unique.append(student)
    return unique


def write_csv(students, output_path, level):
    """Write student data to CSV file."""
    if not students:
        print(f"⚠️  No students found for Level {level}")
        return False

    # Remove duplicates
    students = remove_duplicates(students)

    # Sort by index number
    students.sort(key=lambda x: x['index_number'])

    try:
        with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['index_number', 'full_name', 'level', 'password']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            writer.writerows(students)

        print(f"✅ Created {output_path.name}: {len(students)} students")
        return True
    except Exception as e:
        print(f"❌ Error writing {output_path}: {e}")
        return False


def main():
    print("=" * 60)
    print("SOASA Student Data Extraction from PDFs")
    print("=" * 60)
    print()

    # Check if PDF files exist
    if not L200_PDF.exists():
        print(f"❌ File not found: {L200_PDF}")
        print(f"   Please place L200.pdf on your Desktop")
        return

    if not L300_PDF.exists():
        print(f"❌ File not found: {L300_PDF}")
        print(f"   Please place L300.pdf on your Desktop")
        return

    # Ensure data directory exists
    DATA_DIR.mkdir(exist_ok=True)

    # Process L200 (year 2024 intake)
    print("\n📄 Processing L200.pdf (Level 200, Year 24 intake)...")
    l200_text = extract_text_from_pdf(L200_PDF)
    if l200_text:
        l200_students = parse_student_data(l200_text, level=200, year_code='24')
        write_csv(l200_students, L200_CSV, 200)

        # Show sample
        if l200_students:
            print("\n📋 Sample L200 students:")
            for student in l200_students[:5]:
                print(f"   {student['index_number']} - {student['full_name']}")
            if len(l200_students) > 5:
                print(f"   ... and {len(l200_students) - 5} more")

    # Process L300 (year 2023 intake)
    print("\n📄 Processing L300.pdf (Level 300, Year 23 intake)...")
    l300_text = extract_text_from_pdf(L300_PDF)
    if l300_text:
        l300_students = parse_student_data(l300_text, level=300, year_code='23')
        write_csv(l300_students, L300_CSV, 300)

        # Show sample
        if l300_students:
            print("\n📋 Sample L300 students:")
            for student in l300_students[:5]:
                print(f"   {student['index_number']} - {student['full_name']}")
            if len(l300_students) > 5:
                print(f"   ... and {len(l300_students) - 5} more")

    print("\n" + "=" * 60)
    print("✅ Extraction complete!")
    print(f"📁 Output files in: {DATA_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
