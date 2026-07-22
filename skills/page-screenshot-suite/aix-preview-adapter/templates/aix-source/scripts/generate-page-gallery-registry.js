const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const routeRoot = path.join(root, 'src', 'app', 'aix');
const output = path.join(root, 'src', 'preview', 'pageRegistry.generated.ts');
const { routePresets, nonVisualRoutes } = require('./preview-route-presets');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function humanize(value) {
  return value
    .replace(/\.(web|ios|android)$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function routeFromFile(file) {
  const relative = path.relative(path.join(root, 'src', 'app'), file);
  return '/' + relative
    .replace(/\\/g, '/')
    .replace(/\.tsx$/, '')
    .replace(/\/index$/, '')
    .replace(/\/(\([^/]+\))(?=\/|$)/g, '');
}

function findParams(source) {
  const names = new Set();
  for (const match of source.matchAll(/useLocalSearchParams\s*<([\s\S]*?)>\s*\(/g)) {
    for (const prop of match[1].matchAll(/([A-Za-z_$][\w$]*)\??\s*:/g)) {
      names.add(prop[1]);
    }
  }
  for (const match of source.matchAll(/(?:params|routeParams)\.([A-Za-z_$][\w$]*)/g)) {
    names.add(match[1]);
  }
  return [...names].sort();
}

function nativeCapabilities(source) {
  const checks = [
    ['camera', /expo-camera|CameraView/],
    ['biometric', /NativeBiometric|biometric/i],
    ['webview', /react-native-webview|AixWebview/],
    ['file-picker', /image-picker|document-picker/],
    ['share', /react-native-share|expo-sharing/],
    ['screenshot', /react-native-view-shot/],
  ];
  return checks.filter(([, regex]) => regex.test(source)).map(([name]) => name);
}

const ignored = new Set([
  '_layout.tsx',
  '[...slug].tsx',
  'RouterOptions.tsx',
  'page-gallery.tsx',
]);

const files = walk(routeRoot).filter(file => {
  if (!file.endsWith('.tsx')) return false;
  return !ignored.has(path.basename(file));
});

const entries = files.map(file => {
  const source = fs.readFileSync(file, 'utf8');
  const route = routeFromFile(file);
  const segments = route.replace(/^\/aix\/?/, '').split('/').filter(Boolean);
  const category = segments[0] || 'root';
  const title = humanize(segments.at(-1) || 'AIX');
  return {
    id: route.replace(/^\//, '').replace(/[^a-zA-Z0-9]+/g, '-'),
    title,
    category,
    route,
    sourcePath: path.relative(root, file).replace(/\\/g, '/'),
    params: findParams(source),
    nativeCapabilities: nativeCapabilities(source),
    previewParams: routePresets[route] ?? {},
    nonVisual: nonVisualRoutes.has(route),
    internal: ['debug', 'route'].includes(category),
  };
}).sort((a, b) => a.category.localeCompare(b.category) || a.route.localeCompare(b.route));

const type = `export type PageRegistryEntry = {\n  id: string;\n  title: string;\n  category: string;\n  route: string;\n  sourcePath: string;\n  params: string[];\n  nativeCapabilities: string[];\n  previewParams: Record<string, string>;\n  nonVisual: boolean;\n  internal: boolean;\n};\n\n`;
const content = `${type}export const pageRegistry: PageRegistryEntry[] = ${JSON.stringify(entries, null, 2)};\n`;
fs.writeFileSync(output, content);
fs.writeFileSync(output.replace(/\.ts$/, '.json'), JSON.stringify(entries, null, 2) + '\n');
console.log(`Generated ${entries.length} routes at ${path.relative(root, output)}`);
