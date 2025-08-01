const sharp = require('sharp');
const glob = require('glob');
const fs = require('fs').promises;
const path = require('path');

// This script finds all .jpg files in the src/assets directory,
// converts them to .webp format, and saves them in the same directory.

const imageSourcePath = 'src/assets/**/*.jpg';
const outputQuality = 80; // Quality setting for WebP (1-100)

async function convertImages() {
  console.log('Starting image conversion to WebP...');

  try {
    const files = glob.sync(imageSourcePath);
    if (files.length === 0) {
      console.log('No .jpg images found to convert.');
      return;
    }

    let convertedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
      const dir = path.dirname(file);
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      const webpPath = path.join(dir, `${baseName}.webp`);

      // Check if the WebP version already exists
      try {
        await fs.access(webpPath);
        // console.log(`Skipping: ${webpPath} already exists.`);
        skippedCount++;
        continue; // Skip to the next file
      } catch (error) {
        // File doesn't exist, so we can convert it
      }

      console.log(`Converting: ${file}`);
      
      await sharp(file)
        .webp({ quality: outputQuality })
        .toFile(webpPath);
      
      convertedCount++;
    }

    console.log('\n--- Conversion Summary ---');
    console.log(`Successfully converted: ${convertedCount} images.`);
    console.log(`Skipped (already exist): ${skippedCount} images.`);
    console.log('--------------------------');

  } catch (error) {
    console.error('An error occurred during image conversion:', error);
  }
}

convertImages();
