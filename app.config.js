const { execSync } = require('node:child_process');

function lerCommitHash() {
  const doEas = process.env.EAS_BUILD_GIT_COMMIT_HASH;
  if (doEas) return doEas.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'sem-commit';
  }
}

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    commitHash: lerCommitHash(),
  },
});
