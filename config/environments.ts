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
  
  switch (environment) {
    case 'production':
      if (!process.env.POSTGRES_URL_PROD) {
        throw new Error('POSTGRES_URL_PROD is not defined for production environment');
      }
      return process.env.POSTGRES_URL_PROD;
      
    case 'staging':
      if (!process.env.POSTGRES_URL_STAGING) {
        throw new Error('POSTGRES_URL_STAGING is not defined for staging environment');
      }
      return process.env.POSTGRES_URL_STAGING;
      
    default:
      if (!process.env.POSTGRES_URL) {
        throw new Error('POSTGRES_URL is not defined for development environment');
      }
      return process.env.POSTGRES_URL;
  }
};

export const getRedisUrl = (): string => {
  const environment = getEnvironment();
  
  switch (environment) {
    case 'production':
      if (!process.env.REDIS_URL_PROD) {
        throw new Error('REDIS_URL_PROD is not defined for production environment');
      }
      return process.env.REDIS_URL_PROD;
      
    case 'staging':
      if (!process.env.REDIS_URL_STAGING) {
        throw new Error('REDIS_URL_STAGING is not defined for staging environment');
      }
      return process.env.REDIS_URL_STAGING;
      
    default:
      if (!process.env.REDIS_URL) {
        throw new Error('REDIS_URL is not defined for development environment');
      }
      return process.env.REDIS_URL;
  }
};

export const getBlobToken = (): string => {
  const environment = getEnvironment();
  
  switch (environment) {
    case 'production':
      if (!process.env.BLOB_READ_WRITE_TOKEN_PROD) {
        throw new Error('BLOB_READ_WRITE_TOKEN_PROD is not defined for production environment');
      }
      return process.env.BLOB_READ_WRITE_TOKEN_PROD;
      
    case 'staging':
      if (!process.env.BLOB_READ_WRITE_TOKEN_STAGING) {
        throw new Error('BLOB_READ_WRITE_TOKEN_STAGING is not defined for staging environment');
      }
      return process.env.BLOB_READ_WRITE_TOKEN_STAGING;
      
    default:
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error('BLOB_READ_WRITE_TOKEN is not defined for development environment');
      }
      return process.env.BLOB_READ_WRITE_TOKEN;
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