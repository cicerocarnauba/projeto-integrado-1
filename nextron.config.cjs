// nextron.config.cjs
module.exports = {
  // Caminhos padrão (opcional, mas mantenha)
  mainSrc: 'main/background.ts',
  rendererSrc: 'renderer',
  preloadSrc: 'main/preload.ts',

  // 👇 ESSENCIAL: força o webpack a compilar o preload
  webpack: (defaultConfig, env) =>
    Object.assign(defaultConfig, {
      entry: {
        background: './main/background.ts',
        preload: './main/preload.ts',
      },
    }),
};