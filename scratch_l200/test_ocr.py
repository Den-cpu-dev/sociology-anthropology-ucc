import pytesseract
from PIL import Image

try:
    # Try doing OCR on page 1
    img = Image.open(r"c:\Users\kosne\OneDrive\Desktop\of all\scratch_l200\pages\page_1.png")
    text = pytesseract.image_to_string(img)
    print("OCR Result:")
    print(text[:500])
except Exception as e:
    print("Error:", e)
