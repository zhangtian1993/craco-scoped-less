# craco-scoped-less
在craco-plugin-scoped-css的基础上添加less格式的支持

## 使用
1. 安装依赖<br/>`yarn add craco-plugin-scoped-css craco-scoped-less`<br/>或<br/>`npm i craco-plugin-scoped-css craco-scoped-less`
2. 修改craco.confign.js文件，参考如下
    ```
    module.exports = {
      plugins: [
        {
          plugin: require('craco-plugin-scoped-css'),
        },
        {
          plugin: require('craco-scoped-less'),
        }
      ]
    };
    ```
