const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const CONFIG = {
  inputDir: './images/tabbar',
  outputDir: './images',
  sizes: [
    { name: 'normal', width: 81, height: 81 },
    { name: 'retina', width: 162, height: 162 }
  ],
  quality: 100,
  density: 288
};

async function convertSvgToPng(svgPath, outputPath, size) {
  try {
    await sharp(svgPath)
      .resize(size.width, size.height)
      .png({ quality: CONFIG.quality, compressionLevel: 9 })
      .toFile(outputPath);
    
    return true;
  } catch (error) {
    console.error(chalk.red(`转换失败: ${svgPath} -> ${outputPath}`), error.message);
    return false;
  }
}

function getOutputFilename(inputFilename, isActive) {
  const baseName = path.basename(inputFilename, '.svg');
  
  const nameMap = {
    'home-normal': 'home',
    'home-active': 'home-active',
    'medication-normal': 'medication',
    'medication-active': 'medication-active',
    'records-normal': 'records',
    'records-active': 'records-active',
    'profile-normal': 'profile',
    'profile-active': 'profile-active'
  };
  
  return `${nameMap[baseName] || baseName}.png`;
}

async function main() {
  console.log(chalk.bold.blue('\n🎨 TabBar图标转换工具'));
  console.log(chalk.gray('='.repeat(50)));
  
  const inputDir = path.resolve(CONFIG.inputDir);
  const outputDir = path.resolve(CONFIG.outputDir);
  
  if (!await fs.exists(inputDir)) {
    console.error(chalk.red(`错误: 输入目录不存在: ${inputDir}`));
    process.exit(1);
  }
  
  await fs.ensureDir(outputDir);
  
  const svgFiles = (await fs.readdir(inputDir))
    .filter(file => file.endsWith('.svg'))
    .sort();
  
  if (svgFiles.length === 0) {
    console.warn(chalk.yellow('警告: 未找到SVG文件'));
    return;
  }
  
  console.log(chalk.cyan(`\n发现 ${svgFiles.length} 个SVG文件`));
  console.log(chalk.gray(`输入目录: ${inputDir}`));
  console.log(chalk.gray(`输出目录: ${outputDir}\n`));
  
  let successCount = 0;
  let failCount = 0;
  
  for (const svgFile of svgFiles) {
    const svgPath = path.join(inputDir, svgFile);
    const outputFilename = getOutputFilename(svgFile);
    const outputPath = path.join(outputDir, outputFilename);
    
    console.log(chalk.white(`处理: ${svgFile} -> ${outputFilename}`));
    
    const targetSize = CONFIG.sizes[1];
    const success = await convertSvgToPng(svgPath, outputPath, targetSize);
    
    if (success) {
      successCount++;
      console.log(chalk.green(`  ✓ 成功`));
      
      const stats = await fs.stat(outputPath);
      console.log(chalk.gray(`    尺寸: ${targetSize.width}×${targetSize.height}px | 大小: ${(stats.size / 1024).toFixed(2)}KB`));
    } else {
      failCount++;
    }
  }
  
  console.log(chalk.bold('\n' + '='.repeat(50)));
  console.log(chalk.bold(`转换完成! 成功: ${successCount}, 失败: ${failCount}`));
  
  if (failCount > 0) {
    console.log(chalk.yellow('\n⚠️  部分文件转换失败，请检查错误信息'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✨ 所有图标转换成功！现在可以更新 app.json 配置了。'));
  }
}

main().catch(error => {
  console.error(chalk.red('致命错误:'), error);
  process.exit(1);
});