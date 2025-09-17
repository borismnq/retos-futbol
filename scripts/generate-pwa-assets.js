import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create public directory if it doesn't exist
const publicDir = join(__dirname, '../public');
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// Create a simple SVG as a base for the icon
const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#00b894"/>
  <path d="M256 128L300 256H350L256 384L162 256H212L256 128Z" fill="white"/>
  <circle cx="256" cy="256" r="32" fill="white"/>
</svg>
`;

async function generateAssets() {
  // Save SVG to a temporary file
  const tempSvgPath = join(publicDir, 'temp-icon.svg');
  writeFileSync(tempSvgPath, svg);

  // Generate different icon sizes using sharp
  const iconSizes = [
    // PWA icons
    { size: 192, name: 'pwa-192x192.png' },
    { size: 512, name: 'pwa-512x512.png' },
    // Windows tiles
    { size: 70, name: 'pwa-70x70.png' },
    { size: 150, name: 'pwa-150x150.png' },
    { size: 310, name: 'pwa-310x310.png' },
    { size: 310, height: 150, name: 'pwa-310x150.png' },
    // iOS icons
    { size: 180, name: 'pwa-180x180.png' },
    { size: 167, name: 'pwa-167x167.png' },
    { size: 152, name: 'pwa-152x152.png' },
    { size: 120, name: 'pwa-120x120.png' },
    { size: 87, name: 'pwa-87x87.png' },
    { size: 80, name: 'pwa-80x80.png' },
    { size: 76, name: 'pwa-76x76.png' },
    { size: 60, name: 'pwa-60x60.png' },
    { size: 58, name: 'pwa-58x58.png' },
    { size: 40, name: 'pwa-40x40.png' },
    { size: 29, name: 'pwa-29x29.png' },
    { size: 20, name: 'pwa-20x20.png' }
  ];
  
  try {
    // Generate icons
    for (const { size, height, name } of iconSizes) {
      const outputPath = join(publicDir, name);
      const resizeOptions = {
        width: size,
        height: height || size,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      };
      
      await sharp(tempSvgPath)
        .resize(resizeOptions)
        .toFile(outputPath);
      console.log(`Generated ${outputPath}`);
    }

    // Generate favicon with multiple sizes (16x16, 32x32, 48x48)
    const faviconSizes = [16, 32, 48];
    const faviconFiles = await Promise.all(
      faviconSizes.map(size => 
        sharp(tempSvgPath)
          .resize(size, size)
          .toBuffer()
      )
    );
    
    // Create ICO file with multiple sizes
    await sharp(faviconFiles[1]) // Use 32x32 as base
      .toFile(join(publicDir, 'favicon.ico'));
    console.log('Generated favicon.ico');
    
    // Generate apple-touch-icon (180x180) - iOS 11+
    await sharp(tempSvgPath)
      .resize(180, 180)
      .toFile(join(publicDir, 'apple-touch-icon.png'));
    console.log('Generated apple-touch-icon.png');
    
    // Generate Safari Pinned Tab icon
    await sharp(tempSvgPath)
      .resize(16, 16)
      .toFile(join(publicDir, 'safari-pinned-tab.svg'));
    console.log('Generated safari-pinned-tab.svg');
    
    // Generate maskable icon (for Android/Chrome)
    await sharp(tempSvgPath)
      .resize(512, 512)
      .toFile(join(publicDir, 'maskable-icon.png'));
    console.log('Generated maskable-icon.png');
    
    // Generate browserconfig.xml
    const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square70x70logo src="/pwa-70x70.png"/>
      <square150x150logo src="/pwa-150x150.png"/>
      <square310x310logo src="/pwa-310x310.png"/>
      <wide310x150logo src="/pwa-310x150.png"/>
      <TileColor>#1a1a1a</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
    
    writeFileSync(join(publicDir, 'browserconfig.xml'), browserConfig);
    console.log('Generated browserconfig.xml');

    // Clean up
    unlinkSync(tempSvgPath);
    
    console.log('\n✅ PWA assets generated successfully!');
    
  } catch (error) {
    console.error('Error generating PWA assets:', error);
    process.exit(1);
  }
}

generateAssets().catch(console.error);
