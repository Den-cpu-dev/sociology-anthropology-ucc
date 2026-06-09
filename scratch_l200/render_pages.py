import pypdfium2 as pdfium
from PIL import Image
import os

pdf_path = r"C:\Users\kosne\OneDrive\Desktop\L200.pdf"
output_dir = r"c:\Users\kosne\OneDrive\Desktop\of all\scratch_l200\pages"
os.makedirs(output_dir, exist_ok=True)

pdf = pdfium.PdfDocument(pdf_path)
print(f"Total pages: {len(pdf)}")

for i in range(len(pdf)):
    page = pdf[i]
    # Render at 300 DPI for good OCR quality
    bitmap = page.render(scale=300/72)
    pil_image = bitmap.to_pil()
    out_path = os.path.join(output_dir, f"page_{i+1}.png")
    pil_image.save(out_path)
    print(f"Saved page {i+1}: {out_path} ({pil_image.size})")

pdf.close()
print("Done rendering all pages.")
