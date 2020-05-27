const { getLoader, loaderByName } = require('@craco/craco');
const path = require('path');

const addScopedCssLoader = targetRule => {
  const rules = targetRule.use || targetRule.loader || [];

  let cssLoaderIndex = -1;
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (rule.loader && rule.loader.includes(`${path.sep}css-loader${path.sep}`)) {
      cssLoaderIndex = i;
      break;
    }
  }

  if (cssLoaderIndex !== -1) {
    const scopedCssRule = { loader: require.resolve('scoped-css-loader') };
    rules.splice(cssLoaderIndex + 1, 0, scopedCssRule);
  } else {
    throw new Error('no css loader found');
  }
}

module.exports = {
  overrideWebpackConfig: ({ webpackConfig }) => {
    const { isFound, match } = getLoader(webpackConfig, loaderByName('babel-loader'))
    if (isFound) {
      if (!match.loader.options) {
        match.loader.options = {};
      }
      if (!match.loader.options.plugins) {
        match.loader.options.plugins = [];
      }
      const pluginIndex = match.loader.options.plugins.findIndex(
        p =>
          typeof p === 'string' &&
          p.indexOf(`${path.sep}babel-plugin-react-scoped-css${path.sep}`) !== -1
      );
      const newPlugin = [
        require.resolve('babel-plugin-react-scoped-css'),
        {
          include: '.scoped.(sass|scss|css|less)$'
        }
      ];
      if (pluginIndex === -1) {
        match.loader.options.plugins.push(newPlugin);
      } else {
        match.loader.options.plugins[pluginIndex] = newPlugin;
      }
    } else {
      throw new Error('no babel loader found');
    }

    const oneOfRule = webpackConfig.module.rules.find(rule => rule.oneOf);
    if (!oneOfRule) {
      throw new Error('no oneOf rule found');
    }

    const lessRule = oneOfRule.oneOf.find(
      rule =>
        rule.test &&
        rule.test.toString().includes('.less$') &&
        rule.test.toString().indexOf('.module') === -1
    );
    if (!lessRule) {
      throw new Error('no less rule found');
    } else {
      addScopedCssLoader(lessRule);
    }

    return webpackConfig;
  }
}
