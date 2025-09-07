import withNuxt from './.nuxt/eslint.config.mjs';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default withNuxt(
  {
    ignores: ['**/*.test.ts', 'app/legalbetParts'],
  },
  {
    ...eslintPluginPrettierRecommended,

    rules: {
      ...eslintPluginPrettierRecommended.rules,
      'prettier/prettier': [
        'error',
        {
          printWidth: 120, // максимальная ширина строки
          useTabs: false, // пробел или символ табуляции
          tabWidth: 2, // ширина табуляции в пробелах
          semi: true, // точка с запятой в конце выражений
          singleQuote: true, // использовать одинарные кавычки
          quoteProps: 'as-needed', // заковычивание в ключах объектов
          trailingComma: 'es5', // висячие запятые, тут доступны только в обьектах, массивах
          bracketSpacing: true, // отступы от фигурных скобок {foo: bar} -> { foo: bar }
          arrowParens: 'always', // скобки вокруг параметров стрелочных функций
          endOfLine: 'lf', // конец файла с новой строки (\n)
        },
      ],
      '@typescript-eslint/no-dynamic-delete': 'off', // удаление свойств объекта через переменную
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-expressions': 'off',
      'vue/no-v-html': 'off',
    },
  }
);
