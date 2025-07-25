// Environment configuration for staging and production deployments

export type Environment = 'development' | 'staging' | 'production';

export const getEnvironment = (): Environment => {
  const env = process.env.NODE_ENV;
  const vercelEnv = process.env.VERCEL_ENV;
  
  if (env === 'production' && vercelEnv === 'production') {
    return 'production';
  }
  
  if (env === 'production' && vercelEnv === 'preview') {
    return 'staging';
  }
  
  return 'development';
};

export const getDatabaseUrl = (): string => {
  const environment = getEnvironment();
  
  // Support both environment-specific names (for workflows) and standard names (for Vercel)
  switch (environment) {
    case 'production':
      return process.env.POSTGRES_URL_PROD || process.env.POSTGRES_URL || throwError('POSTGRES_URL');
    case 'staging':
      return process.env.POSTGRES_URL_STAGING || process.env.POSTGRES_URL || throwError('POSTGRES_URL');
    default:
      return process.env.POSTGRES_URL || throwError('POSTGRES_URL');
  }
};

function throwError(varName: string): never {
  throw new Error(`${varName} is not defined`);
}

export const getRedisUrl = (): string => {
  const environment = getEnvironment();
  
  // Support both environment-specific names (for workflows) and standard names (for Vercel)
  switch (environment) {
    case 'production':
      return process.env.REDIS_URL_PROD || process.env.REDIS_URL || throwError('REDIS_URL');
    case 'staging':
      return process.env.REDIS_URL_STAGING || process.env.REDIS_URL || throwError('REDIS_URL');
    default:
      return process.env.REDIS_URL || throwError('REDIS_URL');
  }
};

export const getBlobToken = (): string => {
  const environment = getEnvironment();
  
  // Support both environment-specific names (for workflows) and standard names (for Vercel)
  switch (environment) {
    case 'production':
      return process.env.BLOB_READ_WRITE_TOKEN_PROD || process.env.BLOB_READ_WRITE_TOKEN || throwError('BLOB_READ_WRITE_TOKEN');
    case 'staging':
      return process.env.BLOB_READ_WRITE_TOKEN_STAGING || process.env.BLOB_READ_WRITE_TOKEN || throwError('BLOB_READ_WRITE_TOKEN');
    default:
      return process.env.BLOB_READ_WRITE_TOKEN || throwError('BLOB_READ_WRITE_TOKEN');
  }
};

// Environment-specific feature flags
export const featureFlags = {
  enableAdminPanel: true,
  enableStagingFeatures: getEnvironment() === 'staging',
  enableProductionOptimizations: getEnvironment() === 'production',
  enableDebugMode: getEnvironment() === 'development',
};

// Environment-specific URLs
export const getBaseUrl = (): string => {
  const environment = getEnvironment();
  
  switch (environment) {
    case 'production':
      return process.env.NEXT_PUBLIC_PROD_URL || 'https://app.yourdomain.com';
    case 'staging':
      return process.env.NEXT_PUBLIC_STAGING_URL || 'https://staging.yourdomain.com';
    default:
      return process.env.NEXT_PUBLIC_DEV_URL || 'http://localhost:3000';
  }
};