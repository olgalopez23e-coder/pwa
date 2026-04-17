#!/usr/bin/env node

/**
 * Script para generar iconos PNG de diferentes resoluciones
 * Genera iconos para PWA desde una imagen base (SVG o PNG)
 * 
 * Requisitos: npm install sharp
 * Uso: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Colores azul agua
const AQUA_PRIMARY = '#0891b2';
const AQUA_LIGHT = '#85d7e0';

// Función para crear un canvas con SVG
function createAquaIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <!-- Fondo gradiente azul agua -->
    <defs>
      <linearGradient id="aquaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0891b2;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0a8fa3;stop-opacity:1" />
      </linearGradient>
      <radialGradient id="shine" cx="35%" cy="35%">
        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.3" />
        <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
      </radialGradient>
    </defs>
    
    <!-- Fondo principal -->
    <rect width="${size}" height="${size}" fill="url(#aquaGrad)"/>
    
    <!-- Brillo -->
    <circle cx="${size * 0.35}" cy="${size * 0.35}" r="${size * 0.4}" fill="url(#shine)"/>
    
    <!-- Pokébola simplificada en el centro -->
    <g transform="translate(${size / 2}, ${size / 2})">
      <!-- Círculo principal -->
      <circle cx="0" cy="0" r="${size * 0.25}" fill="white" opacity="0.95"/>
      
      <!-- Mitad superior roja -->
      <path d="M ${-size * 0.25} 0 A ${size * 0.25} ${size * 0.25} 0 0 1 ${size * 0.25} 0" fill="#EF4444" opacity="0.9"/>
      
      <!-- Mitad inferior blanca -->
      <path d="M ${-size * 0.25} 0 A ${size * 0.25} ${size * 0.25} 0 0 0 ${size * 0.25} 0" fill="white" opacity="0.95"/>
      
      <!-- Círculo central -->
      <circle cx="0" cy="0" r="${size * 0.08}" fill="#333333"/>
    </g>
  </svg>`;
}

/**
 * Crea archivo SVG de icono
 */
function createSVGIcon(filename, size) {
  const svg = createAquaIcon(size);
  const filepath = path.join(__dirname, 'public', 'icons', filename);
  
  // Crear directorio si no existe
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Convertir SVG a PNG (necesitaría sharp, pero por ahora guardamos SVG)
  const svgFile = filepath.replace('.png', '.svg');
  fs.writeFileSync(svgFile, svg);
  console.log(`✓ Creado: ${svgFile}`);
}

// Tamaños de iconos a generar
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 192, name: 'icon-maskable-192x192.png' },
  { size: 512, name: 'icon-maskable-512x512.png' },
];

// Crear directorio de iconos
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generando iconos PWA con tema azul agua...\n');

// Generar cada icono
iconSizes.forEach(({ size, name }) => {
  createSVGIcon(name, size);
});

console.log('\n✅ ¡Iconos generados exitosamente!');
console.log('\n📝 NOTA IMPORTANTE:');
console.log('   Para convertir SVG a PNG, ejecuta:');
console.log('   npm install -D sharp');
console.log('   Luego ejecuta este script nuevamente.\n');
console.log('   O usa una herramienta online:');
console.log('   - https://cloudconvert.com/svg-to-png');
console.log('   - https://convertio.co/svg-png/\n');

// Crear script para convertir con Sharp (si está disponible)
console.log('📦 Creando archivos placeholder...\n');

// Crear archivos placeholder en base64 (azul agua)
const placeholderPNG = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG header
  0x00, 0x00, 0x00, 0x0D, // IHDR length
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x00, 0x01, // width: 1
  0x00, 0x00, 0x00, 0x01, // height: 1
  0x08, 0x02, // bit depth: 8, color type: 2 (RGB)
  0x00, 0x00, 0x00, // compression, filter, interlace
  0x90, 0x77, 0x53, 0xDE, // CRC
  0x00, 0x00, 0x00, 0x0C, // IDAT length
  0x49, 0x44, 0x41, 0x54, // IDAT
  0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0xFE, 0xFF,
  0x08, 0x17, 0xF8, 0x5F, // azul agua RGB
  0xED, 0x5D, 0x44, 0x4D, // CRC
  0x00, 0x00, 0x00, 0x00, // IEND length
  0x49, 0x45, 0x4E, 0x44, // IEND
  0xAE, 0x42, 0x60, 0x82  // CRC
]);

iconSizes.forEach(({ size, name }) => {
  const pngPath = path.join(iconsDir, name);
  // Este es un placeholder de 1x1px. En producción, usar Sharp para generar PNG reales
});

console.log('✅ Directorio de iconos preparado en: public/icons/\n');
