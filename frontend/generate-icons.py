#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import io
from PIL import Image, ImageDraw
import sys

# Colores azul agua
AQUA_PRIMARY = (8, 145, 178)      # #0891b2
AQUA_DARK = (10, 143, 163)        # #0a8fa3
AQUA_LIGHT = (133, 215, 224)      # #85d7e0
WHITE = (255, 255, 255)
RED = (239, 68, 68)               # Rojo pokébola
GRAY = (51, 51, 51)               # Centro pokébola

def create_aqua_icon(size):
    """Crea un icono con tema azul agua y pokébola simplificada"""
    
    # Crear imagen con fondo blanco
    img = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Fondo gradiente (simulado con rectángulos)
    step = size // 100 if size > 100 else 1
    for i in range(0, size, step):
        # Interpolación de color (azul principal a azul oscuro)
        ratio = i / size
        r = int(AQUA_PRIMARY[0] * (1 - ratio) + AQUA_DARK[0] * ratio)
        g = int(AQUA_PRIMARY[1] * (1 - ratio) + AQUA_DARK[1] * ratio)
        b = int(AQUA_PRIMARY[2] * (1 - ratio) + AQUA_DARK[2] * ratio)
        
        draw.rectangle(
            [i, 0, min(i + step, size), size],
            fill=(r, g, b)
        )
    
    # Brillo (shine)
    shine_size = size // 3
    shine_x = int(size * 0.35)
    shine_y = int(size * 0.35)
    for r in range(shine_size, 0, -2):
        alpha = max(0, 50 - (r * 50 // shine_size))
        draw.ellipse(
            [shine_x - r, shine_y - r, shine_x + r, shine_y + r],
            fill=(255, 255, 255, alpha)
        )
    
    # Dibujar pokébola en centro
    center_x = size // 2
    center_y = size // 2
    poke_radius = size // 4
    
    # Círculo principal blanco
    draw.ellipse(
        [center_x - poke_radius, center_y - poke_radius,
         center_x + poke_radius, center_y + poke_radius],
        fill=WHITE
    )
    
    # Mitad superior roja
    draw.pieslice(
        [center_x - poke_radius, center_y - poke_radius,
         center_x + poke_radius, center_y + poke_radius],
        -90, 90,
        fill=RED
    )
    
    # Mitad inferior blanca
    draw.pieslice(
        [center_x - poke_radius, center_y - poke_radius,
         center_x + poke_radius, center_y + poke_radius],
        90, 270,
        fill=WHITE
    )
    
    # Círculo central gris
    center_radius = poke_radius // 3
    draw.ellipse(
        [center_x - center_radius, center_y - center_radius,
         center_x + center_radius, center_y + center_radius],
        fill=GRAY
    )
    
    return img

def create_maskable_icon(size):
    """Crea un icono para Android Adaptive (maskable)
    
    Para sistemas que aplican mask/lente a los iconos,
    el contenido importante debe estar en el círculo central.
    """
    
    # Crear con más padding seguro
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Fondo principal (círculo que ocupa 80% del tamaño)
    safe_radius = int(size * 0.4)
    center = size // 2
    
    # Dibujar círculo con gradiente (simulado)
    for r in range(safe_radius, 0, -1):
        ratio = r / safe_radius
        r_color = int(AQUA_PRIMARY[0] * (1 - ratio * 0.2))
        g_color = int(AQUA_PRIMARY[1] * (1 - ratio * 0.2))
        b_color = int(AQUA_PRIMARY[2] * (1 - ratio * 0.2))
        
        draw.ellipse(
            [center - r, center - r, center + r, center + r],
            fill=(r_color, g_color, b_color)
        )
    
    # Pokébola en centro
    poke_radius = safe_radius // 2
    
    # Círculo blanco principal
    draw.ellipse(
        [center - poke_radius, center - poke_radius,
         center + poke_radius, center + poke_radius],
        fill=WHITE
    )
    
    # Mitad roja
    draw.pieslice(
        [center - poke_radius, center - poke_radius,
         center + poke_radius, center + poke_radius],
        -90, 90,
        fill=RED
    )
    
    # Centro
    center_rad = poke_radius // 2.5
    draw.ellipse(
        [center - center_rad, center - center_rad,
         center + center_rad, center + center_rad],
        fill=GRAY
    )
    
    return img

def main():
    """Función principal"""
    
    # Crear directorio
    icons_dir = 'public/icons'
    os.makedirs(icons_dir, exist_ok=True)
    
    print('🎨 Generando iconos PWA tema azul agua...\n')
    
    # Tamaños a generar
    sizes = [
        (72, 'icon-72x72.png', False),
        (96, 'icon-96x96.png', False),
        (128, 'icon-128x128.png', False),
        (144, 'icon-144x144.png', False),
        (152, 'icon-152x152.png', False),
        (192, 'icon-192x192.png', False),
        (384, 'icon-384x384.png', False),
        (512, 'icon-512x512.png', False),
        (192, 'icon-maskable-192x192.png', True),
        (512, 'icon-maskable-512x512.png', True),
    ]
    
    # Generar cada icono
    for size, filename, is_maskable in sizes:
        try:
            if is_maskable:
                img = create_maskable_icon(size)
            else:
                img = create_aqua_icon(size)
            
            filepath = os.path.join(icons_dir, filename)
            img.save(filepath, 'PNG')
            
            icon_type = 'maskable' if is_maskable else 'standard'
            print(f'✅ {size:3}x{size:<3} ({icon_type:8}) → {filename}')
            
        except Exception as e:
            print(f'❌ Error creando {filename}: {e}')
    
    print(f'\n✅ ¡Iconos generados exitosamente en {icons_dir}/!\n')
    print('📊 Resumen:')
    print(f'  • 8 iconos standard (72x72 → 512x512)')
    print(f'  • 2 iconos maskable (Android Adaptive)')
    print(f'  • Color: Azul agua (#0891b2)')
    print(f'  • Total: 10 iconos en diferentes resoluciones\n')
    
    print('🚀 Próximos pasos:')
    print('   1. npm run dev')
    print('   2. Abrir DevTools → Application → Manifest')
    print('   3. Verificar que los iconos aparecen\n')

if __name__ == '__main__':
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print('❌ Se requiere Pillow instalado')
        print('   Instala con: pip install pillow\n')
        sys.exit(1)
    
    main()
