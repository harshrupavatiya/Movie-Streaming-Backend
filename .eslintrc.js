export default 
// {
//   root: true,
//   parser: '@typescript-eslint/parser',
//   parserOptions: {
//     ecmaVersion: 'latest',
//     sourceType: 'module',
//   },
//   env: {
//     node: true,
//     es2021: true,
//   },
//   extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
//   plugins: ['@typescript-eslint'],
//   rules: {
//     '@typescript-eslint/no-unused-vars': 'warn',
//     '@typescript-eslint/explicit-function-return-type': 'off',
//   },
// };
{
  "env": {
    es2021: true,
    node: true
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  rules: {
    '@typescript-eslint/explicit-function-return-type': "error",
    '@typescript-eslint/no-unused-vars': ["error", { "argsIgnorePattern": "^_" }],
    '@typescript-eslint/no-explicit-any': "error",
    '@typescript-eslint/naming-convention': [
      "error",
      {
        selector: "interface",
        format: ["PascalCase"]
      }
    ],
    'no-console': ["error", { "allow": ["warn", "error"] }],
    eqeqeq: ["error", "always"],
    curly: ["error", "all"],
    'prefer-const': "error",
    'no-var': "error"
  }
}
