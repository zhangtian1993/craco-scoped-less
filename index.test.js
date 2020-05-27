const plugin = require('./index');
const path = require("path");

test('test no babel loader found', () => {
  const data = {
    webpackConfig: {
      module: {
        rules: [],
      }
    }
  };
  expect(() => {
    plugin.overrideWebpackConfig(data);
  }).toThrowError('no babel loader found');
});

test('test no oneOf rule found', () => {
  const data = {
    webpackConfig: {
      module: {
        rules: [
          {
            loader: `x${path.sep}y${path.sep}z${path.sep}node_modules${path.sep}babel-loader${path.sep}lib${path.sep}index.js`
          }
        ],
      }
    }
  };
  expect(() => {
    plugin.overrideWebpackConfig(data);
  }).toThrowError('no oneOf rule found');
});

test('test no less rule found', () => {
  const data = {
    webpackConfig: {
      module: {
        rules: [
          {
            oneOf: [
              {
                loader: `x${path.sep}y${path.sep}z${path.sep}node_modules${path.sep}babel-loader${path.sep}lib${path.sep}index.js`,
              }
            ]
          }
        ],
      }
    }
  };
  expect(() => {
    plugin.overrideWebpackConfig(data);
  }).toThrowError('no less rule found');
});

test('test no css loader found', () => {
  const data = {
    webpackConfig: {
      module: {
        rules: [
          {
            oneOf: [
              {
                loader: `x${path.sep}y${path.sep}z${path.sep}node_modules${path.sep}babel-loader${path.sep}lib${path.sep}index.js`,
              },
              {
                exclude: /\.module\.(less)$/,
                test: /\.less$/
              }
            ]
          }
        ],
      }
    }
  };
  expect(() => {
    plugin.overrideWebpackConfig(data);
  }).toThrowError('no css loader found');
});

test('test config success', () => {
  const data = {
    webpackConfig: {
      module: {
        rules: [
          {
            oneOf: [
              {
                loader: `x${path.sep}y${path.sep}z${path.sep}node_modules${path.sep}babel-loader${path.sep}lib${path.sep}index.js`,
              },
              {
                exclude: /\.module\.(less)$/,
                test: /\.less$/,
                use: [
                  {
                    loader: `x${path.sep}y${path.sep}z${path.sep}node_modules${path.sep}css-loader${path.sep}lib${path.sep}index.js`,
                  },
                ],
              }
            ]
          }
        ],
      }
    }
  };
  const webpackConfig = plugin.overrideWebpackConfig(data);

  expect(webpackConfig.module.rules[0].oneOf[0].options.plugins[0][0])
    .toEqual(require.resolve('babel-plugin-react-scoped-css'));

  expect(webpackConfig.module.rules[0].oneOf[0].options.plugins[0][1].include)
    .toEqual('.scoped.(sass|scss|css|less)$');

  expect(webpackConfig.module.rules[0].oneOf[1].use[1].loader)
    .toEqual(require.resolve('scoped-css-loader'));
});
