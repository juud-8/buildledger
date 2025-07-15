const { optimizePublicImages } = require('../lib/image-optimizer');

async function main() {
  try {
    console.log('Starting image optimization...');
    await optimizePublicImages();
    console.log('Image optimization completed!');
  } catch (error) {
    console.error('Error during image optimization:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}