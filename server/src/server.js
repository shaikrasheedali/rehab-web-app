import { createApp } from './app.js';
import { config } from './config/env.js';

const app = createApp();

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏥 Sri Thirumala Full-Stack Backend Server Active`);
  console.log(`🚀 API Server: http://localhost:${PORT}/api`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`📁 Static Uploads: http://localhost:${PORT}/uploads`);
  console.log(`=======================================================`);
});
