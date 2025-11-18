"use strict";
/* eslint-disable @typescript-eslint/no-deprecated */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const js_1 = __importDefault(require("@eslint/js"));
const typescript_eslint_1 = __importDefault(require("typescript-eslint"));
const eslint_plugin_js_1 = __importDefault(require("@stylistic/eslint-plugin-js"));
const eslint_plugin_ts_1 = __importDefault(require("@stylistic/eslint-plugin-ts"));
const eslint_plugin_n_1 = __importDefault(require("eslint-plugin-n"));
exports.default = typescript_eslint_1.default.config(js_1.default.configs.recommended, eslint_plugin_n_1.default.configs['flat/recommended-script'], ...typescript_eslint_1.default.configs.strictTypeChecked, ...typescript_eslint_1.default.configs.stylisticTypeChecked, {
    ignores: [
        '**/node_modules/*',
        '**/*.mjs',
        '**/*.js',
    ],
}, {
    languageOptions: {
        parserOptions: {
            project: './tsconfig.json',
            warnOnUnsupportedTypeScriptVersion: false,
        },
    },
}, {
    plugins: {
        '@stylistic/js': eslint_plugin_js_1.default,
        '@stylistic/ts': eslint_plugin_ts_1.default,
    },
}, {
    files: ['**/*.ts'],
}, {
    rules: {
        '@typescript-eslint/explicit-member-accessibility': 'warn',
        '@typescript-eslint/no-misused-promises': 0,
        '@typescript-eslint/no-floating-promises': 0,
        '@typescript-eslint/no-confusing-void-expression': 0,
        '@typescript-eslint/no-unnecessary-condition': 0,
        '@typescript-eslint/restrict-template-expressions': [
            'error', { allowNumber: true },
        ],
        '@typescript-eslint/restrict-plus-operands': [
            'warn', { allowNumberAndString: true },
        ],
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-unsafe-enum-comparison': 0,
        '@typescript-eslint/no-unnecessary-type-parameters': 0,
        // unsafe 관련 타입 체크 규칙 완화
        '@typescript-eslint/no-unsafe-assignment': 0,
        '@typescript-eslint/no-unsafe-member-access': 0,
        '@typescript-eslint/no-unsafe-argument': 0,
        '@typescript-eslint/no-unsafe-call': 0,
        '@typescript-eslint/no-unsafe-return': 0,
        '@stylistic/js/no-extra-semi': 'warn',
        'max-len': [
            'warn',
            {
                'code': 80,
            },
        ],
        '@stylistic/ts/semi': ['warn', 'always'],
        '@stylistic/ts/member-delimiter-style': ['warn', {
                'multiline': {
                    'delimiter': 'comma',
                    'requireLast': true,
                },
                'singleline': {
                    'delimiter': 'comma',
                    'requireLast': false,
                },
                'overrides': {
                    'interface': {
                        'singleline': {
                            'delimiter': 'semi',
                            'requireLast': false,
                        },
                        'multiline': {
                            'delimiter': 'semi',
                            'requireLast': true,
                        },
                    },
                },
            }],
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/no-unused-expressions': 'warn',
        'comma-dangle': ['warn', 'always-multiline'],
        'no-console': 1,
        'no-extra-boolean-cast': 0,
        'indent': ['warn', 2],
        'quotes': 0, // single/double quote 자유롭게 사용 가능
        'n/no-process-env': 1,
        'n/no-missing-import': 0,
        'n/no-unpublished-import': 0,
        'prefer-const': 'warn',
    },
});
