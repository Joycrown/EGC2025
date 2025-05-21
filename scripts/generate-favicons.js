const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Paths
const logoPath = path.join(__dirname, '../public/images/GofamintLogo.png');
const publicDir = path.join(__dirname, '../public');

async function generateFavicons() {
  try {
    console.log('Starting favicon generation...');
    
    // Ensure the logo exists
    if (!fs.existsSync(logoPath)) {
      console.error('Logo file not found at:', logoPath);
      return;
    }

    // Generate favicon.ico (multi-size ICO file)
    await sharp(logoPath)
      .resize(32, 32)
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    
    // Create 16x16 favicon
    await sharp(logoPath)
      .resize(16, 16)
      .toFile(path.join(publicDir, 'favicon-16x16.png'));
    
    // Create apple-touch-icon (180x180)
    await sharp(logoPath)
      .resize(180, 180)
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
    // Create larger icons for different purposes
    const sizes = [192, 512];
    for (const size of sizes) {
      await sharp(logoPath)
        .resize(size, size)
        .toFile(path.join(publicDir, `icon-${size}x${size}.png`));
    }
    
    console.log('Favicon generation complete!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generateFavicons();
