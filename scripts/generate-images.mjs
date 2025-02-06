import fs from 'fs/promises';
import sharp from 'sharp';
import { optimize } from 'svgo';
import path from 'path';

const FAVICON_SIZES = [16, 32, 48, 96, 144, 192, 512];
const PUBLIC_DIR = 'public';

async function generateImages() {
  try {
    // Read and optimize SVG files
    const faviconSvg = await fs.readFile('public/favicon.svg', 'utf8');
    const ogImageSvg = await fs.readFile('public/og-image.svg', 'utf8');

    const optimizedFavicon = optimize(faviconSvg, {
      multipass: true,
    });

    const optimizedOgImage = optimize(ogImageSvg, {
      multipass: true,
    });

    // Save optimized SVGs
    await fs.writeFile(
      path.join(PUBLIC_DIR, 'icon.svg'),
      optimizedFavicon.data
    );
    await fs.writeFile(
      path.join(PUBLIC_DIR, 'safari-pinned-tab.svg'),
      optimizedFavicon.data
    );

    // Generate PNG favicons
    for (const size of FAVICON_SIZES) {
      await sharp(Buffer.from(optimizedFavicon.data))
        .resize(size, size)
        .png()
        .toFile(path.join(PUBLIC_DIR, `favicon-${size}x${size}.png`));
    }

    // Generate special sizes
    await sharp(Buffer.from(optimizedFavicon.data))
      .resize(180, 180)
      .png()
      .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));

    await sharp(Buffer.from(optimizedFavicon.data))
      .resize(192, 192)
      .png()
      .toFile(path.join(PUBLIC_DIR, 'android-chrome-192x192.png'));

    await sharp(Buffer.from(optimizedFavicon.data))
      .resize(512, 512)
      .png()
      .toFile(path.join(PUBLIC_DIR, 'android-chrome-512x512.png'));

    // Generate maskable icon
    await sharp(Buffer.from(optimizedFavicon.data))
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 59, g: 130, b: 246, alpha: 1 }, // #3B82F6
      })
      .png()
      .toFile(path.join(PUBLIC_DIR, 'maskable-icon.png'));

    // Generate ICO file (combines 16x16, 32x32, and 48x48)
    const icoSizes = [16, 32, 48];
    const icoBuffers = await Promise.all(
      icoSizes.map(size =>
        sharp(Buffer.from(optimizedFavicon.data))
          .resize(size, size)
          .png()
          .toBuffer()
      )
    );

    await sharp(icoBuffers[1]) // Use 32x32 as base
      .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));

    // Generate OG image
    await sharp(Buffer.from(optimizedOgImage.data))
      .resize(1200, 630)
      .png()
      .toFile(path.join(PUBLIC_DIR, 'og-image.png'));

    console.log('✅ All images generated successfully!');
  } catch (error) {
    console.error('Error generating images:', error);
    process.exit(1);
  }
}

generateImages(); 