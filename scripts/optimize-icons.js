const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function optimizeImage(inputPath, outputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    
    await sharp(inputPath)
      .resize(metadata.width, metadata.height, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ 
        compressionLevel: 9,
        adaptiveFiltering: true,
        forceIHDR: true
      })
      .toFile(outputPath);
    
    const originalSize = (await fs.stat(inputPath)).size;
    const optimizedSize = (await fs.stat(outputPath)).size;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    return {
      success: true,
      originalSize,
      optimizedSize,
      reduction: `${reduction}%`
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log(chalk.bold.blue('\n🔧 图标优化工具'));
  console.log(chalk.gray('=' .repeat(50)));
  
  const imagesDir = path.resolve('./images');
  const pngFiles = (await fs.readdir(imagesDir))
    .filter(file => file.endsWith('.png') && !file.includes('-optimized'))
    .sort();
  
  if (pngFiles.length === 0) {
    console.warn(chalk.yellow('未找到PNG文件'));
    return;
  }
  
  console.log(chalk.cyan(`发现 ${pngFiles.length} 个PNG文件待优化\n`));
  
  let totalOriginal = 0;
  let totalOptimized = 0;
  
  for (const pngFile of pngFiles) {
    const inputPath = path.join(imagesDir, pngFile);
    const outputPath = path.join(imagesDir, pngFile.replace('.png', '-optimized.png'));
    
    process.stdout.write(chalk.white(`优化: ${pngFile}... `));
    
    const result = await optimizeImage(inputPath, outputPath);
    
    if (result.success) {
      totalOriginal += result.originalSize;
      totalOptimized += result.optimizedSize;
      console.log(chalk.green(`完成 (减少 ${result.reduction})`));
    } else {
      console.log(chalk.red(`失败: ${result.error}`));
    }
  }
  
  const totalReduction = ((totalOriginal - totalOptimized) / totalOriginal * 100).toFixed(1);
  
  console.log(chalk.bold('\n' + '='.repeat(50)));
  console.log(chalk.bold(`优化完成!`));
  console.log(chalk.gray(`原始大小: ${(totalOriginal / 1024).toFixed(2)}KB`));
  console.log(chalk.gray(`优化后大小: ${(totalOptimized / 1024).toFixed(2)}KB`));
  console.log(chalk.green(`总减少: ${totalReduction}%`));
  console.log(chalk.yellow('\n优化后的文件名后缀为 -optimized.png，请手动替换原文件'));
}

main().catch(error => {
  console.error(chalk.red('错误:'), error);
  process.exit(1);
});