import { createApp } from '../app/app';
import { connectDatabase } from '../infrastructure/database/connection';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDatabase();
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`[Server] KSV API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

start();
