// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettier from 'eslint-plugin-prettier'

export default withNuxt(
  // Prettier integration - disables conflicting ESLint rules
  eslintConfigPrettier,

  // Your custom configs here
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      // Show prettier errors as ESLint errors
      'prettier/prettier': 'error',
    },
  }
)
