module.exports = {
  devServer: {
    port: 3000,
    host: 'localhost',
    allowedHosts: 'all',
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Configuraciones adicionales si son necesarias
      return webpackConfig;
    },
  },
};