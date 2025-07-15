import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export interface ImageOptimizerOptions {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

export async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: ImageOptimizerOptions = {}
) {
  const {
    quality = 80,
    width,
    height,
    format = 'webp'
  } = options;

  try {
    let image = sharp(inputPath);

    // Resize if dimensions are specified
    if (width || height) {
      image = image.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert format and optimize
    switch (format) {
      case 'webp':
        image = image.webp({ quality });
        break;
      case 'avif':
        image = image.avif({ quality });
        break;
      case 'jpeg':
        image = image.jpeg({ quality, mozjpeg: true });
        break;
      case 'png':
        image = image.png({ compressionLevel: 9 });
        break;
    }

    await image.toFile(outputPath);
    
    // Get file sizes for comparison
    const originalStats = fs.statSync(inputPath);
    const optimizedStats = fs.statSync(outputPath);
    const savings = ((originalStats.size - optimizedStats.size) / originalStats.size) * 100;
    
    console.log(`Optimized ${path.basename(inputPath)}: ${originalStats.size} → ${optimizedStats.size} bytes (${savings.toFixed(1)}% savings)`);
    
    return {
      originalSize: originalStats.size,
      optimizedSize: optimizedStats.size,
      savings: savings
    };
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error);
    throw error;
  }
}

export async function optimizePublicImages() {
  const publicDir = path.join(process.cwd(), 'public');
  const imageExtensions = ['.png', '.jpg', '.jpeg'];
  
  const files = fs.readdirSync(publicDir)
    .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
    .filter(file => !file.includes('-optimized') && !file.includes('.webp') && !file.includes('.avif'));

  for (const file of files) {
    const inputPath = path.join(publicDir, file);
    const baseName = path.parse(file).name;
    
    // Create WebP version
    const webpPath = path.join(publicDir, `${baseName}-optimized.webp`);
    await optimizeImage(inputPath, webpPath, { format: 'webp', quality: 85 });
    
    // Create AVIF version for even better compression
    const avifPath = path.join(publicDir, `${baseName}-optimized.avif`);
    await optimizeImage(inputPath, avifPath, { format: 'avif', quality: 80 });
  }
}