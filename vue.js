/**
 * SealUI ESLint 规则
 * https://eslint.sealui.com
 *
 * 依赖版本：
 *     eslint ^5.3.0
 *     eslint-plugin-react ^7.12.4
 *     eslint-plugin-vue ^5.2.2
 *     vue-eslint-parser ^5.0.0
 *     babel-eslint ^10.0.1
 *     @typescript-eslint/eslint-plugin ^1.5.0
 *
 * @category 此规则属于哪种分类
 * @reason 为什么要开启（关闭）此规则
 * @fixable 支持自动修复
 */
module.exports = {
  extends: ['./index.js'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    // 设置 js 的解析器为 babel-eslint
    // https://github.com/mysticatea/vue-eslint-parser#-options
    parser: 'babel-eslint',
    ecmaVersion: 2019,
    // ECMAScript modules 模式
    sourceType: 'module',
    ecmaFeatures: {
      // 不允许 return 语句出现在 global 环境下
      globalReturn: false,
      // 开启全局 script 模式
      impliedStrict: true,
      jsx: true
    },
    // 即使没有 babelrc 配置文件，也使用 babel-eslint 来解析
    requireConfigFile: false,
    // 仅允许 import export 语句出现在模块的顶层
    allowImportExportEverywhere: false
  },
  plugins: ['vue']
}
