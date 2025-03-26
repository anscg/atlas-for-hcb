export function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export function getHcbConfig() {
  return {
    apiBase: getEnvVar("HCB_API_BASE"),
    clientId: getEnvVar("HCB_CLIENT_ID"),
    redirectUri: getEnvVar("HCB_REDIRECT_URI"),
  };
}
