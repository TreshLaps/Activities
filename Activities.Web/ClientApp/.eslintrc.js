module.exports = {
    root: true,
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
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        // "prettier", // disabled until we upgrade prettier
        // "plugin:import/recommended",
    ],
    rules: {
        'jsx-a11y/no-autofocus': 'off',
        'jsx-a11y/no-onchange': 'off',
    },
    env: {
        es6: true,
        browser: true,
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
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
            parser: '@typescript-eslint/parser',
            parserOptions: {
                tsconfigRootDir: __dirname,
                project: [
                    './tsconfig.json',
                    './tests/tsconfig.json',
                    './tsconfig.build.json',
                ],
                ecmaVersion: 2018,
                ecmaFeatures: {
                    jsx: true,
                },
                sourceType: 'module',
            },
            plugins: ['@typescript-eslint'],
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
                // "plugin:import/typescript",
            ],
            rules: {
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                '@typescript-eslint/no-unused-vars': [
                    'error',
                    { argsIgnorePattern: '^_', varsIgnorePattern: '^_T' },
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
            env: { browser: false, node: true },
        },
    ],
};
