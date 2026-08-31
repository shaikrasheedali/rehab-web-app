import { createApp } from './app.js';
import { config } from './config/env.js';
import { prisma } from './config/prisma.js';

const app = createApp();
const PORT = config.port;

app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🏥 Sri Thirumala Full-Stack Backend Server Active`);
  console.log(`🚀 API Server: http://localhost:${PORT}/api`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`📁 Static Uploads: http://localhost:${PORT}/uploads`);
  console.log(`=======================================================`);

  // Verify Aiven Cloud MySQL Database Connectivity
  try {
    const adminCount = await prisma.adminUser.count();
    console.log(`✅ Aiven Cloud MySQL connected successfully (${adminCount} admin accounts active).`);
  } catch (dbErr) {
    console.warn(`⚠️ Database connection notice:`, dbErr.message);
  }
});
