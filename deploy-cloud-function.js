const ci = require('miniprogram-ci')
const path = require('path')

const projectPath = path.resolve(__dirname)
const appId = 'wx065c8a76c8b0f9b7'

async function deployCloudFunction(functionName) {
  console.log(`\n🚀 开始部署云函数: ${functionName}`)
  console.log('=' .repeat(50))

  try {
    const project = new ci.Project({
      appid: appId,
      type: 'miniProgram',
      projectPath: projectPath,
      privateKeyPath: path.join(__dirname, 'private.key'),
      ignores: ['node_modules/**/*']
    })

    console.log(`📦 正在上传云函数 ${functionName}...`)

    await ci.upload({
      project,
      version: '1.0.0',
      desc: `部署云函数 ${functionName}`,
      setting: {
        es6: true,
        es7: true,
        minify: true,
        codeProtect: false,
        autoPrefixWXSS: true
      },
      onProgressUpdate: console.log,
      robot: 1
    })

    console.log(`✅ 云函数 ${functionName} 部署成功！`)
    return true

  } catch (error) {
    console.error(`❌ 部署失败:`, error.message)
    
    if (error.message.includes('privateKeyPath')) {
      console.log('\n💡 提示：需要配置私钥文件')
      console.log('1. 登录微信公众平台 (mp.weixin.qq.com)')
      console.log('2. 进入 开发 → 开发设置 → 小程序代码上传')
      console.log('3. 生成并下载密钥文件，重命名为 private.key')
      console.log('4. 将 private.key 放到项目根目录\n')
    }
    
    return false
  }
}

async function main() {
  const functionName = process.argv[2]

  if (!functionName || functionName === 'all') {
    const functions = ['login', 'sendReminder']
    console.log(`📋 将要部署的云函数: ${functions.join(', ')}`)
    
    for (const func of functions) {
      await deployCloudFunction(func)
    }
  } else {
    await deployCloudFunction(functionName)
  }

  console.log('\n' + '='.repeat(50))
  console.log('🎉 部署流程完成！')
  console.log('\n下一步操作:')
  console.log('1. 打开微信开发者工具')
  console.log('2. 确认云函数已更新（查看云开发控制台）')
  console.log('3. 测试订阅消息功能')
  console.log('\n测试方法:')
  console.log('- 设置一个2分钟后的提醒')
  console.log('- 允许订阅消息授权')
  console.log('- 查看微信服务通知是否收到消息')
}

main().catch(console.error)
