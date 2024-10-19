import stylistic from '@stylistic/eslint-plugin'
import withNuxt from './.playground/.nuxt/eslint.config.mjs'

export default withNuxt({
  plugins: { '@stylistic': stylistic },
  rules: {
    '@stylistic/indent': ['error', 2],
    'max-len': ['error', {
      code: 80,
      comments: 120,
      ignoreTemplateLiterals: true,
      tabWidth: 2
    }]
  }
})
