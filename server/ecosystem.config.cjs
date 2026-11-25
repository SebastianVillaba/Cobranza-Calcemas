// .cjs: pm2 carga este archivo con require() y el package.json es "type": "module"
module.exports = {
  apps: [{
    name: 'cobranza-calcemas',
    script: 'server.js',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
