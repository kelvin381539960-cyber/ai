const baseUrl = process.env.AI_WORK_HUB_BASE_URL || 'http://localhost:3000';

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
    const response = await fetch(url);
    const body = await response.json();
    if (!response.ok || body.ok !== true) {
      failed = true;
      console.error(`[FAIL] ${check.name}:`, response.status, body);
    } else {
      console.log(`[PASS] ${check.name}:`, body.initialized ?? 'ok');
    }
  } catch (error) {
    failed = true;
    console.error(`[FAIL] ${check.name}:`, error instanceof Error ? error.message : error);
  }
}

if (failed) {
  console.error('\nSmoke test failed. Make sure the app is running with `npm run dev` or `npm run start`.');
  process.exit(1);
}

console.log('\nSmoke test passed.');
