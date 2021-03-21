const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    webpack: (config, webpack) => {
      console.log(JSON.stringify(config))
      config.plugins.push(new VueLoaderPlugin());
      config.module.rules.push({
        test: /\.vue$/,
        loader: 'vue-loader'
      });
  
      return config;
    },
};