const { getLoader, loaderByName } = require('@craco/craco');

const addScopedCssLoader = targetRule => {
  const rules = targetRule.use || targetRule.loader;

  let cssLoaderIndex = -1;
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (rule.loader && rule.loader.includes('css-loader')) {
      cssLoaderIndex = i;
      break;
    }
  }

  if (cssLoaderIndex !== -1) {
    const scopedCssRule = { loader: require.resolve('scoped-css-loader') };
    rules.splice(cssLoaderIndex + 1, 0, scopedCssRule);
  } else {
    throw new Error('no css-loader found');
  }
}

module.exports = {
  overrideWebpackConfig: ({ webpackConfig, context: { env } }) => {
    const { isFound, match } = getLoader(webpackConfig, loaderByName('babel-loader'))
    if (isFound) {
      const pluginIndex = match.loader.options.plugins.findIndex(
        p => typeof p === 'string' && p.indexOf('babel-plugin-react-scoped-css') !== -1
      );
      if (pluginIndex === -1) {
        throw new Error('no babel-plugin-react-scoped-css found');
      }
      match.loader.options.plugins[pluginIndex] = [
        'babel-plugin-react-scoped-css',
        {
          include: '.scoped.(sass|scss|css|less)$'
        }
      ];
    } else {
      throw new Error('no babel loader found');
    }

    // add scoped-css-loader
    const oneOfRule = webpackConfig.module.rules.find(rule => rule.oneOf);
    if (!oneOfRule) {
      throw new Error(
        "Can't find a 'oneOf' rule under module.rules in the " + `${env} webpack config! ` +
        'webpack+rules+oneOf',
      );
    }

    const lessRule = oneOfRule.oneOf.find(
      rule =>
        rule.test &&
        rule.test.toString().includes('.less$') &&
        rule.test.toString().indexOf('.module') === -1
    );
    if (!lessRule) {
      throw new Error(
        `Can't find the webpack rule to match css files in the ${env} webpack config!`
      );
    } else {
      addScopedCssLoader(lessRule);
    }

    return webpackConfig;
  }
}
