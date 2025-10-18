import Constants from 'expo-constants';

interface Config {
  apiUrl: string;
}

const ENV = {
  dev: {
    apiUrl: 'http://localhost:3000/api', // iOS Simulator
  },
  staging: {
    apiUrl: 'https://staging-api.yourcompany.com/api',
  },
  prod: {
    apiUrl: 'https://api.yourcompany.com/api',
  },
};

const getEnvVars = (): Config => {
  // Prioridad: variable de entorno > configuración por defecto
  const apiUrl = Constants.expoConfig?.extra?.apiUrl;

  if (apiUrl) {
    return { apiUrl };
  }

  // Si no hay variable de entorno, usar desarrollo
  if (__DEV__) {
    return ENV.dev;
  }

  return ENV.prod;
};

export default getEnvVars();
