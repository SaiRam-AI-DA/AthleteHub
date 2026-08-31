import fitz
import os

pdf_path = r"C:\Users\Sai Ram\.gemini\antigravity\brain\f7cf8d87-9bbb-447d-bff2-974f2c2f90f7\.user_uploaded\media_1786666538951.pdf"

if os.path.exists(pdf_path):
    doc = fitz.open(pdf_path)
    print(f"Total pages: {len(doc)}")
    for i in range(min(5, len(doc))):
        page = doc[i]
        print(f"Page {i+1} rect: {page.rect}")
else:
    print("PDF not found!")
