#!/bin/bash

# Generates a JavaScript array of all images in the assets/epk directory
echo "Generating EPK image list..."

echo "const epkImages = [" > epk_images.js
for file in assets/epk/*; do
  if [ -f "$file" ]; then
    # Escape quotes if any, and write the filename
    filename=$(basename "$file")
    echo "  \"$filename\"," >> epk_images.js
  fi
done
echo "];" >> epk_images.js

echo "✅ epk_images.js created with latest images."
