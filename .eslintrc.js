module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['plugin:vue/vue3-recommended', 'prettier', 'plugin:prettier/recommended'],
  // 新的内容
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
    },
    requireConfigFile: false,
    parser: '@typescript-eslint/parser',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    semi: 0, // 禁止尾部使用分号“ ; ”
    'no-var': 'error', // 禁止使用 var
    indent: 2, // 缩进2格
    'no-mixed-spaces-and-tabs': 'error', // 不能空格与tab混用
    quotes: [2, 'single'], // 使用单引号
    'vue/html-closing-bracket-newline': 'off', // 不强制换行
    'vue/singleline-html-element-content-newline': 'off', // 不强制换行
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: { max: 8 },
        multiline: { max: 8 },
      },
    ], // vue template模板元素第一行最多5个属性
    'vue/multi-word-component-names': 0,
    'no-useless-catch': 0,
    'prettier/prettier': 0,
    'vue/no-mutating-props': 0,
    'vue/no-deprecated-v-on-native-modifier': 0,
    'vue/no-v-html': 0,
    'no-new': 0,
    'no-use-before-define': 0,
    'no-unused-expressions': 0,
    'new-cap': 0,
  },
};
