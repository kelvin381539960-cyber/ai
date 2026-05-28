import { startMcpServer } from './mcp/server.js';
import { runSmoke } from './smoke.js';

if (process.argv.includes('--smoke')) {
  await runSmoke();
} else {
  await startMcpServer();
}
