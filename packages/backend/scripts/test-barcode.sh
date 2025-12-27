#!/bin/bash

# Quick test script untuk barcode generator
# Usage: ./test-barcode.sh

echo "🧪 Testing Barcode Generator"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Change to backend directory
cd "$(dirname "$0")/.." || exit 1

# Test 1: Check if dependencies installed
echo -e "${BLUE}Test 1: Checking dependencies...${NC}"
if npm list bwip-js pdfkit &>/dev/null; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Dependencies missing${NC}"
    echo "Run: npm install bwip-js pdfkit"
    exit 1
fi
echo ""

# Test 2: Check if script exists
echo -e "${BLUE}Test 2: Checking script files...${NC}"
if [ -f "src/scripts/generateAllBarcodes.js" ]; then
    echo -e "${GREEN}✓ Script file exists${NC}"
else
    echo -e "${RED}✗ Script file missing${NC}"
    exit 1
fi
echo ""

# Test 3: Check if utility exists
echo -e "${BLUE}Test 3: Checking utility files...${NC}"
if [ -f "src/utils/barcodeGenerator.js" ]; then
    echo -e "${GREEN}✓ Utility file exists${NC}"
else
    echo -e "${RED}✗ Utility file missing${NC}"
    exit 1
fi
echo ""

# Test 4: Generate test barcode
echo -e "${BLUE}Test 4: Generating test barcode (batch mode)...${NC}"
if npm run generate:barcodes:batch &>/dev/null; then
    echo -e "${GREEN}✓ Barcode generation successful${NC}"
else
    echo -e "${RED}✗ Barcode generation failed${NC}"
    exit 1
fi
echo ""

# Test 5: Check output files
echo -e "${BLUE}Test 5: Checking output files...${NC}"
if [ -f "barcode-output/all_products_barcodes.pdf" ]; then
    FILE_SIZE=$(du -h "barcode-output/all_products_barcodes.pdf" | cut -f1)
    echo -e "${GREEN}✓ PDF file created (${FILE_SIZE})${NC}"
else
    echo -e "${RED}✗ PDF file not found${NC}"
    exit 1
fi
echo ""

# Summary
echo "================================"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "Generated files:"
find barcode-output -name "*.pdf" -type f 2>/dev/null | head -5
echo ""
echo "Total PDF files: $(find barcode-output -name "*.pdf" -type f | wc -l)"
echo "Total size: $(du -sh barcode-output/ | cut -f1)"
echo ""
echo "Try these commands:"
echo "  npm run generate:barcodes          # Generate all types"
echo "  npm run generate:barcodes:labels   # Generate label sheet"
echo "  npm run generate:barcodes:category # Generate by category"
