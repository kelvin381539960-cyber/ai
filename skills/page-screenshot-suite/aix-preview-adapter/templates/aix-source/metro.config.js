const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;

/** .env 变更时使 Metro 缓存失效（与 EXPO_PUBLIC_* 等一致） */
function getEnvCacheVersion() {
    const envPath = path.join(projectRoot, '.env');
    try {
        if (fs.existsSync(envPath)) {
            const hash = crypto.createHash('sha256');
            hash.update(fs.readFileSync(envPath));
            return hash.digest('hex');
        }
    } catch {
        // ignore
    }
    return 'no-env';
}

const cacheVersion = getEnvCacheVersion();

const config = getDefaultConfig(projectRoot);

// 让 Metro 监听 monorepo 的包，并跟随 workspace 的 symlink
config.watchFolders = [
    path.resolve(projectRoot, './packages'),
];

config.resolver = {
    ...config.resolver,
    unstable_enableSymlinks: true,
    nodeModulesPaths: [
        path.resolve(projectRoot, 'node_modules'),
    ],
    resolverMainFields: ['react-native', 'browser', 'main'],
    assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...config.resolver.sourceExts, 'svg'],
};


const previewCodegenComponent = path.resolve(projectRoot, 'src/preview/stubs/codegenNativeComponent.web.tsx');
const previewCodegenCommands = path.resolve(projectRoot, 'src/preview/stubs/codegenNativeCommands.web.ts');
const previewUIManager = path.resolve(projectRoot, 'src/preview/stubs/UIManager.web.ts');
const previewNativeModuleAliases = new Map([
    ['react-native-moengage', 'src/preview/stubs/MoEngage.web.ts'],
    ['react-native-expo-moengage', 'src/preview/stubs/MoEngage.web.ts'],
    ['react-native-appsflyer', 'src/preview/stubs/AppsFlyer.web.ts'],
    ['@react-native-firebase/remote-config', 'src/preview/stubs/RemoteConfig.web.ts'],
    ['@react-native-firebase/crashlytics', 'src/preview/stubs/Crashlytics.web.ts'],
    ['react-native-device-info', 'src/preview/stubs/DeviceInfo.web.ts'],
    ['react-native-share', 'src/preview/stubs/Share.web.ts'],
    ['react-native-view-shot', 'src/preview/stubs/ViewShot.web.ts'],
    ['react-native-webview', 'src/preview/stubs/WebView.web.tsx'],
    ['@react-native-cookies/cookies', 'src/preview/stubs/Cookies.web.ts'],
].map(([name, filePath]) => [name, path.resolve(projectRoot, filePath)]));

config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (platform === 'web') {
        const previewAlias = previewNativeModuleAliases.get(moduleName);
        if (previewAlias) {
            return { type: 'sourceFile', filePath: previewAlias };
        }
        if (moduleName === 'react-native/Libraries/Utilities/codegenNativeComponent') {
            return { type: 'sourceFile', filePath: previewCodegenComponent };
        }
        if (moduleName === 'react-native/Libraries/Utilities/codegenNativeCommands') {
            return { type: 'sourceFile', filePath: previewCodegenCommands };
        }
        const isInternalUIManager =
            moduleName === 'react-native/Libraries/ReactNative/UIManager' ||
            (moduleName === '../ReactNative/UIManager' && context.originModulePath.includes('/react-native/Libraries/Utilities/')) ||
            ((moduleName === './BridgelessUIManager' || moduleName === './PaperUIManager') &&
                context.originModulePath.includes('/react-native/Libraries/ReactNative/'));
        if (isInternalUIManager) {
            return { type: 'sourceFile', filePath: previewUIManager };
        }
    }
    return context.resolveRequest(context, moduleName, platform);
};

config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

const metroConfig = withNativeWind(config, { input: './global.css' });
metroConfig.cacheVersion = cacheVersion;
module.exports = metroConfig;