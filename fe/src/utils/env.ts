export const getEnvValue = (name: string) => {
  const envKey = `MONITORING_APP_${name}`;

  const envValue: string = import.meta.env[envKey] || '';
  if (!envValue) {
    console.error(`Environment value: ${envKey} does not exist`);
  }

  return envValue;
};

export const getRuntimeMode = () => {
  return import.meta.env.MODE;
};
