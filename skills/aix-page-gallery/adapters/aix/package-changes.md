# AIX package changes

Do not copy `.npmrc` credentials into the skill or change the team's registry without approval.

The installer adds the `gallery:generate`, `gallery:web`, and `gallery:export` scripts to `package.json`. It also adds `@lottiefiles/dotlottie-react` when absent.

Keep the project's existing `@aix/icons` source. If the private registry is unavailable, provide that package through an approved local tarball and update the lockfile only inside the isolated worktree.
