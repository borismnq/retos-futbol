import { writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const manifestPath = join(publicDir, 'manifest.json');

const manifest = {
  "name": "Retos Fútbol",
  "short_name": "RetosFutbol",
  "description": "App de retos de fútbol",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#1a1a1a",
  "orientation": "portrait",
  "categories": ["sports", "soccer", "football", "games"],
  "icons": [
    {
      "src": "/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "monochrome"
    }
  ],
  "shortcuts": [
    {
      "name": "Nuevo Reto",
      "short_name": "Nuevo",
      "description": "Crear un nuevo reto",
      "url": "/nuevo-reto",
      "icons": [{ "src": "/pwa-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Mis Retos",
      "short_name": "Retos",
      "description": "Ver mis retos",
      "url": "/mis-retos",
      "icons": [{ "src": "/pwa-192x192.png", "sizes": "192x192" }]
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/screenshot1.png",
      "type": "image/png",
      "sizes": "1080x1920",
      "form_factor": "narrow",
      "label": "Pantalla de inicio de Retos Fútbol"
    }
  ],
  "prefer_related_applications": false,
  "id": "/"
};

async function generateManifest() {
  try {
    // Ensure public directory exists
    await mkdir(publicDir, { recursive: true });
    
    // Write the manifest file
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log('✅ Manifest file generated successfully!');
  } catch (error) {
    console.error('❌ Error generating manifest file:', error);
    process.exit(1);
  }
}

// Run the generator
generateManifest();
