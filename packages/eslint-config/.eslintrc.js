const mainrc = require('./main.eslintrc')

const typescriptOverrideFiles = '**/*.ts?(x)'
const typescriptOverride = mainrc.overrides.find((override) => {
  return override.files === typescriptOverrideFiles
})

module.exports = {
  // ORDER IS IMPORTANT, Prettier must be last.
  extends: ['standard', './main.eslintrc.js', 'prettier'],
  // Preserve rules that are carefully set with Prettier in mind
  rules: {
    'babel/quotes': mainrc.rules['babel/quotes']
  },
  overrides: [
    {
      files: typescriptOverrideFiles,
      rules: {
        '@typescript-eslint/quotes':
          typescriptOverride.rules['@typescript-eslint/quotes']
      }
    }
  ]
}
