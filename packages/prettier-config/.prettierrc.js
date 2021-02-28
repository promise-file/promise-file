module.exports = {
  // Prettier Config consistent with JavaScript Standard Style (JSS)
  bracketSpacing: true,
  printWidth: 80,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false,

  // Config options that JSS has no explicit opinion on
  arrowParens: 'always',
  htmlWhitespaceSensitivity: 'css',
  jsxBracketSameLine: true,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  vueIndentScriptAndStyle: true,
  endOfLine: 'lf',
  overrides: [
    {
      files: ['package.json', 'package-lock.json', 'yarn.lock'],
      options: {
        tabWidth: 2,
        useTabs: false
      }
    },
    {
      files: ['*.markdown', '*.md'],
      options: {
        proseWrap: "preserve"
      }
    }
  ]
}
