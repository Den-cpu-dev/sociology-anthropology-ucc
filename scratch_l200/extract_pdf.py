import pdfplumber

pdf_path = r"C:\Users\kosne\OneDrive\Desktop\L200.pdf"

with pdfplumber.open(pdf_path) as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        print(f"\n=== PAGE {i+1} ===")
        if text:
            print(text)
        else:
            print("(no text extracted)")
        
        # Also try extracting tables
        tables = page.extract_tables()
        if tables:
            print(f"\n--- TABLES on page {i+1} ---")
            for ti, table in enumerate(tables):
                print(f"Table {ti+1}:")
                for row in table:
                    print(row)
