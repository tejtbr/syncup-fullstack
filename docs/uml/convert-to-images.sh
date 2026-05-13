#!/bin/bash

# SyncUp UML Diagrams - Batch Conversion Script
# Converts all .mmd files to PNG and SVG formats

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directory containing .mmd files
UML_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}SyncUp UML Diagrams - Conversion Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if mermaid-cli is installed
if ! command -v mmdc &> /dev/null; then
    echo -e "${RED}Error: mermaid-cli is not installed${NC}"
    echo ""
    echo "Install with:"
    echo "  npm install -g @mermaid-js/mermaid-cli"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ mermaid-cli found${NC}"
echo ""

# Count files
DIAGRAM_COUNT=$(find "$UML_DIR" -maxdepth 1 -name "*.mmd" -type f | wc -l)
echo -e "${BLUE}Found $DIAGRAM_COUNT diagram files${NC}"
echo ""

# Create subdirectories for images
mkdir -p "$UML_DIR/png"
mkdir -p "$UML_DIR/svg"

echo -e "${BLUE}Converting diagrams...${NC}"
echo ""

# Counter
COUNT=0

# Convert each .mmd file
for mmd_file in "$UML_DIR"/*.mmd; do
    if [ -f "$mmd_file" ]; then
        filename=$(basename "$mmd_file")
        basename="${filename%.mmd}"
        
        COUNT=$((COUNT + 1))
        
        echo -e "${GREEN}[$COUNT/$DIAGRAM_COUNT]${NC} Converting: $filename"
        
        # Convert to PNG
        mmdc -i "$mmd_file" -o "$UML_DIR/png/${basename}.png" 2>/dev/null
        echo -e "  ${GREEN}✓${NC} PNG created: png/${basename}.png"
        
        # Convert to SVG
        mmdc -i "$mmd_file" -o "$UML_DIR/svg/${basename}.svg" 2>/dev/null
        echo -e "  ${GREEN}✓${NC} SVG created: svg/${basename}.svg"
        
        echo ""
    fi
done

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Conversion completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Generated files:"
echo "  • PNG images: $UML_DIR/png/"
echo "  • SVG images: $UML_DIR/svg/"
echo ""
echo "View images:"
echo "  • Open PNG files in any image viewer"
echo "  • Open SVG files in web browser"
echo ""
