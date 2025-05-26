// filepath: frontend/src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const apiProxy = createProxyMiddleware({
    target: 'http://localhost:8080',
    changeOrigin: true,
    logLevel: 'debug', // Enable http-proxy-middleware's own verbose logging
    onProxyReq: (proxyReq, req, res) => {
      // Log the path being sent to the backend
      console.log(`[HPM] Sending ${req.method} request to: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
      // Log the original request URL from the frontend
      console.log(`[HPM] Original request URL from frontend: ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
      console.error('[HPM] Proxy Error:', err);
    }
  });

  app.use('/api', apiProxy); // Ensure this matches the base path of your backend APIs
};