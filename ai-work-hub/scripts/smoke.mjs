const baseUrl = process.env.AI_WORK_HUB_BASE_URL || 'http://localhost:3000';
const accessToken = process.env.AI_WORK_HUB_ACCESS_TOKEN || process.env.AI_WORK_HUB_SMOKE_TOKEN || '';

const checks = [
  { name: 'health', path: '/api/health' },
  { name: 'tasks', path: '/api/tasks' },
  { name: 'outputs', path: '/api/outputs' },
  { name: 'search', path: '/api/search?q=AI' }
];

let failed = false;

for (const check of checks) {
  const url = `${baseUrl}${check.path}`;
  try {
    const response = await fetch(url, {
      headers: accessToken ? { Cookie: `ai_work_hub_token=${accessToken}` } : undefined
    });
    const body = await response.json();
    if (!response.ok || body.ok !== true) {
      failed = true;
      console.error(`[FAIL] ${check.name}:`, response.status, body);
    } else {
      const state = Object.prototype.hasOwnProperty.call(body, 'initialized') ? body.initialized : 'ok';
      console.log(`[PASS] ${check.name}:`, state);
    }
  } catch (error) {
    failed = true;
    console.error(`[FAIL] ${check.name}:`, error instanceof Error ? error.message : error);
  }
}

if (failed) {
  console.error('\nSmoke test failed. Make sure the app is running with `npm run dev` or `npm run start`.');
  if (!accessToken) {
    console.error('If access token guard is enabled, run with AI_WORK_HUB_SMOKE_TOKEN or AI_WORK_HUB_ACCESS_TOKEN.');
  }
  process.exit(1);
}

console.log('\nSmoke test passed.');
