export type SharedDependencyConfig = {
  singleton: boolean;
  version: string;
  requiredVersion?: string;
  strictVersion?: boolean;
};

export type SharedDependencies = Record<string, SharedDependencyConfig>;

export const MF_SHARED_CORE: SharedDependencies = {
  react: {
    singleton: true,
    version: '18.2.0',
    requiredVersion: '^18.2.0',
    strictVersion: false,
  },
  'react-dom': {
    singleton: true,
    version: '18.2.0',
    requiredVersion: '^18.2.0',
    strictVersion: false,
  },
  'react-router-dom': {
    singleton: true,
    version: '7.12.0',
    requiredVersion: '^7.12.0',
    strictVersion: false,
  },
  zustand: {
    singleton: true,
    version: '5.0.9',
    requiredVersion: '^5.0.9',
    strictVersion: false,
  },
};

export const MF_SHARED_WITH_SONNER: SharedDependencies = {
  ...MF_SHARED_CORE,
  sonner: {
    singleton: true,
    version: '2.0.7',
    requiredVersion: '^2.0.7',
    strictVersion: false,
  },
};

export const MF_SHARED_HOST: SharedDependencies = {
  ...MF_SHARED_WITH_SONNER,
  '@tanstack/react-query': {
    singleton: true,
    version: '5.90.16',
    requiredVersion: '^5.90.16',
    strictVersion: false,
  },
};

export const getRemoteEntry = (
  env: Record<string, string | undefined>,
  key: string,
  fallback: string
): string =>
  env[`VITE_${key}`] || fallback;

export const MF_ROLLUP_OUTPUT_OPTIONS = {
  output: {
    entryFileNames: 'assets/[name].js',
    chunkFileNames: 'assets/[name].js',
    assetFileNames: 'assets/[name][extname]',
  },
};
