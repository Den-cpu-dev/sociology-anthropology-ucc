import pdfplumber

pdf_path = r"C:\Users\kosne\OneDrive\Desktop\L200.pdf"
with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        print(f"Page {i+1} objects:")
        print("chars:", len(page.chars))
        print("rects:", len(page.rects))
        print("images:", len(page.images))
        print("lines:", len(page.lines))
        break
