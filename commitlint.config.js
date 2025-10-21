export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [2, 'always', [
            'build',
            'chore',
            'ci',
            'docs',
            'enhancement',
            'feat',
            'fix',
            'perf',
            'refactor',
            'revert',
            'style',
            'test'
        ]],
    },
};