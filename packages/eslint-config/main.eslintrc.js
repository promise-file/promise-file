const importExtensions = ['.js', '.jsx', '.mjs', '.ts', '.tsx', '.cjs']
const extensionsGlob = '{[jt]s?(x),[cm]js}'
module.exports = {
  plugins: ['babel', 'import', 'prettier', 'promise'],

  env: {
    commonjs: true,
    es6: true,
    node: true
  },

  // The default ESLint parser does not support type annotations.
  // `@babel/eslint-parser` is required to support Flowtype (if used) and the
  // babel plugin's rules.
  parser: '@babel/eslint-parser',

  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {
      /**
       * Even if _you_ aren't using JSX (or .jsx) directly, if your dependencies
       * define jsnext:main and have JSX internally, you may run into problems
       * if you don't enable `parserOptions.ecmaFeatures.jsx` setting at the top
       * level.
       *
       * @see {@link https://github.com/benmosher/eslint-plugin-import/blob/a55cd67dabae15ae6f95361e4452f46e0df69ebb/config/react.js}
       */
      jsx: true
    },
    sourceType: 'module',

    // @babel/eslint-parser specific options
    requireConfigFile: false
  },
  settings: {
    /**
     * > Adds `.jsx` as an extension, and enables JSX parsing.
     * >
     * > Even if _you_ aren't using JSX (or .jsx) directly, if your dependencies
     * > define jsnext:main and have JSX internally, you may run into problems
     * > if you don't enable these settings at the top level.
     *
     * `import/extensions to be set at the top level config`
     * @see {@link https://github.com/benmosher/eslint-plugin-import/blob/a55cd67dabae15ae6f95361e4452f46e0df69ebb/config/react.js}
     */
    'import/extensions': importExtensions,
    react: {
      version: 'detect'
    }
  },

  rules: {
    // Turn off rules that have a babel equivalent
    quotes: 0,
    camelcase: 'off',
    'new-cap': 'off',
    'no-invalid-this': 'off',
    'no-unused-expressions': 'off',
    'object-curly-spacing': 'off',
    semi: 'off',
    'valid-typeof': 'off',

    // Enable babel rules that don't conflict with prettier. Set values that are
    // consistent with JavaScript Standard Style where needed.
    // https://github.com/prettier/eslint-config-prettier/blob/main/babel.js

    'babel/camelcase': ['error', { properties: 'never' }],
    'babel/new-cap': [
      'error',
      { newIsCap: true, capIsNew: false, properties: true }
    ],
    'babel/no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true
      }
    ],

    // JSS = 'babel/object-curly-spacing': ['error', 'always'], but it is turned
    // off so as not to conflict with Prettier.
    'babel/object-curly-spacing': 'off',
    'babel/quotes': [
      // 'single'|'double' MUST be consistent with the relevant Prettier option.
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: false }
    ],

    // JSS = 'babel/semi': ['error', 'never'], but it is turned off so as not to
    // conflict with Prettier.
    'babel/semi': 'off',
    'babel/valid-typeof': ['error', { requireStringLiterals: true }],

    // Additional Preferences
    'jsx-quotes': ['error', 'prefer-double'],
    'prettier/prettier': [
      'error',
      {},

      /*
       * > Note: While it is possible to pass options to Prettier via your
       * > ESLint configuration file, it is not recommended because editor
       * > extensions such as `prettier-atom` and `prettier-vscode` will read
       * > `.prettierrc`, but won't read settings from ESLint [or
       * > `package.json`'s `prettier` property], which can lead to an
       * > inconsistent experience.
       * >
       * > _source: <https://github.com/prettier/eslint-plugin-prettier/tree/8614c458ed284bc126034d432b49b07d7d67ef06#options>_
       *
       * This is currently `true` by default. We set it explcitly to avoid the
       * potential for conflicts, should the plugin ever decide to change the
       * default value.
       */
      {
        usePrettierrc: true
      }
    ]
  },

  // https://eslint.org/docs/user-guide/configuring/configuration-files#configuration-based-on-glob-patterns
  // -   The patterns are applied against the file path relative to the
  //     directory of the [eslint] config file.
  // -   Multiple overrides within the same config are applied in order. That
  //     is, the last override block in a config file always has the highest
  //     precedence.
  overrides: [
    {
      files: '**/*.ts?(x)',
      // extends: ['prettier/@typescript-eslint'],
      plugins: ['@typescript-eslint'],
      parser: '@typescript-eslint/parser',

      parserOptions: {
        ecmaVersion: 2020,
        ecmaFeatures: {
          jsx: true
        },
        sourceType: 'module',

        // typescript-eslint specific options
        warnOnUnsupportedTypeScriptVersion: true
      },
      rules: {
        // ---------------------------------------------------------------------
        // Disable core & babel rules with better alternatives through
        // typescript's compiler or typescript's eslint plugin.
        'babel/quotes': 0,
        quotes: 0,
        '@typescript-eslint/quotes': [
          // 'single'|'double' MUST be consistent with the relevant Prettier
          // config.
          'error',
          'single',
          { avoidEscape: true, allowTemplateLiterals: false }
        ],

        'babel/no-unused-expressions': 'off',
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': [
          'error',
          {
            allowShortCircuit: true,
            allowTernary: true,
            allowTaggedTemplates: true
          }
        ],

        // Not currently used, but if it were (such as by a consumer), it should
        // be unset in favor of the equivalent `@typescript-eslint/*` rule.
        'babel/no-invalid-this': 'off',
        'no-invalid-this': 'off',
        // '@typescript-eslint/no-invalid-this': ['error'],

        // Just in case Prettier isn't being used, turn the following rules off
        // in favor of the equivalent `@typescript-eslint/*` rule

        // JSS = '@typescript-eslint/object-curly-spacing': ['error', 'always'],
        // but it is turned off so as not to conflict with Prettier.
        'babel/object-curly-spacing': 'off',
        'object-curly-spacing': 'off',
        '@typescript-eslint/object-curly-spacing': 'off',

        // JSS = '@typescript-eslint/semi': ['error', 'never'], but it is turned
        // off so as not to conflict with Prettier.
        'babel/semi': 'off',
        semi: 'off',
        '@typescript-eslint/semi': 'off',

        // ---------------------------------------------------------------------

        // TypeScript's `noFallthroughCasesInSwitch` option is more robust (#6906)
        'default-case': 'off',

        // 'tsc' already handles `no-dupe-class-members` (https://github.com/typescript-eslint/typescript-eslint/issues/291)
        'no-dupe-class-members': 'off',

        // 'tsc' already handles `no-undef` (https://github.com/typescript-eslint/typescript-eslint/issues/477)
        'no-undef': 'off',

        // ---------------------------------------------------------------------
        // Add TypeScript specific rules (set to JSS values where relevant.)
        '@typescript-eslint/consistent-type-assertions': 'error',

        // ---------------------------------------------------------------------
        // turn off ESLint equivalent rules that haven't been handled above with
        // babel variants.

        'no-array-constructor': 'off',
        '@typescript-eslint/no-array-constructor': 'error',

        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': [
          'error',
          {
            // ESLint Options
            functions: false,
            classes: false,
            variables: false,

            // TypeScript Options
            typedefs: false
          }
        ],

        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            args: 'none',
            ignoreRestSiblings: true,
            vars: 'all'
          }
        ],

        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 'error'
      }
    },

    // Test Files
    {
      files: [`**/*.test.${extensionsGlob}`],
      env: {
        // https://eslint.org/docs/2.0.0/user-guide/configuring#specifying-environments
        jest: true
      }
    }
  ]
}
