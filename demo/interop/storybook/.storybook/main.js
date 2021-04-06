module.exports = {
    'stories': [
        '../stories/**/*.stories.mdx',
        '../stories/**/*.stories.@(js|jsx|ts|tsx)'
    ],
    'webpackFinal': require('@labor-digital/asset-building/interop/storybook').assets(),
    'addons': [
        '@storybook/addon-links',
        '@storybook/addon-essentials'
    ],
    'core': {
        'builder': 'webpack5'
    }
};