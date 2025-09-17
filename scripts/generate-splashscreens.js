import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const splashscreensDir = join(publicDir, 'splashscreens');

// iOS device configurations
const devices = [
  // iPhone 5/SE (1st gen)
  { name: 'iphone5', width: 640, height: 1136, ratio: 2 },
  // iPhone 6/7/8/SE (2nd gen)
  { name: 'iphone6', width: 750, height: 1334, ratio: 2 },
  // iPhone 6+/7+/8+
  { name: 'iphoneplus', width: 1242, height: 2208, ratio: 3 },
  // iPhone X/XS/11 Pro
  { name: 'iphonex', width: 1125, height: 2436, ratio: 3 },
  // iPhone XR/11
  { name: 'iphonexr', width: 828, height: 1792, ratio: 2 },
  // iPhone XS Max/11 Pro Max
  { name: 'iphonexsmax', width: 1242, height: 2688, ratio: 3 },
  // iPad
  { name: 'ipad', width: 1536, height: 2048, ratio: 2 },
  // iPad Pro 10.5"
  { name: 'ipadpro1', width: 1668, height: 2224, ratio: 2 },
  // iPad Pro 11"
  { name: 'ipadpro2', width: 1668, height: 2388, ratio: 2 },
  // iPad Pro 12.9"
  { name: 'ipadpro3', width: 2048, height: 2732, ratio: 2 },
];

// Create a splash screen with the app's theme color and logo
async function createSplashScreen(device) {
  const { name, width, height, ratio } = device;
  const outputFile = join(splashscreensDir, `${name}_splash.png`);
  
  // Background color (dark theme)
  const backgroundColor = { r: 26, g: 26, b: 26, alpha: 1 };
  
  // Calculate logo size (40% of the smallest dimension)
  const logoSize = Math.min(width, height) * 0.4;
  
  // Create a new image with the specified background color
  const image = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: backgroundColor,
    },
  });
  
  try {
    // Try to add the app logo (if it exists)
    const logoPath = join(publicDir, 'pwa-512x512.png');
    const logo = await sharp(logoPath)
      .resize(Math.round(logoSize), Math.round(logoSize), {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();
    
    // Composite the logo onto the background
    await image
      .composite([
        {
          input: logo,
          gravity: 'center',
        },
      ])
      .png()
      .toFile(outputFile);
    
    console.log(`Generated ${name} splash screen (${width}x${height})`);
  } catch (error) {
    // If logo doesn't exist, just save the background
    await image.png().toFile(outputFile);
    console.log(`Generated ${name} splash screen without logo (${width}x${height})`);
  }
}

// Generate all splash screens
async function generateAllSplashScreens() {
  try {
    // Create splashscreens directory if it doesn't exist
    await mkdir(splashscreensDir, { recursive: true });
    
    // Generate splash screens for all devices
    await Promise.all(devices.map(device => createSplashScreen(device)));
    
    console.log('✅ All splash screens generated successfully!');
  } catch (error) {
    console.error('❌ Error generating splash screens:', error);
    process.exit(1);
  }
}

// Run the generator
generateAllSplashScreens();
