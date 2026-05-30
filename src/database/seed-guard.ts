const SEED_ALLOWED_ENVS = new Set(['development', 'dev', 'local']);

export const resolveNodeEnv = (nodeEnv?: string): string =>
  (nodeEnv ?? process.env.NODE_ENV ?? 'development').toLowerCase();

export const isSeedEnvironment = (nodeEnv?: string): boolean =>
  SEED_ALLOWED_ENVS.has(resolveNodeEnv(nodeEnv));

export const assertSeedsAllowed = (nodeEnv?: string): void => {
  const env = resolveNodeEnv(nodeEnv);

  if (!isSeedEnvironment(env)) {
    throw new Error(
      `Seed migrations are only allowed in development (NODE_ENV=development). Current NODE_ENV=${env}.`,
    );
  }
};
