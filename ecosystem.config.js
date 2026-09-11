module.exports = {
  apps: [
    {
      name: 'vista-thepark',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        ADMIN_PASSWORD: '1234'
      }
    }
  ]
};
