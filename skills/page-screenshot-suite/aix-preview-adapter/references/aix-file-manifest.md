# AIX verified source manifest

Total files: 43

- **merge** files are copied to `.page-gallery-reference/` in safe install mode.
- Other files are copied with backups when replacing existing files.
- Snapshot overwrite is allowed only in a disposable worktree.

## Files

- `metro.config.js` — **merge**
- `package.json` — **merge**
- `packages/common/src/mmkv/MMKVHelper.web.ts` — copy
- `packages/pull-to-refresh/src/index.web.tsx` — copy
- `public/preview/splash.png` — copy
- `scripts/capture-page-gallery.js` — copy
- `scripts/generate-page-gallery-registry.js` — copy
- `scripts/preview-route-presets.js` — copy
- `specs/NativeAIXDeviceInfo.web.ts` — copy
- `specs/NativeAIXFileUploader.web.ts` — copy
- `specs/NativeBiometricStrategy.web.ts` — copy
- `specs/NativeGeneralMethods.web.ts` — copy
- `specs/NativeLocalStorage.web.ts` — copy
- `src/aix/debug/PageGalleryPage.tsx` — copy
- `src/aix/ivs/biometric/IvsBiometricPage.web.tsx` — copy
- `src/aix/splash/SplashPage.tsx` — **merge**
- `src/aix/splash/SplashPage.web.tsx` — copy
- `src/app/_layout.tsx` — **merge**
- `src/app/aix/debug/page-gallery.tsx` — copy
- `src/app/index.tsx` — **merge**
- `src/bootstrap/RootLayoutNative.tsx` — copy
- `src/bootstrap/RootLayoutPlatform.native.tsx` — copy
- `src/bootstrap/RootLayoutPlatform.tsx` — copy
- `src/bootstrap/RootLayoutPlatform.web.tsx` — copy
- `src/bootstrap/RootLayoutWeb.tsx` — copy
- `src/network/AixUserAgent.ts` — **merge**
- `src/network/Api.web.ts` — copy
- `src/preview/PreviewFixtures.ts` — copy
- `src/preview/PreviewSession.ts` — copy
- `src/preview/stubs/AppsFlyer.web.ts` — copy
- `src/preview/stubs/Cookies.web.ts` — copy
- `src/preview/stubs/Crashlytics.web.ts` — copy
- `src/preview/stubs/DeviceInfo.web.ts` — copy
- `src/preview/stubs/MoEngage.web.ts` — copy
- `src/preview/stubs/RemoteConfig.web.ts` — copy
- `src/preview/stubs/Share.web.ts` — copy
- `src/preview/stubs/UIManager.web.ts` — copy
- `src/preview/stubs/ViewShot.web.ts` — copy
- `src/preview/stubs/WebView.web.tsx` — copy
- `src/preview/stubs/codegenNativeCommands.web.ts` — copy
- `src/preview/stubs/codegenNativeComponent.web.tsx` — copy
- `src/webivew/SaveFileMethods.web.ts` — copy
- `tsconfig.json` — **merge**
