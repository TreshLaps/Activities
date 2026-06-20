const { defineConfig } = require('eslint/config');

const { fixupConfigRules } = require('@eslint/compat');

const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

module.exports = defineConfig([
    {
        settings: {
            react: {
                version: 'detect',

                linkComponents: [
                    {
                        name: 'Link',
                        linkAttribute: 'to',
                    },
                ],
            },
        },

        extends: fixupConfigRules(
            compat.extends(
                'eslint:recommended',
                'plugin:react/recommended',
                'plugin:react/jsx-runtime',
                'plugin:react-hooks/recommended',
                'plugin:jsx-a11y/recommended'
            )
        ),

        rules: {
            'jsx-a11y/no-autofocus': 'off',
            'jsx-a11y/no-onchange': 'off',
        },

        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],

        settings: {
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },

            'import/resolver': {
                typescript: {
                    project: [
                        './tsconfig.json',
                        './tests/tsconfig.json',
                        './tsconfig.build.json',
                    ],
                },
            },
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2018,
            sourceType: 'module',

            parserOptions: {
                tsconfigRootDir: __dirname,
                project: [
                    './tsconfig.json',
                    './tests/tsconfig.json',
                    './tsconfig.build.json',
                ],

                ecmaFeatures: {
                    jsx: true,
                },
            },
        },

        plugins: {
            '@typescript-eslint': typescriptEslint,
        },

        extends: compat.extends(
            'plugin:@typescript-eslint/recommended',
            'plugin:@typescript-eslint/recommended-requiring-type-checking'
        ),

        rules: {
            '@typescript-eslint/explicit-module-boundary-types': 'off',

            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_T',
                },
            ],

            'react/prop-types': 'off',
            'react/display-name': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-empty-function': 'off',
        },
    },
    {
        files: ['./.eslintrc.js', './*.config.js'],

        languageOptions: {
            globals: {
                ...Object.fromEntries(
                    Object.entries(globals.browser).map(([key]) => [key, 'off'])
                ),
                ...globals.node,
            },
        },
    },
]);
