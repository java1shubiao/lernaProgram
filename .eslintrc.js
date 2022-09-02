// .eslintrc.js

// eslint-define-config可以帮助我们做语法提示
const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
  // ESLint 一旦发现配置文件中有 "root": true，它就会停止在父级目录中寻找。
  root: true,
  // 指定脚本的运行环境。每种环境都有一组特定的预定义全局变量。
  env: {
    browser: true,
    es2021: true
  },
  globals: {
    uni: true,
    wx: true,
    tt: true,
    JSX: true
  },
  // 启用的规则
  extends: ['plugin:vue/vue3-recommended', 'standard'],
  parserOptions: {
    // js的版本
    ecmaVersion: 13,
    // 解析器
    parser: '@typescript-eslint/parser',
    // 模块化方案
    sourceType: 'module'
  },
  // 引用的插件  下载的插件去掉eslint-plugin-前缀引入
  plugins: ['vue', '@typescript-eslint', 'import', 'node', 'promise'],
  // 自定义规则
  rules: {
    semi: 'off',
    'space-before-function-paren': 'off',
    'func-call-spacing': 'off',
    'vue/html-self-closing': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/max-attributes-per-line': 'off',
    'no-use-before-define': 'off',
    'no-useless-return': 'off',
    'prefer-promise-reject-errors': 'off',
    'no-template-curly-in-string': 'off',
    'node/no-callback-literal': 'off',
    // ? 禁用eslint对未使用值的校验, 但是需打开ts-eslint中对未使用值的校验, 防止enum校验出错
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        classes: true,
        functions: false,
        typedefs: false
      }
    ]
  }
});
