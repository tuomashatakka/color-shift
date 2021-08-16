module.exports = {
  extends: '@tuomashatakka',
  rules: {
    'block-padding/functions':        [ 'warn', 1, { strategy: 'at-least' }],
    'block-padding/arrow-functions':  [ 'warn', 2, { strategy: 'at-most' }],
    'one-var-declaration-per-line':   [ 'off' ],
    'one-var':                        [ 'error', { 'var': 'consecutive', 'let': 'never', 'const': 'never' }],
    'indent':                         [ 'warn', 2, 
      { 
        SwitchCase:         1,
        VariableDeclarator: 'first',
      }
    ],
  }
}
