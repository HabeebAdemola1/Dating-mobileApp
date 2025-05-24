export default {
  apps: [
    {
      name: 'dating-app-backend', // Optional: give your app a name
      script: './index.js', // Path to the main script
      watch: true, // Enable watch mode for development
      instances: 'max', // Use 'max' for cluster mode (all available CPU cores)
      exec_mode: 'cluster', // Run in cluster mode
      env: {
        NODE_ENV: 'development', // Environment variables for development
      },
      env_production: {
        NODE_ENV: 'production', // Environment variables for production
      },
    },
  ],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};