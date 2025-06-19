#!/usr/bin/env python3
import sys
import os
sys.path.append('src')
from pdf_extractor import PDFExtractor

# Create extractor and examine raw text
pdf_path = 'temp/graphics.pdf'
if os.path.exists(pdf_path):
    extractor = PDFExtractor(pdf_path)
    
    # Get raw text
    import fitz
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        page_text = page.get_text()
        if page_text.strip():
            text += page_text
    
    if not text.strip():
        print("Using OCR...")
        text = extractor._extract_text_with_ocr(doc)
    
    doc.close()
    
    print("=== FIRST 1500 CHARACTERS OF RAW TEXT ===")
    print(repr(text[:1500]))
    
    print("\n=== LOOKING FOR GROUP-A SECTION ===")
    import re
    group_a_patterns = ['Group-A', 'Group A', 'GROUP-A', 'GROUP A', 'Group - A']
    found = False
    for pattern in group_a_patterns:
        pos = text.upper().find(pattern.upper())
        if pos != -1:
            print(f'Found "{pattern}" at position {pos}')
            print(f'Context around Group-A (300 chars):')
            start = max(0, pos - 100)
            end = min(len(text), pos + 200)
            print(repr(text[start:end]))
            found = True
            break
    
    if not found:
        print('No Group-A section found')
        # Look for any "Group" text
        group_pos = text.upper().find('GROUP')
        if group_pos != -1:
            print(f'Found "GROUP" at position {group_pos}')
            start = max(0, group_pos - 50)
            end = min(len(text), group_pos + 150)
            print(f'Context: {repr(text[start:end])}')
    
    print("\n=== LOOKING FOR NUMBERED PATTERNS ===")
    # Look for various numbering patterns
    patterns = [r'\d+\.', r'\d+\)', r'^\d+', r'\(\d+\)']
    for pattern in patterns:
        matches = re.findall(pattern, text, re.MULTILINE)
        if matches:
            print(f'Pattern "{pattern}": {matches[:10]}')  # First 10 matches
else:
    print(f"PDF file not found: {pdf_path}")
