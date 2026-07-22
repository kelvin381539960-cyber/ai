# AIX Adapter Notes

## Verified source integration

The adapter was derived by comparing the original AIX frontend with the isolated, verified Page Gallery worktree.

`adapters/aix/overlay/` contains only added files. `adapters/aix/aix-runtime.patch` contains modifications to existing source files.

## Major integration points

- `metro.config.js`: aliases unsupported native dependencies to Web Preview stubs.
- `src/app/_layout.tsx`: selects platform-specific root layout.
- `src/bootstrap/RootLayoutWeb.tsx`: initializes Preview state, providers, and router stack.
- `src/network/Api.web.ts`: installs deterministic request responses.
- `src/preview/PreviewSession.ts`: seeds logged-in Preview state.
- `src/preview/PreviewFixtures.ts`: returns API-shaped fixture data.
- `scripts/preview-route-presets.js`: provides route-specific parameters.
- `src/aix/debug/PageGalleryPage.tsx`: searchable route gallery.
- `specs/*.web.ts`: replaces TurboModules.
- `src/preview/stubs/*.web.ts(x)`: replaces third-party native SDKs.

## Package handling

The skill intentionally excludes all private registry credentials.

The installer adds `gallery:*` scripts and `@lottiefiles/dotlottie-react` only when needed. It does not replace the project's existing `@aix/icons` dependency. If that package cannot be installed, use an approved local package tarball in the isolated worktree.

## Playground routes

The verified route count excludes the component Playground. The installer moves `src/app/playground` to `src/preview/excluded-routes/playground` unless `--keep-playground` is supplied.

## Confirmed non-visual route

`/aix/ivs/ivs-begin-page` is a flow controller. It processes IVS state and returns a transparent empty view; it is explicitly marked `nonVisual` rather than treated as a failed screenshot.

## Verified duplicate routes

Some routes intentionally render the same UI:

- `card_entrance` and `card-interduce`
- KYC launch and polling loading states in the verified scenario

Exact duplicate hashes must be documented, not automatically considered a failure.
