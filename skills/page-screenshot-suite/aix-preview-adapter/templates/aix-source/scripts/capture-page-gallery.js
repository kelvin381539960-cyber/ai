const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function loadPlaywright() {
  try {
    return require('playwright');
  } catch {
    const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    return require(path.join(globalRoot, 'playwright'));
  }
}

const { chromium } = loadPlaywright();
const root = path.resolve(__dirname, '..');
const registry = require(path.join(root, 'src', 'preview', 'pageRegistry.generated.json'));
const baseUrl = process.env.GALLERY_BASE_URL || 'http://127.0.0.1:19006';
const outputRoot = process.env.GALLERY_OUTPUT || path.join(root, 'outputs', 'page-screenshots');
const limit = Number(process.env.GALLERY_LIMIT || 0);

const defaultParams = {
  preview: '1',
  scenario: 'default',
  transactionId: 'preview-card-payment',
  cardId: 'preview-card-001',
  messageId: 'preview-message-001',
  id: 'preview-id',
  type: 'VIRTUAL',
  status: 'SUCCESS',
  resultType: 'success',
  fullName: 'Preview User',
  originalFullName: 'Preview User',
  countryCode: 'SG',
  currency: 'USDT',
  network: 'ETH',
  networkCode: 'ETH',
  asset: 'USDT',
  amount: '100',
  sellCurrency: 'USDT',
  buyCurrency: 'USDC',
  nextPath: '/aix/debug/page-gallery',
  modal: 'card',
};

defaultParams.kycNavParams = JSON.stringify({
  currentCountryISO: 'SG',
  currentDisplayName: 'Singapore',
  allowCountryISOList: ['SG', 'HK', 'US'],
  targetPage: '/aix/home/home-page',
  aaiPassportUrl: 'preview://passport-verification',
  aaiLivenessUrl: 'preview://face-verification',
});
defaultParams.depositMethod = JSON.stringify({
  method: 'EXCHANGE',
  displayName: 'Exchange',
  description: 'Preview deposit method',
  currencies: [],
  order: 1,
});
defaultParams.nextParams = '{}';

function safeName(value) {
  return value.replace(/^\//, '').replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function buildUrl(item) {
  const url = new URL(item.route, baseUrl);
  const params = { ...defaultParams, ...(item.previewParams || {}) };
  for (const name of item.params || []) params[name] ??= `preview-${name}`;
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.toString();
}

function csvEscape(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

async function main() {
  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputRoot, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    locale: 'en-US',
  });
  await context.route('**/*', async route => {
    const requestUrl = new URL(route.request().url());
    const allowed =
      requestUrl.protocol === 'data:' ||
      requestUrl.protocol === 'blob:' ||
      ['127.0.0.1', 'localhost'].includes(requestUrl.hostname);
    if (allowed) await route.continue();
    else await route.abort('blockedbyclient');
  });

  const candidates = registry.filter(item => !item.internal);
  const items = limit > 0 ? candidates.slice(0, limit) : candidates;
  const results = [];

  for (const [index, item] of items.entries()) {
    const page = await context.newPage();
    const errors = [];
    const consoleErrors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    const url = buildUrl(item);
    const directory = path.join(outputRoot, item.category);
    fs.mkdirSync(directory, { recursive: true });
    const screenshot = path.join(directory, `${safeName(item.route)}.png`);
    let navigationError = '';
    let text = '';

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1600);
      text = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
      await page.screenshot({ path: screenshot, fullPage: true });
    } catch (error) {
      navigationError = error instanceof Error ? error.message : String(error);
      await page.screenshot({ path: screenshot, fullPage: true }).catch(() => undefined);
    }

    const looksLikeError = /Application Error|Unexpected Application Error|TurboModuleRegistry|getEnforcing|Cannot read properties|Invariant Violation|Module not found/i.test(text);
    const status = navigationError || errors.length || looksLikeError
      ? 'error'
      : text.trim().length > 0
        ? 'rendered'
        : 'blank';
    results.push({
      index: index + 1,
      route: item.route,
      category: item.category,
      status,
      finalUrl: page.url(),
      screenshot: path.relative(root, screenshot),
      bodyTextLength: text.trim().length,
      navigationError,
      pageErrors: errors,
      consoleErrors: consoleErrors.slice(0, 10),
    });
    console.log(`[${index + 1}/${items.length}] ${status} ${item.route}`);
    await page.close();
  }

  await browser.close();
  fs.writeFileSync(
    path.join(outputRoot, 'capture-results.json'),
    JSON.stringify(results, null, 2) + '\n',
  );
  const csv = [
    ['route', 'category', 'status', 'finalUrl', 'screenshot', 'error'].map(csvEscape).join(','),
    ...results.map(item => [
      item.route,
      item.category,
      item.status,
      item.finalUrl,
      item.screenshot,
      item.navigationError || item.pageErrors.join(' | '),
    ].map(csvEscape).join(',')),
  ].join('\n') + '\n';
  fs.writeFileSync(path.join(outputRoot, 'capture-results.csv'), csv);

  const counts = results.reduce((map, item) => {
    map[item.status] = (map[item.status] || 0) + 1;
    return map;
  }, {});
  const markdown = [
    '# AIX Page Gallery 截图结果',
    '',
    `- 总路由：${results.length}`,
    `- 正常渲染：${counts.rendered || 0}`,
    `- 空白：${counts.blank || 0}`,
    `- 错误：${counts.error || 0}`,
    '',
    '| 路由 | 模块 | 状态 | 截图 |',
    '|---|---|---|---|',
    ...results.map(item => `| ${item.route} | ${item.category} | ${item.status} | ${item.screenshot} |`),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(outputRoot, 'README.md'), markdown);
  console.log('Summary:', counts);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
