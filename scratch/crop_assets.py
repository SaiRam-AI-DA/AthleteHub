import fitz
import os

pdf_path = r"C:\Users\Sai Ram\.gemini\antigravity\brain\f7cf8d87-9bbb-447d-bff2-974f2c2f90f7\.user_uploaded\media_1786666538951.pdf"
output_dir = "scratch_extracted"
os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)

# Extract Page 1 Header Logo
page1 = doc[0]
pix_logo = page1.get_pixmap(clip=fitz.Rect(0, 0, 960, 140), dpi=300)
pix_logo.save(os.path.join(output_dir, "university_logo_header.png"))
print("Extracted page 1 logo header.")

# Extract diagrams & screenshots
# We crop from y=110 to y=540 to keep the full diagrams and screenshots, while leaving room for native titles
crops = {
    7: "software_design.png",
    8: "database_design.png",
    9: "ui_design.png",
    10: "screenshot_dashboard.png",
    11: "screenshot_athletes.png",
    12: "screenshot_training.png",
    13: "screenshot_events.png"
}

for page_num, filename in crops.items():
    page = doc[page_num - 1] # 0-indexed
    # Crop from y=110 to y=540 to exclude the original slide title & grey top bar
    pix = page.get_pixmap(clip=fitz.Rect(0, 110, 960, 540), dpi=300)
    pix.save(os.path.join(output_dir, filename))
    print(f"Extracted page {page_num} -> {filename}")

doc.close()
print("All assets extracted successfully!")
