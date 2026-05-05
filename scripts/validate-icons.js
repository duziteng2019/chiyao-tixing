const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const REQUIREMENTS = {
  maxWidth: 200,
  maxHeight: 200,
  minWidth: 40,
  minHeight: 40,
  format: 'png',
  maxSizeKB: 100
};

async function validateIcon(filePath) {
  const errors = [];
  const warnings = [];
  
  try {
    const metadata = await sharp(filePath).metadata();
    const stats = await fs.stat(filePath);
    
    const fileName = path.basename(filePath);
    
    if (metadata.format !== REQUIREMENTS.format) {
      errors.push(`格式错误: 需要 ${REQUIREMENTS.format}, 实际 ${metadata.format}`);
    }
    
    if (metadata.width > REQUIREMENTS.maxWidth || metadata.height > REQUIREMENTS.maxHeight) {
      errors.push(`尺寸过大: ${metadata.width}×${metadata.height}px (最大 ${REQUIREMENTS.maxWidth}×${REQUIREMENTS.maxHeight}px)`);
    }
    
    if (metadata.width < REQUIREMENTS.minWidth || metadata.height < REQUIREMENTS.minHeight) {
      warnings.push(`尺寸偏小: ${metadata.width}×${metadata.height}px (建议最小 ${REQUIREMENTS.minWidth}×${REQUIREMENTS.minHeight}px)`);
    }
    
    const sizeKB = stats.size / 1024;
    if (sizeKB > REQUIREMENTS.maxSizeKB) {
      warnings.push(`文件较大: ${sizeKB.toFixed(2)}KB (建议小于 ${REQUIREMENTS.maxSizeKB}KB)`);
    }
    
    const hasAlpha = metadata.hasAlpha !== false;
    if (!hasAlpha) {
      errors.push(`缺少透明通道: TabBar图标需要透明背景`);
    }
    
    return {
      valid: errors.length === 0,
      fileName,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      sizeKB: sizeKB.toFixed(2),
      hasAlpha,
      errors,
      warnings
    };
    
  } catch (error) {
    return {
      valid: false,
      fileName: path.basename(filePath),
      error: `无法读取文件: ${error.message}`,
      errors: [`读取失败: ${error.message}`],
      warnings: []
    };
  }
}

async function main() {
  console.log(chalk.bold.blue('\n✅ 图标验证工具'));
  console.log(chalk.gray('=' .repeat(60)));
  console.log(chalk.cyan('检查TabBar图标是否符合微信小程序规范\n'));
  
  const imagesDir = path.resolve('./images');
  const expectedIcons = [
    'home.png', 'home-active.png',
    'medication.png', 'medication-active.png',
    'records.png', 'records-active.png',
    'profile.png', 'profile-active.png'
  ];
  
  let allValid = true;
  let passedCount = 0;
  let failedCount = 0;
  
  for (const iconFile of expectedIcons) {
    const iconPath = path.join(imagesDir, iconFile);
    
    console.log(chalk.bold.white(`\n📱 ${iconFile}`));
    
    if (!await fs.exists(iconPath)) {
      console.error(chalk.red(`  ❌ 文件不存在`));
      allValid = false;
      failedCount++;
      continue;
    }
    
    const result = await validateIcon(iconPath);
    
    if (result.valid) {
      console.log(chalk.green(`  ✅ 通过验证`));
      passedCount++;
      
      console.log(chalk.gray(`     尺寸: ${result.width}×${result.height}px`));
      console.log(chalk.gray(`     格式: ${result.format.toUpperCase()}`));
      console.log(chalk.gray(`     大小: ${result.sizeKB}KB`));
      console.log(chalk.gray(`     透明: ${result.hasAlpha ? '是' : '否'}`));
    } else {
      console.log(chalk.red(`  ❌ 验证失败`));
      allValid = false;
      failedCount++;
    }
    
    if (result.errors.length > 0) {
      result.errors.forEach(err => console.log(chalk.red(`     错误: ${err}`)));
    }
    
    if (result.warnings.length > 0) {
      result.warnings.forEach(warn => console.log(chalk.yellow(`     警告: ${warn}`)));
    }
  }
  
  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold(`验证结果: ${passedCount} 通过, ${failedCount} 失败`));
  
  if (allValid) {
    console.log(chalk.green('\n🎉 所有图标符合要求！可以安全使用。'));
  } else {
    console.log(chalk.red('\n⚠️  部分图标存在问题，请修复后重新验证。'));
    process.exit(1);
  }
}

main().catch(error => {
  console.error(chalk.red('致命错误:'), error);
  process.exit(1);
});